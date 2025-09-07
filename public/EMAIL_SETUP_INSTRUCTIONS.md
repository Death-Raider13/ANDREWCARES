# Email Notification Setup Instructions

## Overview
This guide explains how to set up email notifications for instructor application approvals and rejections using Google Apps Script.

## 🔧 Setup Steps

### 1. Create Google Apps Script Project

1. Go to [script.google.com](https://script.google.com)
2. Click "New Project"
3. Replace the default code with the content from `google-apps-script/instructor-form-handler.js`
4. Save the project with a meaningful name like "Andrew Cares Village Email Handler"

### 2. Configure Admin Email

In the Google Apps Script file, update the admin email:
```javascript
const ADMIN_EMAIL = 'your-admin-email@andrewcaresvillage.com';
```

### 3. Deploy as Web App

1. Click "Deploy" → "New deployment"
2. Choose type: "Web app"
3. Set execute as: "Me"
4. Set access: "Anyone"
5. Click "Deploy"
6. Copy the Web App URL (it will look like: `https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec`)

### 4. Update Admin Panel

In `admin.html`, replace `YOUR_SCRIPT_ID` with your actual script ID in these locations:

**For Approval Emails:**
```javascript
const response = await fetch('https://script.google.com/macros/s/YOUR_ACTUAL_SCRIPT_ID/exec', {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        action: 'sendApprovalEmail',
        applicantName: applicantName,
        applicantEmail: applicantEmail
    })
});
```

**For Rejection Emails:**
```javascript
const response = await fetch('https://script.google.com/macros/s/YOUR_ACTUAL_SCRIPT_ID/exec', {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        action: 'sendRejectionEmail',
        applicantName: applicantName,
        applicantEmail: applicantEmail,
        reason: reason || ''
    })
});
```

**Important:** The `mode: 'no-cors'` setting prevents CORS errors when calling Google Apps Script from localhost.

### 5. Add Web App Handler Function

Add this function to your Google Apps Script to handle web requests:

```javascript
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    switch(data.action) {
      case 'sendApprovalEmail':
        sendApprovalEmail(data.applicantName, data.applicantEmail);
        return ContentService.createTextOutput(JSON.stringify({success: true}));
        
      case 'sendRejectionEmail':
        sendRejectionEmail(data.applicantName, data.applicantEmail, data.reason);
        return ContentService.createTextOutput(JSON.stringify({success: true}));
        
      default:
        return ContentService.createTextOutput(JSON.stringify({error: 'Unknown action'}));
    }
  } catch (error) {
    console.error('Error in doPost:', error);
    return ContentService.createTextOutput(JSON.stringify({error: error.message}));
  }
}
```

### 6. Grant Permissions

1. Run any function in the script editor to trigger permission prompts
2. Grant the necessary permissions for Gmail access
3. Test the functions to ensure they work

## 📧 Email Templates

The system includes three email types:

1. **Confirmation Email** - Sent when application is submitted (via form trigger)
2. **Approval Email** - Sent when admin approves application
3. **Rejection Email** - Sent when admin rejects application (with optional reason)

## 🧪 Testing

To test the email system:

1. Use the test function in Google Apps Script:
```javascript
function testEmails() {
  sendApprovalEmail('Test User', 'test@example.com');
  sendRejectionEmail('Test User', 'test@example.com', 'Test rejection reason');
}
```

2. Test from admin panel by approving/rejecting a test application

## 🔒 Security Notes

- The Web App is set to execute as you, so emails will be sent from your Gmail account
- Only authenticated requests from your domain should trigger emails
- Consider adding request validation for production use

## 📋 Complete Email Workflow

1. **Application Submitted** → Confirmation email sent automatically
2. **Admin Reviews** → Uses admin panel to approve/reject
3. **Decision Made** → Appropriate email sent via Google Apps Script
4. **Instructor Notified** → Receives approval or rejection email

## ✅ Verification

After setup, verify:
- [ ] Google Apps Script project created and deployed
- [ ] Admin email configured correctly
- [ ] Web App URL updated in admin.html
- [ ] doPost function added to handle requests
- [ ] Permissions granted for Gmail access
- [ ] Test emails working correctly

## 🚨 Troubleshooting

**Common Issues:**
- **403 Forbidden**: Check Web App permissions and deployment settings
- **Emails not sending**: Verify Gmail permissions and admin email address
- **Script not found**: Ensure correct Script ID in admin.html
- **CORS errors**: Web App should be set to "Anyone" access

**Debug Steps:**
1. Check Google Apps Script execution logs
2. Test functions directly in script editor
3. Verify network requests in browser dev tools
4. Check email spam folders
