# 🚨 Email Troubleshooting Guide

## Issue: Approval/Rejection Emails Not Being Sent

You've correctly updated the script ID, but emails still aren't working. Here's how to fix it:

## 🔧 **Step-by-Step Troubleshooting:**

### **1. Check Google Apps Script Deployment**

1. Go to your Google Apps Script project
2. Click **"Deploy"** → **"Manage deployments"**
3. Verify your Web App is deployed with these settings:
   - **Execute as:** Me (your email)
   - **Who has access:** Anyone
   - **Status:** Active

### **2. Test Email Functions Directly**

In your Google Apps Script editor:

1. Select the function `testEmailFunctions` from the dropdown
2. Click the **Run** button (▶️)
3. Grant permissions when prompted
4. Check the execution log for errors
5. Check your Gmail for test emails

### **3. Grant Gmail Permissions**

When you run the test function, you'll be prompted to:
1. **Review permissions** - Click "Review permissions"
2. **Choose your Google account**
3. **Click "Advanced"** if you see a warning
4. **Click "Go to [Your Project Name] (unsafe)"**
5. **Click "Allow"** to grant Gmail access

### **4. Check Execution Logs**

In Google Apps Script:
1. Click **"Executions"** in the left sidebar
2. Look for recent executions of `doPost`
3. Click on any execution to see detailed logs
4. Look for error messages or success confirmations

### **5. Verify Admin Email**

Make sure your admin email is correct:
```javascript
const ADMIN_EMAIL = 'AndrewCares556@gmail.com '; // Remove the extra space!
```

**Fix:** Remove the trailing space:
```javascript
const ADMIN_EMAIL = 'AndrewCares556@gmail.com';
```

### **6. Test from Admin Panel**

1. Open your admin panel
2. Try approving/rejecting a test application
3. Check browser console (F12) for any errors
4. Look for network requests to your script URL

### **7. Check Gmail Spam Folder**

- Check your Gmail spam folder
- Check the applicant's spam folder
- Add your script's sending address to safe senders

## 🧪 **Quick Test Steps:**

1. **Copy the updated Google Apps Script code** to your project
2. **Run `testEmailFunctions()`** directly in the script editor
3. **Grant all permissions** when prompted
4. **Check your Gmail** for test emails
5. **Check execution logs** for any errors

## 🔍 **Common Issues:**

### **Issue: "Authorization required"**
- **Solution:** Run any function in the script editor to trigger permission prompts

### **Issue: "Gmail service not available"**
- **Solution:** Enable Gmail API in Google Cloud Console (usually auto-enabled)

### **Issue: "Execution timeout"**
- **Solution:** Simplify email templates or check for infinite loops

### **Issue: No emails received**
- **Solution:** Check spam folders, verify email addresses, check execution logs

## 📧 **Expected Behavior:**

When working correctly, you should receive:
1. **Approval email** to the applicant
2. **Confirmation email** to admin (AndrewCares556@gmail.com)
3. **Success logs** in Google Apps Script execution log

## 🚨 **If Still Not Working:**

1. **Check the execution logs** in Google Apps Script
2. **Look for error emails** in your admin Gmail
3. **Try running `testEmailFunctions()` directly**
4. **Verify the Web App URL** matches what's in admin.html
5. **Check browser network tab** for failed requests

## ✅ **Success Indicators:**

- ✅ Test emails arrive in your Gmail
- ✅ Execution logs show "✅ Email successfully sent"
- ✅ No error messages in browser console
- ✅ Admin receives confirmation emails

Run the `testEmailFunctions()` in your Google Apps Script editor first - this will tell us exactly what's wrong!
