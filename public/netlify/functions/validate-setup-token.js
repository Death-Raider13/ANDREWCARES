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

    const { token } = JSON.parse(event.body);

    try {
        const tokenDoc = await admin.firestore()
            .collection('setup_tokens')
            .doc(token)
            .get();

        if (!tokenDoc.exists) {
            return {
                statusCode: 200,
                body: JSON.stringify({ valid: false, reason: 'Token not found' })
            };
        }

        const tokenData = tokenDoc.data();
        const now = new Date();

        if (tokenData.used) {
            return {
                statusCode: 200,
                body: JSON.stringify({ valid: false, reason: 'Token already used' })
            };
        }

        if (now > tokenData.expiresAt.toDate()) {
            return {
                statusCode: 200,
                body: JSON.stringify({ valid: false, reason: 'Token expired' })
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                valid: true,
                userEmail: tokenData.email,
                userName: tokenData.name,
                token: token
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ valid: false, error: error.message })
        };
    }
};