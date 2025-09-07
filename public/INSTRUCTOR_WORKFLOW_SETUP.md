# Instructor Application Workflow - Complete Setup Guide

## Overview
This system provides a complete instructor application workflow from Google Forms submission to Paystack payment setup with automatic 90/10 revenue split.

## Workflow Steps
1. **Application Submission** → Google Form → Netlify Function → Firestore
2. **Admin Review** → Admin Dashboard → Approve/Reject
3. **Email Notification** → EmailJS → Setup Link (7-day expiry)
4. **Payment Setup** → Bank Details → Paystack Subaccount (90/10 split)
5. **Instructor Dashboard** → Course Creation & Earnings

## Required Environment Variables

### Netlify Environment Variables
Add these to your Netlify site settings:

```bash
# Firebase Admin SDK
FIREBASE_PROJECT_ID=andrew-cares-village-f4cb6
FIREBASE_CLIENT_EMAIL=your-firebase-admin-email@andrew-cares-village-f4cb6.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----"
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"andrew-cares-village-f4cb6",...}

# Paystack (for payment processing)
PAYSTACK_SECRET_KEY=sk_test_your_paystack_secret_key_here
PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key_here

# EmailJS (for email notifications)
EMAILJS_SERVICE_ID=your_emailjs_service_id
EMAILJS_PUBLIC_KEY=your_emailjs_public_key
EMAILJS_TEMPLATE_ID=template_instructor_approval
EMAILJS_WELCOME_TEMPLATE_ID=template_instructor_welcome
EMAILJS_REJECTION_TEMPLATE_ID=template_instructor_rejection
```

## Google Form Setup

### 1. Create Google Form
Create a form with these fields (exact names matter for the webhook):
- **Full Name** (Text)
- **Email Address** (Email)
- **Phone Number** (Text)
- **Area of Expertise** (Text)
- **Years of Experience** (Text)
- **Qualifications** (Paragraph)
- **Professional Bio** (Paragraph)
- **Portfolio/Website** (Text)
- **LinkedIn Profile** (Text)
- **Teaching Availability** (Multiple choice)
- **Preferred Teaching Format** (Multiple choice)

### 2. Set Up Form Webhook
1. Install Google Apps Script trigger
2. Add this script to forward submissions:

```javascript
function onFormSubmit(e) {
  const formData = {
    fullName: e.values[1],
    email: e.values[2],
    phone: e.values[3],
    expertise: e.values[4],
    experience: e.values[5],
    qualifications: e.values[6],
    bio: e.values[7],
    portfolio: e.values[8],
    linkedin: e.values[9],
    availability: e.values[10],
    preferredFormat: e.values[11]
  };
  
  UrlFetchApp.fetch('https://your-site.netlify.app/.netlify/functions/handle-instructor-application', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    payload: JSON.stringify(formData)
  });
}
```

### 3. Update apply.html
Replace the Google Form URL in apply.html:
```javascript
const googleFormUrl = "https://forms.gle/YOUR_FORM_ID_HERE";
```

## Firestore Collections Structure

### instructor_applications
```javascript
{
  fullName: "John Doe",
  email: "john@example.com",
  phone: "+1234567890",
  expertise: "Web Development",
  experience: "5 years",
  qualifications: "Bachelor's in Computer Science, AWS Certified",
  bio: "Experienced developer...",
  portfolio: "https://johndoe.dev",
  linkedin: "https://linkedin.com/in/johndoe",
  availability: "Weekends",
  preferredFormat: "Live Sessions",
  status: "pending", // pending, approved, rejected
  submittedAt: timestamp,
  source: "google_forms",
  applicationId: "APP_1234567890_abc123"
}
```

### instructor_tokens
```javascript
{
  token: "hashed_token_string",
  email: "john@example.com",
  name: "John Doe",
  created_at: timestamp,
  expires_at: timestamp,
  used: false
}
```

### instructors
```javascript
{
  userId: "firebase_user_id",
  businessName: "John's Tutoring",
  bankCode: "044",
  accountNumber: "1234567890",
  accountName: "John Doe",
  subaccountCode: "ACCT_paystack_code",
  subaccountId: 12345,
  percentageCharge: 90,
  platformCharge: 10,
  createdAt: timestamp,
  status: "active"
}
```

