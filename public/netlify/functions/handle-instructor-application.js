// ===================================
// STEP 1: Netlify Function to Handle Google Forms Webhook
// File: netlify/functions/handle-instructor-application.js
// ===================================

import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { credential } from 'firebase-admin';

// Initialize Firebase Admin (only once)
if (!getApps().length) {
    initializeApp({
        credential: credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
    });
}

const db = getFirestore();

exports.handler = async (event, context) => {
    // Enable CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };

    // Handle preflight OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers };
    }

    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    try {
        console.log('Received request body:', event.body);

        // Parse the incoming data (could be from Google Forms or direct submission)
        let formData;

        try {
            formData = JSON.parse(event.body);
        } catch (parseError) {
            // If it's not JSON, it might be form-encoded data from Google Forms
            const params = new URLSearchParams(event.body);
            formData = Object.fromEntries(params.entries());
        }

        console.log('Parsed form data:', formData);

        // Extract application data (adjust field names to match your Google Form)
        const applicationData = {
            // Basic Info
            fullName: formData.fullName || formData['Full Name'] || formData.name || '',
            email: formData.email || formData['Email Address'] || '',
            phone: formData.phone || formData['Phone Number'] || '',

            // Professional Info
            expertise: formData.expertise || formData['Area of Expertise'] || formData.specialization || '',
            experience: formData.experience || formData['Years of Experience'] || '',
            qualifications: formData.qualifications || formData['Qualifications'] || '',

            // Additional Info
            bio: formData.bio || formData['Professional Bio'] || formData.description || '',
            portfolio: formData.portfolio || formData['Portfolio/Website'] || '',
            linkedin: formData.linkedin || formData['LinkedIn Profile'] || '',

            // Availability
            availability: formData.availability || formData['Teaching Availability'] || '',
            preferredFormat: formData.preferredFormat || formData['Preferred Teaching Format'] || 'Live Sessions',

            // Application metadata
            status: 'pending',
            submittedAt: new Date(),
            createdAt: new Date(),
            source: 'google_forms',

            // Generate a unique application ID
            applicationId: `APP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        };

        // Validate required fields
        if (!applicationData.fullName || !applicationData.email || !applicationData.expertise) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: 'Missing required fields: Full Name, Email, and Expertise are required',
                    received: applicationData
                }),
            };
        }

        // Save to Firestore
        const applicationsRef = db.collection('instructor_applications');
        const docRef = await applicationsRef.add(applicationData);

        console.log('Application saved with ID:', docRef.id);

        // Optional: Send confirmation email to applicant
        try {
            await sendConfirmationEmail(applicationData.email, applicationData.fullName);
        } catch (emailError) {
            console.warn('Failed to send confirmation email:', emailError);
            // Don't fail the entire request if email fails
        }

        // Optional: Notify admin
        try {
            await notifyAdmin(applicationData);
        } catch (notifyError) {
            console.warn('Failed to notify admin:', notifyError);
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                applicationId: docRef.id,
                message: 'Application submitted successfully'
            }),
        };

    } catch (error) {
        console.error('Error processing application:', error);

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Internal server error',
                details: error.message
            }),
        };
    }
};

// Optional: Send confirmation email to applicant
async function sendConfirmationEmail(email, name) {
    // Implement your email service (SendGrid, Mailgun, etc.)
    console.log(`Would send confirmation email to ${email} for ${name}`);
}

// Optional: Notify admin of new application
async function notifyAdmin(applicationData) {
    // Create admin notification
    const notificationData = {
        type: 'new_instructor_application',
        title: 'New Instructor Application',
        message: `${applicationData.fullName} has applied to become an instructor`,
        applicantEmail: applicationData.email,
        expertise: applicationData.expertise,
        createdAt: new Date(),
        read: false,
        priority: 'medium'
    };

    await db.collection('admin_notifications').add(notificationData);
}