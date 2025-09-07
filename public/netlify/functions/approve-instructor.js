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
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { userId, userEmail, userName } = JSON.parse(event.body);

    try {
        // Set custom claims
        await admin.auth().setCustomUserClaims(userId, {
            instructor_approved: true,
            bank_details_added: false
        });

        // Generate setup token
        const crypto = require('crypto');
        const setupToken = crypto.createHash('sha256').update(userId + Date.now() + Math.random()).digest('hex');

        // Save token to Firestore
        await admin.firestore().collection('instructor_tokens').doc(userId).set({
            token: setupToken,
            email: userEmail,
            name: userName,
            created_at: admin.firestore.FieldValue.serverTimestamp(),
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            used: false
        });

        // Send email notification
        await sendApprovalEmail(userEmail, userName, setupToken);

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ success: true })
        };
    } catch (error) {
        console.error('Approval error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, message: error.message })
        };
    }
};

async function sendApprovalEmail(email, name, token) {
    const setupUrl = `https://andrewcaresvillage.netlify.app/instructor-setup.html?token=${token}`;

    // Enhanced email template with better formatting
    const emailData = {
        service_id: process.env.EMAILJS_SERVICE_ID,
        template_id: process.env.EMAILJS_TEMPLATE_ID,
        user_id: process.env.EMAILJS_PUBLIC_KEY,
        template_params: {
            to_email: email,
            to_name: name,
            subject: "🎉 Welcome to Andrew Cares Village - Instructor Approved!",
            setup_url: setupUrl,
            instructor_name: name || 'there',
            message: `Congratulations ${name}! Your instructor application has been approved. 

You can now:
✅ Create and publish courses
✅ Host live mentoring sessions  
✅ Earn 90% of all payments (we only keep 10%)
✅ Access our instructor dashboard

NEXT STEP: Complete your payment setup to start earning:
${setupUrl}

This link expires in 7 days, so please complete your setup soon.

Welcome to the Andrew Cares Village family!

Best regards,
The Andrew Cares Village Team`
        }
    };

    try {
        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(emailData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Email send failed:', errorText);
            throw new Error(`Email service error: ${response.status}`);
        }

        console.log('Approval email sent successfully to:', email);
        return true;
    } catch (error) {
        console.error('Email error:', error);
        // Don't fail the approval if email fails, but log it
        return false;
    }
}