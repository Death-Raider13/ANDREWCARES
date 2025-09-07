const admin = require('firebase-admin');

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: 'https://andrew-cares-village-f4cb6-default-rtdb.firebaseio.com'
    });
}

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { email, name, applicationId } = JSON.parse(event.body);

    try {
        // Send welcome email
        const emailData = {
            service_id: process.env.EMAILJS_SERVICE_ID,
            template_id: process.env.EMAILJS_WELCOME_TEMPLATE_ID,
            user_id: process.env.EMAILJS_PUBLIC_KEY,
            template_params: {
                to_email: email,
                to_name: name,
                subject: "🎉 Welcome to Andrew Cares Village - You're Now an Instructor!",
                instructor_name: name,
                message: `Welcome to the Andrew Cares Village family, ${name}!

Your instructor application has been approved and you're now part of our exclusive community of educators and mentors.

🎯 What you can do now:
• Create and publish courses
• Host live mentoring sessions
• Earn 90% of all student payments
• Access our instructor dashboard
• Connect with other instructors

📚 Getting Started:
1. Complete your payment setup (if you haven't already)
2. Create your first course
3. Set your availability for mentoring sessions
4. Join our instructor community chat

💰 Earning Structure:
• You keep 90% of all payments
• We handle all payment processing
• Automatic payouts to your bank account
• Transparent earnings dashboard

🔗 Quick Links:
• Instructor Dashboard: https://andrewcaresvillage.netlify.app/instructor.html
• Create Course: https://andrewcaresvillage.netlify.app/course-editor.html
• Community: https://andrewcaresvillage.netlify.app/lounge.html

If you have any questions, don't hesitate to reach out to our support team.

Welcome aboard!

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
            console.error('Welcome email send failed:', errorText);
            throw new Error(`Email service error: ${response.status}`);
        }

        console.log('Welcome email sent successfully to:', email);

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                success: true,
                message: 'Welcome email sent successfully'
            })
        };
    } catch (error) {
        console.error('Welcome email error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                success: false, 
                message: error.message 
            })
        };
    }
};