## EmailJS Templates

### Approval Email Template
```
Subject: 🎉 Welcome to Andrew Cares Village - Instructor Approved!

Dear {{instructor_name}},

{{message}}

Setup Link: {{setup_url}}

Best regards,
The Andrew Cares Village Team
```

### Welcome Email Template
```
Subject: 🎉 Welcome to Andrew Cares Village - You're Now an Instructor!

Dear {{instructor_name}},

{{message}}

Best regards,
The Andrew Cares Village Team
```

### Rejection Email Template
```
Subject: Andrew Cares Village - Instructor Application Update

Dear {{instructor_name}},

{{message}}

Reason: {{rejection_reason}}

Best regards,
The Andrew Cares Village Team
```

## Paystack Setup

### 1. Create Paystack Account
- Sign up at https://paystack.com
- Get your test/live API keys
- Add webhook URL: `https://your-site.netlify.app/.netlify/functions/verify-payment`

### 2. Revenue Split Configuration
- Instructors receive: **90%** of payments
- Platform keeps: **10%** commission
- Automatic settlement to instructor bank accounts
- Real-time earnings tracking

## Testing the Complete Workflow

### 1. Test Application Submission
```bash
curl -X POST https://your-site.netlify.app/.netlify/functions/handle-instructor-application \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test Instructor",
    "email": "test@example.com",
    "expertise": "Mathematics",
    "experience": "3 years",
    "bio": "Experienced math tutor"
  }'
```

### 2. Test Admin Approval
1. Go to admin.html → Applications tab
2. View application details
3. Click "Approve" → Should send email with setup link

### 3. Test Payment Setup
1. Click setup link from email
2. Enter bank details
3. Complete setup → Should create Paystack subaccount

### 4. Verify Integration
- Check Firestore for application status updates
- Verify email delivery in EmailJS dashboard
- Confirm subaccount creation in Paystack dashboard

## Security Considerations

### Firebase Security Rules
```javascript
// instructor_applications collection
match /instructor_applications/{applicationId} {
  allow read, write: if request.auth != null && 
    (request.auth.token.admin == true || 
     request.auth.uid == resource.data.userId);
}

// instructors collection
match /instructors/{instructorId} {
  allow read, write: if request.auth != null && 
    (request.auth.token.admin == true || 
     request.auth.uid == instructorId);
}
```

### Environment Security
- Never commit API keys to version control
- Use Netlify environment variables for all secrets
- Rotate keys regularly
- Use test keys for development

## Troubleshooting

### Common Issues

1. **Google Form not submitting to webhook**
   - Check Apps Script trigger is active
   - Verify webhook URL is correct
   - Check Netlify function logs

2. **Emails not sending**
   - Verify EmailJS service is active
   - Check template IDs match
   - Confirm environment variables are set

3. **Paystack subaccount creation fails**
   - Verify bank details are correct
   - Check Paystack API key permissions
   - Ensure account verification passed

4. **Firebase permissions errors**
   - Check Firestore security rules
   - Verify Firebase Admin SDK setup
   - Confirm service account permissions

### Debug Commands
```bash
# Check Netlify function logs
netlify functions:log handle-instructor-application

# Test Firebase connection
firebase firestore:get instructor_applications

# Verify Paystack connection
curl -H "Authorization: Bearer sk_test_..." https://api.paystack.co/bank
```

## Deployment Checklist

- [ ] Environment variables configured in Netlify
- [ ] Google Form webhook active
- [ ] EmailJS templates created
- [ ] Paystack account verified
- [ ] Firebase security rules updated
- [ ] Test complete workflow
- [ ] Monitor error logs

## Support

For issues with this workflow:
1. Check Netlify function logs
2. Verify all environment variables
3. Test each step individually
4. Review Firebase/Paystack/EmailJS dashboards
5. Contact support with specific error messages

---

**Revenue Split Summary:**
- **Instructors earn 90%** of all payments
- **Platform keeps 10%** for processing and maintenance
- Automatic payouts via Paystack
- Real-time earnings tracking
- No hidden fees or charges
