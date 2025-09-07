/**
 * Google Apps Script for Andrew Cares Village Instructor Application Form
 * This script handles form submissions and forwards them to Netlify function
 * 
 * Setup Instructions:
 * 1. Open Google Apps Script (script.google.com)
 * 2. Create a new project
 * 3. Replace the default code with this script
 * 4. Update the FIREBASE_PROJECT_ID and FIREBASE_WEB_API_KEY with your actual Firebase project details
 * 5. Set up a trigger for the onFormSubmit function
 */

// Configuration - Replace with your Firebase project details
const FIREBASE_PROJECT_ID = 'andrew-cares-village-f4cb6'; // Replace with your actual Firebase project ID
const FIREBASE_WEB_API_KEY = 'AIzaSyAM8S_LtlBaqfp7WoU6xLdaEMIyW_cZHRc'; // Replace with your Firebase Web API key
const ADMIN_EMAIL = 'AndrewCares556@gmail.com';

/**
 * This function is triggered when ANY Google Form is submitted
 * We need to check if it's our specific form
 */
function onFormSubmit(e) {
  try {
    console.log('Form submission triggered');
    
    // Check if this is our specific form
    const expectedFormId = '11YlfJQiKtZsIFg6ASbhZpHlQ4E0S6fDB6bndjcmdsF4';
    const actualFormId = e.source.getId();
    
    if (actualFormId !== expectedFormId) {
      console.log('Ignoring submission from different form:', actualFormId);
      return;
    }
    
    console.log('Processing submission from our instructor application form');

    // Get form responses
    const responses = e.response.getItemResponses();
    const formData = {};

    // Extract form data
    responses.forEach(response => {
      const question = response.getItem().getTitle();
      const answer = response.getResponse();
      formData[question] = answer;
    });

    // Process and save to Firestore
    const success = saveToFirestore(formData);

    if (success) {
      console.log('Successfully processed form submission');
      sendConfirmationEmail(formData);
    } else {
      console.error('Failed to process form submission');
      sendErrorNotification(formData);
    }

  } catch (error) {
    console.error('Error in onFormSubmit:', error);
    sendErrorNotification({ error: error.toString() });
  }
}

/**
 * Save application data directly to Firestore
 */
