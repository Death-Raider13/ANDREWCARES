const admin = require('firebase-admin');
const fetch = require('node-fetch');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
        })
    });
}

exports.handler = async (event, context) => {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            }
        };
    }

    if (event.httpMethod !== 'POST') {
        return { 
            statusCode: 405, 
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ success: false, message: 'Method Not Allowed' })
        };
    }

    const { token, bank_code, account_number, account_name, business_name } = JSON.parse(event.body);

    try {
        let userId, userEmail;

        if (token) {
            // Token-based setup
            const tokenDoc = await admin.firestore()
                .collection('instructor_tokens')
                .where('token', '==', token)
                .where('used', '==', false)
                .limit(1)
                .get();

            if (tokenDoc.empty) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ success: false, message: 'Invalid or expired token' })
                };
            }

            userId = tokenDoc.docs[0].id;
            userEmail = tokenDoc.docs[0].data().email;

            // Mark token as used
            await tokenDoc.docs[0].ref.update({ used: true });
        } else {
            // Regular authenticated setup
            const authHeader = event.headers.authorization;
            if (!authHeader?.startsWith('Bearer ')) {
                return {
                    statusCode: 401,
                    body: JSON.stringify({ success: false, message: 'Authentication required' })
                };
            }

            const userToken = authHeader.split('Bearer ')[1];
            const decodedToken = await admin.auth().verifyIdToken(userToken);
            userId = decodedToken.uid;
            userEmail = decodedToken.email;
        }

        // Create Paystack subaccount
        const subaccountResponse = await fetch('https://api.paystack.co/subaccount', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                business_name,
                settlement_bank: bank_code,
                account_number,
                percentage_charge: 90 // Instructor gets 90%, platform keeps 10%
            })
        });

        const subaccountData = await subaccountResponse.json();

        if (!subaccountData.status) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    success: false,
                    message: subaccountData.message || 'Failed to create payment account'
                })
            };
        }

        // Update user's custom claims
        await admin.auth().setCustomUserClaims(userId, {
            instructor_approved: true,
            bank_details_added: true,
            subaccount_code: subaccountData.data.subaccount_code
        });

        // Save instructor details to Firestore
        await admin.firestore().collection('instructors').doc(userId).set({
            email: userEmail,
            bank_code,
            account_number,
            account_name,
            business_name,
            subaccount_code: subaccountData.data.subaccount_code,
            subaccount_id: subaccountData.data.id,
            created_at: admin.firestore.FieldValue.serverTimestamp(),
            status: 'active'
        });

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                success: true,
                subaccount_code: subaccountData.data.subaccount_code
            })
        };
    } catch (error) {
        console.error('Setup error:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                success: false,
                message: error.message
            })
        };
    }
};