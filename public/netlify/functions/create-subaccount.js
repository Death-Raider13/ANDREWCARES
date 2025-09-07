const admin = require('firebase-admin');

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
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { userId, businessName, bankCode, accountNumber, accountName } = JSON.parse(event.body);

    try {
        // Create Paystack subaccount
        const subaccountResponse = await fetch('https://api.paystack.co/subaccount', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                business_name: businessName,
                settlement_bank: bankCode,
                account_number: accountNumber,
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
            userId: userId,
            businessName: businessName,
            bankCode: bankCode,
            accountNumber: accountNumber,
            accountName: accountName,
            subaccountCode: subaccountData.data.subaccount_code,
            subaccountId: subaccountData.data.id,
            percentageCharge: 90,
            platformCharge: 10,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            status: 'active'
        });

        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                subaccountCode: subaccountData.data.subaccount_code,
                message: 'Payment account created successfully'
            })
        };
    } catch (error) {
        console.error('Subaccount creation error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                success: false,
                message: error.message
            })
        };
    }
};