function saveToFirestore(formData) {
  try {
    // Prepare application data
    const applicationData = {
      // Basic Info
      fullName: formData['Full Name'] || formData.name || '',
      email: formData['Email Address'] || formData.email || '',
      phone: formData['Phone Number'] || formData.phone || '',

      // Professional Info  
      expertise: formData['Area of Expertise'] || formData['Area Of Expertise'] || formData.expertise || '',
      experience: formData['Years of Experience'] || formData['Years Of Experience'] || formData.experience || '',
      qualifications: formData['Qualifications'] || formData['Qualifications '] || formData.qualifications || '',

      // Additional Info
      bio: formData['Professional Bio'] || formData.bio || '',
      portfolio: formData['Portfolio/Website'] || formData.portfolio || '',
      linkedin: formData['LinkedIn Profile'] || formData['LinkedIn Profile '] || formData.linkedin || '',

      // Availability
      availability: formData['Teaching Availability'] || formData['    Teaching Availability  '] || formData.availability || '',
      preferredFormat: formData['Preferred Teaching Format'] || formData['    Preferred Teaching Format   '] || 'Live Sessions',

      // Application metadata
      status: 'pending',
      submittedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      source: 'google_forms',
      applicationId: `APP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    console.log('Prepared application data:', applicationData);

    // Validate required fields
    if (!applicationData.fullName || !applicationData.email || !applicationData.expertise) {
      throw new Error('Missing required fields: Full Name, Email, and Expertise are required');
    }

    // Save to Firestore using REST API
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/instructor_applications?key=${FIREBASE_WEB_API_KEY}`;

    const payload = {
      fields: {}
    };

    // Convert data to Firestore format
    Object.keys(applicationData).forEach(key => {
      const value = applicationData[key];
      if (typeof value === 'string') {
        payload.fields[key] = { stringValue: value };
      } else if (typeof value === 'number') {
        payload.fields[key] = { doubleValue: value };
      } else if (typeof value === 'boolean') {
        payload.fields[key] = { booleanValue: value };
      } else {
        payload.fields[key] = { stringValue: String(value) };
      }
    });

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      payload: JSON.stringify(payload)
    };

    console.log('Sending to Firestore:', firestoreUrl);
    const response = UrlFetchApp.fetch(firestoreUrl, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();

    console.log('Firestore response code:', responseCode);
    console.log('Firestore response:', responseText);

    if (responseCode === 200) {
      // Try to create admin notification (optional - don't fail if it doesn't work)
      try {
        createAdminNotification(applicationData);
      } catch (notificationError) {
        console.warn('Admin notification failed (non-critical):', notificationError);
      }
      return true;
    } else {
      console.error('Firestore error:', responseText);
      return false;
    }

  } catch (error) {
    console.error('Error saving to Firestore:', error);
    return false;
  }
}

/**
 * Create admin notification in Firestore
 */
function createAdminNotification(applicationData) {
  try {
    const notificationData = {
      type: 'new_instructor_application',
      title: 'New Instructor Application',
      message: `${applicationData.fullName} has applied to become an instructor`,
      applicantEmail: applicationData.email,
      expertise: applicationData.expertise,
      createdAt: new Date().toISOString(),
      read: false,
      priority: 'medium'
    };

    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/admin_notifications?key=${FIREBASE_WEB_API_KEY}`;

    const payload = {
      fields: {}
    };

    Object.keys(notificationData).forEach(key => {
      const value = notificationData[key];
      if (typeof value === 'string') {
        payload.fields[key] = { stringValue: value };
      } else if (typeof value === 'boolean') {
        payload.fields[key] = { booleanValue: value };
      }
    });

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      payload: JSON.stringify(payload)
    };

    UrlFetchApp.fetch(firestoreUrl, options);
    console.log('Admin notification created');

  } catch (error) {
    console.error('Failed to create admin notification:', error);
  }
}

/**
 * Generate HTML content for confirmation email
 */
function generateConfirmationEmailHTML(applicantName, applicantEmail, formData) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Application Received - Andrew Cares Village</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; }
        .email-container { max-width: 600px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { font-size: 28px; margin-bottom: 10px; font-weight: 700; }
        .header p { font-size: 16px; opacity: 0.9; }
        .content { padding: 40px 30px; }
        .greeting { font-size: 18px; color: #2c3e50; margin-bottom: 20px; }
        .message { font-size: 16px; color: #555; margin-bottom: 25px; line-height: 1.7; }
        .details-box { background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 25px 0; border-radius: 8px; }
        .details-title { font-size: 16px; font-weight: 600; color: #2c3e50; margin-bottom: 15px; }
        .detail-item { display: flex; justify-content: space-between; margin-bottom: 8px; padding: 5px 0; }
        .detail-label { font-weight: 600; color: #555; }
        .detail-value { color: #333; }
        .timeline-box { background: #e8f4fd; border: 1px solid #bee5eb; padding: 20px; border-radius: 8px; margin: 25px 0; }
        .timeline-title { font-size: 16px; font-weight: 600; color: #0c5460; margin-bottom: 10px; }
        .cta-section { text-align: center; margin: 30px 0; }
        .footer { background: #2c3e50; color: white; padding: 25px 30px; text-align: center; }
        .footer p { font-size: 14px; opacity: 0.8; }
        .social-links { margin-top: 15px; }
        .social-links a { color: white; text-decoration: none; margin: 0 10px; opacity: 0.8; }
        .divider { height: 2px; background: linear-gradient(90deg, #667eea, #764ba2); margin: 20px 0; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>🏛️ Andrew Cares Village</h1>
            <p>Instructor Application Received</p>
        </div>
        
        <div class="content">
            <div class="greeting">Dear ${applicantName},</div>
            
            <div class="message">
                Thank you for your interest in becoming an instructor at Andrew Cares Village! We're excited to review your application and learn more about your expertise.
            </div>
            
            <div class="details-box">
                <div class="details-title">📋 Application Summary</div>
                <div class="detail-item">
                    <span class="detail-label">Applicant Name:</span>
                    <span class="detail-value">${applicantName}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Email Address:</span>
                    <span class="detail-value">${applicantEmail}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Area of Expertise:</span>
                    <span class="detail-value">${formData['Area of Expertise'] || formData.expertise || 'Not specified'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Years of Experience:</span>
                    <span class="detail-value">${formData['Years of Experience'] || formData.experience || 'Not specified'} years</span>
                </div>
            </div>
            
            <div class="timeline-box">
                <div class="timeline-title">⏰ What Happens Next?</div>
                <p>Our team will carefully review your application and get back to you within <strong>3-5 business days</strong>. We'll notify you via email once a decision has been made.</p>
            </div>
            
            <div class="message">
                If you have any questions in the meantime, please don't hesitate to contact us. We appreciate your interest in joining our community of educators!
            </div>
            
            <div class="divider"></div>
            
            <div style="text-align: center; color: #666; font-style: italic;">
                Best regards,<br>
                <strong>The Andrew Cares Village Team</strong>
            </div>
        </div>
        
        <div class="footer">
            <p>© 2024 Andrew Cares Village. All rights reserved.</p>
            <p style="margin-top: 10px; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>`;
}

/**
 * Send confirmation email to applicant
 */
function sendConfirmationEmail(formData) {
  try {
    const applicantEmail = formData['Email Address'] || formData.email;
    const applicantName = formData['Full Name'] || formData.fullName || 'Applicant';

    if (!applicantEmail) {
      console.warn('No email address found for confirmation');
      return;
    }

    const subject = '✅ Application Received - Andrew Cares Village Instructor Program';
    const htmlBody = generateConfirmationEmailHTML(applicantName, applicantEmail, formData);

    GmailApp.sendEmail(
      applicantEmail,
      subject,
      '', // Plain text body (empty since we're using HTML)
      {
        htmlBody: htmlBody,
        name: 'Andrew Cares Village'
      }
    );

    console.log('Confirmation email sent to:', applicantEmail);

  } catch (error) {
    console.error('Error sending confirmation email:', error);
    // Don't throw error to prevent form submission failure
  }
}

// Function to send approval email
function sendApprovalEmail(applicantName, applicantEmail) {
  try {
    console.log(`Starting approval email for ${applicantName} at ${applicantEmail}`);

    const subject = '🎉 Congratulations! Your Instructor Application Has Been Approved';
    const htmlBody = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Application Approved - Andrew Cares Village</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; }
        .email-container { max-width: 600px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { font-size: 32px; margin-bottom: 10px; font-weight: 700; }
        .header p { font-size: 18px; opacity: 0.9; }
        .content { padding: 40px 30px; }
        .greeting { font-size: 20px; color: #2c3e50; margin-bottom: 25px; font-weight: 600; }
        .message { font-size: 16px; color: #555; margin-bottom: 25px; line-height: 1.7; }
        .success-box { background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%); border: 2px solid #28a745; padding: 25px; border-radius: 12px; margin: 30px 0; text-align: center; }
        .success-icon { font-size: 48px; margin-bottom: 15px; }
        .success-title { font-size: 24px; font-weight: 700; color: #155724; margin-bottom: 10px; }
        .success-message { font-size: 16px; color: #155724; }
        .next-steps { background: #f8f9fa; border-left: 4px solid #28a745; padding: 25px; margin: 30px 0; border-radius: 8px; }
        .steps-title { font-size: 18px; font-weight: 600; color: #2c3e50; margin-bottom: 15px; }
        .step-item { margin-bottom: 12px; padding: 8px 0; }
        .step-number { display: inline-block; background: #28a745; color: white; width: 24px; height: 24px; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: bold; margin-right: 10px; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .footer { background: #2c3e50; color: white; padding: 25px 30px; text-align: center; }
        .divider { height: 3px; background: linear-gradient(90deg, #28a745, #20c997); margin: 25px 0; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>🎉 Welcome to the Team!</h1>
            <p>Your instructor application has been approved</p>
        </div>
        
        <div class="content">
            <div class="greeting">Dear ${applicantName},</div>
            
            <div class="success-box">
                <div class="success-icon">✅</div>
                <div class="success-title">Congratulations!</div>
                <div class="success-message">Your application to become an instructor at Andrew Cares Village has been <strong>APPROVED</strong>!</div>
            </div>
            
            <div class="message">
                We're thrilled to welcome you to our community of passionate educators. Your expertise and experience will be invaluable to our students.
            </div>
            
            <div class="next-steps">
                <div class="steps-title">🚀 What's Next?</div>
                <div class="step-item">
                    <span class="step-number">1</span>
                    <strong>Complete Payment Setup:</strong> Add your bank details to receive payments
                </div>
                <div class="step-item">
                    <span class="step-number">2</span>
                    <strong>Complete Your Profile:</strong> Add your bio, photo, and teaching credentials
                </div>
                <div class="step-item">
                    <span class="step-number">3</span>
                    <strong>Create Your First Course:</strong> Share your knowledge with our community
                </div>
                <div class="step-item">
                    <span class="step-number">4</span>
                    <strong>Schedule Live Sessions:</strong> Engage with students in real-time
                </div>
            </div>
            
            <div style="text-align: center;">
                <a href="https://andrewcaresvillage.netlify.app/instructor-setup.html?email=${encodeURIComponent(applicantEmail)}" class="cta-button">Complete Your Setup</a>
            </div>
            
            <div class="divider"></div>
            
            <div style="text-align: center; color: #666;">
                Welcome to the Andrew Cares Village family!<br>
                <strong>The Andrew Cares Village Team</strong>
            </div>
        </div>
        
        <div class="footer">
            <p>© 2024 Andrew Cares Village. All rights reserved.</p>
            <p style="margin-top: 10px; font-size: 12px;">If you have any questions, please contact our support team.</p>
        </div>
    </div>
</body>
</html>`;

    GmailApp.sendEmail(applicantEmail, subject, '', { htmlBody: htmlBody, name: 'Andrew Cares Village' });
    console.log(`✅ Approval email successfully sent to ${applicantEmail}`);

    // Also send to admin for confirmation
    GmailApp.sendEmail(ADMIN_EMAIL.trim(), `✅ Approval Email Sent`, `Approval email was successfully sent to ${applicantName} (${applicantEmail})`);

  } catch (error) {
    console.error('❌ Error sending approval email:', error);
    // Send error notification to admin
    try {
      GmailApp.sendEmail(ADMIN_EMAIL.trim(), '🚨 Approval Email Failed', `Failed to send approval email to ${applicantName} (${applicantEmail}). Error: ${error.message}`);
    } catch (adminError) {
      console.error('Failed to send admin notification:', adminError);
    }
  }
}

// Function to send rejection email
function sendRejectionEmail(applicantName, applicantEmail, reason = '') {
  try {
    console.log(`Starting rejection email for ${applicantName} at ${applicantEmail}`);

    const subject = 'Update on Your Instructor Application - Andrew Cares Village';
    const htmlBody = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Application Update - Andrew Cares Village</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; }
        .email-container { max-width: 600px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #6c757d 0%, #495057 100%); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { font-size: 28px; margin-bottom: 10px; font-weight: 700; }
        .header p { font-size: 16px; opacity: 0.9; }
        .content { padding: 40px 30px; }
        .greeting { font-size: 18px; color: #2c3e50; margin-bottom: 25px; font-weight: 600; }
        .message { font-size: 16px; color: #555; margin-bottom: 25px; line-height: 1.7; }
        .status-box { background: #f8f9fa; border-left: 4px solid #6c757d; padding: 25px; margin: 30px 0; border-radius: 8px; }
        .status-title { font-size: 18px; font-weight: 600; color: #495057; margin-bottom: 15px; }
        .feedback-box { background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 25px 0; }
        .feedback-title { font-size: 16px; font-weight: 600; color: #856404; margin-bottom: 10px; }
        .feedback-content { font-size: 15px; color: #856404; line-height: 1.6; }
        .encouragement-box { background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); border: 2px solid #2196f3; padding: 25px; border-radius: 12px; margin: 30px 0; text-align: center; }
        .encouragement-icon { font-size: 36px; margin-bottom: 15px; }
        .encouragement-title { font-size: 20px; font-weight: 600; color: #1565c0; margin-bottom: 10px; }
        .encouragement-message { font-size: 16px; color: #1976d2; }
        .next-steps { background: #f8f9fa; border-left: 4px solid #17a2b8; padding: 25px; margin: 30px 0; border-radius: 8px; }
        .steps-title { font-size: 18px; font-weight: 600; color: #2c3e50; margin-bottom: 15px; }
        .step-item { margin-bottom: 10px; padding: 5px 0; }
        .step-bullet { color: #17a2b8; font-weight: bold; margin-right: 8px; }
        .footer { background: #2c3e50; color: white; padding: 25px 30px; text-align: center; }
        .divider { height: 2px; background: linear-gradient(90deg, #6c757d, #495057); margin: 25px 0; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>🏛️ Andrew Cares Village</h1>
            <p>Application Status Update</p>
        </div>
        
        <div class="content">
            <div class="greeting">Dear ${applicantName},</div>
            
            <div class="message">
                Thank you for your interest in becoming an instructor at Andrew Cares Village. We appreciate the time and effort you put into your application.
            </div>
            
            <div class="status-box">
                <div class="status-title">📋 Application Decision</div>
                <p>After careful review of your application, we are unable to approve your instructor application at this time.</p>
            </div>
            
            ${reason ? `
            <div class="feedback-box">
                <div class="feedback-title">💡 Feedback for Your Consideration</div>
                <div class="feedback-content">${reason}</div>
            </div>
            ` : ''}
            
            <div class="encouragement-box">
                <div class="encouragement-icon">🌟</div>
                <div class="encouragement-title">Don't Give Up!</div>
                <div class="encouragement-message">We encourage you to continue developing your skills and expertise. You're welcome to reapply in the future.</div>
            </div>
            
            <div class="next-steps">
                <div class="steps-title">🚀 Moving Forward</div>
                <div class="step-item">
                    <span class="step-bullet">•</span>
                    <strong>Keep Learning:</strong> Continue building your expertise in your field
                </div>
                <div class="step-item">
                    <span class="step-bullet">•</span>
                    <strong>Gain Experience:</strong> Consider teaching or mentoring opportunities
                </div>
                <div class="step-item">
                    <span class="step-bullet">•</span>
                    <strong>Stay Connected:</strong> Follow our community for updates and opportunities
                </div>
                <div class="step-item">
                    <span class="step-bullet">•</span>
                    <strong>Reapply Later:</strong> We welcome future applications as you grow
                </div>
            </div>
            
            <div class="message">
                Thank you again for your interest in Andrew Cares Village. We wish you all the best in your educational journey.
            </div>
            
            <div class="divider"></div>
            
            <div style="text-align: center; color: #666;">
                Best regards,<br>
                <strong>The Andrew Cares Village Team</strong>
            </div>
        </div>
        
        <div class="footer">
            <p>© 2024 Andrew Cares Village. All rights reserved.</p>
            <p style="margin-top: 10px; font-size: 12px;">If you have any questions, please contact our support team.</p>
        </div>
    </div>
</body>
</html>`;

    GmailApp.sendEmail(applicantEmail, subject, '', { htmlBody: htmlBody, name: 'Andrew Cares Village' });
    console.log(`✅ Rejection email successfully sent to ${applicantEmail}`);

    // Also send to admin for confirmation
    GmailApp.sendEmail(ADMIN_EMAIL.trim(), `📧 Rejection Email Sent`, `Rejection email was successfully sent to ${applicantName} (${applicantEmail}). Reason: ${reason || 'No specific reason provided'}`);

  } catch (error) {
    console.error('❌ Error sending rejection email:', error);
    // Send error notification to admin
    try {
      GmailApp.sendEmail(ADMIN_EMAIL.trim(), '🚨 Rejection Email Failed', `Failed to send rejection email to ${applicantName} (${applicantEmail}). Error: ${error.message}`);
    } catch (adminError) {
      console.error('Failed to send admin notification:', adminError);
    }
  }
}

// Function to send error notification to admin
function sendErrorNotification(error, originalEvent) {
  try {
    const subject = '🚨 Error in Instructor Application System';
    const body = `An error occurred in the instructor application system:\n\nError: ${error.message || error.error || error}\nStack: ${error.stack || 'No stack trace available'}\n\nOriginal form data:\n${originalEvent && originalEvent.values ? JSON.stringify(originalEvent.values, null, 2) : 'No form data available (test mode)'}\nTimestamp: ${new Date().toISOString()}\n\nPlease check the Google Apps Script logs for more details.`;

    GmailApp.sendEmail(ADMIN_EMAIL.trim(), subject, body);
    console.log('Error notification sent to admin');
  } catch (emailError) {
    console.error('Failed to send error notification:', emailError);
  }
}

// Web App handler function for HTTP requests
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    switch (data.action) {
      case 'sendApprovalEmail':
        sendApprovalEmail(data.applicantName, data.applicantEmail);
        return ContentService
          .createTextOutput(JSON.stringify({ success: true }))
          .setMimeType(ContentService.MimeType.JSON);

      case 'sendRejectionEmail':
        sendRejectionEmail(data.applicantName, data.applicantEmail, data.reason);
        return ContentService
          .createTextOutput(JSON.stringify({ success: true }))
          .setMimeType(ContentService.MimeType.JSON);

      default:
        return ContentService
          .createTextOutput(JSON.stringify({ error: 'Unknown action' }))
          .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    console.error('Error in doPost:', error);
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle OPTIONS requests for CORS preflight
function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}

/**
 * Simple Gmail test - run this FIRST to verify Gmail permissions
 */
function simpleGmailTest() {
  try {
    console.log('Testing basic Gmail functionality...');
    GmailApp.sendEmail('lateefedidi4@gmail.com', 'Gmail Test', 'This is a simple test from Google Apps Script to verify Gmail permissions are working.');
    console.log('✅ Simple Gmail test successful! Check your email.');
  } catch (error) {
    console.error('❌ Simple Gmail test failed:', error);
  }
}

/**
 * Test email functions - run this AFTER simpleGmailTest works
 */
function testEmailFunctions() {
  console.log('Testing email functions...');

  try {
    // Test approval email
    console.log('Testing approval email...');
    sendApprovalEmail('Test User', 'lateefedidi4@gmail.com');

    // Test rejection email
    console.log('Testing rejection email...');
    sendRejectionEmail('Test User', 'lateefedidi4@gmail.com', 'This is a test rejection');

    console.log('Email tests completed. Check your Gmail for test emails.');

  } catch (error) {
    console.error('Error in email tests:', error);
  }
}

/**
 * Test function - run this manually to test the script
 */
function testFormSubmission() {
  console.log('Running test submission...');

  // Create test form data directly (bypassing form event)
  const testFormData = {
    'Full Name': 'John Doe',
    'Email Address': 'lateefedidi4@gmail.com',
    'Phone Number': '+1234567890',
    'Area of Expertise': 'Web Development',
    'Years of Experience': '5',
    'Qualifications': 'Bachelor in Computer Science, Certified Full Stack Developer',
    'Professional Bio': 'Experienced web developer with passion for teaching...',
    'Portfolio/Website': 'https://johndoe.dev',
    'LinkedIn Profile': 'https://linkedin.com/in/johndoe',
    'Teaching Availability': 'Weekends',
    'Preferred Teaching Format': 'Online Courses'
  };

  try {
    // Process and save to Firestore
    const success = saveToFirestore(testFormData);

    if (success) {
      console.log('Test submission successful!');
      sendConfirmationEmail(testFormData);
    } else {
      console.error('Test submission failed');
      sendErrorNotification({ error: 'Test submission failed' });
    }
  } catch (error) {
    console.error('Error in test submission:', error);
    sendErrorNotification({ error: error.toString() });
  }

  console.log('Test completed');
}

/**
 * Helper function - Run this FIRST to create a new form and get the correct ID
 */
function createNewForm() {
  const form = FormApp.create('Andrew Cares Village - Instructor Application');
  
  // Add form fields
  form.addTextItem().setTitle('Full Name').setRequired(true);
  form.addTextItem().setTitle('Email Address').setRequired(true);
  form.addTextItem().setTitle('Phone Number').setRequired(true);
  form.addParagraphTextItem().setTitle('Teaching Experience').setRequired(true);
  form.addParagraphTextItem().setTitle('Subject Areas').setRequired(true);
  form.addParagraphTextItem().setTitle('Why do you want to join Andrew Cares Village?').setRequired(true);
  
  console.log('✅ New form created successfully!');
  console.log('Form ID:', form.getId());
  console.log('Form URL:', form.getPublishedUrl());
  console.log('Edit URL:', form.getEditUrl());
  console.log('Copy the Form ID above and use it in setupFormTrigger()');
  
  return form.getId();
}

/**
 * Setup function - run this AFTER creating the form
 */
function setupFormTrigger() {
  // Use the form ID that actually has responses
  const formId = '11YlfJQiKtZsIFg6ASbhZpHlQ4E0S6fDB6bndjcmdsF4';
  
  try {
    const form = FormApp.openById(formId);
    console.log('Form found:', form.getTitle());

    // Check if trigger already exists
    const triggers = ScriptApp.getProjectTriggers();
    const existingTrigger = triggers.find(trigger => 
      trigger.getHandlerFunction() === 'onFormSubmit' && 
      trigger.getEventType() === ScriptApp.EventType.ON_FORM_SUBMIT
    );
    
    if (existingTrigger) {
      console.log('✅ Form trigger already exists!');
      console.log('Trigger ID:', existingTrigger.getUniqueId());
      console.log('Your instructor application workflow is ready!');
      return;
    }

    // Manual trigger setup - Google Apps Script UI method
    console.log('⚠️ MANUAL SETUP REQUIRED:');
    console.log('1. In Google Apps Script, click "Triggers" (clock icon) in left sidebar');
    console.log('2. Click "+ Add Trigger"');
    console.log('3. Choose function: onFormSubmit');
    console.log('4. Event source: From form');
    console.log('5. Event type: On form submit');
    console.log('6. Click "Save"');
    console.log('');
    console.log('✅ Form is ready for manual trigger setup');
    return;
    
    // Set the trigger source to this specific form
    // Note: The trigger will automatically detect form submissions from any form
    // but we validate the form ID in the onFormSubmit function

    console.log('✅ Form trigger created successfully!');
    console.log('Form ID:', formId);
    console.log('Form title:', form.getTitle());
    console.log('Trigger ID:', trigger.getUniqueId());
    
  } catch (error) {
    console.error('❌ Error setting up trigger:', error);
    console.error('Error details:', error.toString());
  }
}

/**
 * Test function to check if Firestore connection works
 */
function testFirestoreConnection() {
  try {
    console.log('Testing Firestore connection...');
    
    // Test data with correct field names
    const testData = {
      'Full Name': 'Test User',
      'Email Address': 'test@example.com', 
      'Phone Number': '1234567890',
      'Area of Expertise': 'Mathematics',
      'Years of Experience': '5 years',
      'Teaching Experience': 'Test teaching experience',
      'Subject Areas': 'Math, Science',
      'Why do you want to join Andrew Cares Village?': 'Test motivation'
    };
    
    const success = saveToFirestore(testData);
    
    if (success) {
      console.log('✅ Firestore connection working');
      console.log('Check your admin panel for test application');
      sendConfirmationEmail(testData);
    } else {
      console.log('❌ Firestore connection failed');
    }
    
  } catch (error) {
    console.error('Error testing Firestore:', error);
  }
}

/**
 * Debug function to find the correct form with responses
 */
function findFormWithResponses() {
  try {
    console.log('🔍 Searching for forms with responses...');
    
    // Check the form we think we're using
    const currentFormId = '1SDZIeid4FlaLrcSFbWak-u2qwFzGWUXxoeTvILWoE';
    console.log('Checking current form ID:', currentFormId);
    
    try {
      const currentForm = FormApp.openById(currentFormId);
      console.log('Current form title:', currentForm.getTitle());
      console.log('Current form responses:', currentForm.getResponses().length);
      console.log('Current form URL:', currentForm.getPublishedUrl());
    } catch (error) {
      console.log('❌ Current form ID invalid:', error.message);
    }
    
    // List all forms in Drive to find ones with responses
    console.log('📋 Checking all forms in your Google Drive...');
    const files = DriveApp.getFilesByType(MimeType.GOOGLE_FORMS);
    let formsFound = 0;
    
    while (files.hasNext()) {
      const file = files.next();
      try {
        const form = FormApp.openById(file.getId());
        const responses = form.getResponses();
        formsFound++;
        
        console.log(`Form ${formsFound}: "${form.getTitle()}"`);
        console.log(`  ID: ${file.getId()}`);
        console.log(`  Responses: ${responses.length}`);
        console.log(`  URL: ${form.getPublishedUrl()}`);
        
        if (responses.length > 0) {
          console.log('  ✅ HAS RESPONSES!');
          const latest = responses[responses.length - 1];
          console.log(`  Latest response: ${latest.getTimestamp()}`);
          
          // If this form has responses, process them
          console.log('Processing responses from this form...');
          const itemResponses = latest.getItemResponses();
          const formData = {};
          
          itemResponses.forEach(response => {
            const question = response.getItem().getTitle();
            const answer = response.getResponse();
            formData[question] = answer;
            console.log(`  ${question}: ${answer}`);
          });
          
          // Save to Firestore
          const success = saveToFirestore(formData);
          if (success) {
            console.log('✅ Response processed and saved to Firestore!');
          }
        }
        
      } catch (error) {
        console.log(`  ❌ Error accessing form: ${error.message}`);
      }
    }
    
    console.log(`Total forms checked: ${formsFound}`);
    
  } catch (error) {
    console.error('Error finding forms:', error);
  }
}

/**
 * Utility function to get form field mapping
 * Run this to see the structure of your form responses
 */
function debugFormStructure() {
  // This helps you understand the order of fields in your form
  console.log('Form field indices:');
  console.log('0: Timestamp');
  console.log('1: Full Name');
  console.log('2: Email');
  console.log('3: Phone Number');
  console.log('4: Area of Expertise');
  console.log('5: Years of Experience');
  console.log('6: Qualifications');
  console.log('7: Professional Bio');
  console.log('8: Portfolio/Website');
  console.log('9: LinkedIn Profile');
  console.log('10: Teaching Availability');
  console.log('11: Preferred Teaching Format');
}
