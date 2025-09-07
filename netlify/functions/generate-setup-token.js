const admin = require('firebase-admin');
const crypto = require('crypto');

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

    const { applicantEmail, applicantName } = JSON.parse(event.body);

    try {
        // Generate secure setup token
        const setupToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        // Store token in Firestore
        await admin.firestore().collection('setup_tokens').doc(setupToken).set({
            email: applicantEmail,
            name: applicantName,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            expiresAt: expiresAt,
            used: false,
            type: 'instructor_setup'
        });

        // Generate setup URL
        const setupUrl = `https://andrewcaresvillage.netlify.app/instructor-setup.html?token=${setupToken}`;

        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                setupToken: setupToken,
                setupUrl: setupUrl,
                expiresAt: expiresAt.toISOString()
            })
        };
    } catch (error) {
        console.error('Token generation error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                success: false,
                message: error.message
            })
        };
    }
};
