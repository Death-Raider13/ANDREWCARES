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

    const { email, name, reason, applicationId } = JSON.parse(event.body);

    try {
        // Send rejection email
        const emailData = {
            service_id: process.env.EMAILJS_SERVICE_ID,
            template_id: process.env.EMAILJS_REJECTION_TEMPLATE_ID,
            user_id: process.env.EMAILJS_PUBLIC_KEY,
            template_params: {
                to_email: email,
                to_name: name,
                subject: "Andrew Cares Village - Instructor Application Update",
                instructor_name: name,
                rejection_reason: reason,
                message: `Dear ${name},

Thank you for your interest in becoming an instructor at Andrew Cares Village.

After careful review of your application, we regret to inform you that we cannot approve your instructor application at this time.

Reason for decision:
${reason}

This decision doesn't reflect on your qualifications or potential as an educator. We encourage you to:

📚 Continue developing your expertise in your field
🎯 Gain more teaching or mentoring experience
📝 Consider reapplying in the future with additional qualifications

Alternative ways to engage with our community:
• Join as a member to access our courses and resources
• Participate in our community discussions
• Attend live events and workshops
• Connect with other members in our lounge

We appreciate your interest in Andrew Cares Village and wish you all the best in your educational journey.

If you have any questions about this decision or would like feedback on strengthening a future application, please don't hesitate to contact our support team.

Best regards,
The Andrew Cares Village Team

Application ID: ${applicationId}`
            }
        };

        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(emailData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Rejection email send failed:', errorText);
            throw new Error(`Email service error: ${response.status}`);
        }

        console.log('Rejection email sent successfully to:', email);

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                success: true,
                message: 'Rejection email sent successfully'
            })
        };
    } catch (error) {
        console.error('Rejection email error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                success: false, 
                message: error.message 
            })
        };
    }
};
