# 🔗 Fix Google Form Connection

## Issue: New applications not appearing in admin page

Your new Google Form (`https://forms.gle/Pk63r64RRwBxoUJU9`) isn't connected to your Google Apps Script.

## ✅ **Solution:**

### **Step 1: Get the correct Form ID**
1. Open your Google Form: `https://forms.gle/Pk63r64RRwBxoUJU9`
2. Look at the URL - you need the long ID from the edit URL
3. Click "Edit" or look for a URL like: `https://docs.google.com/forms/d/[LONG_FORM_ID]/edit`
4. Copy the `[LONG_FORM_ID]` part

### **Step 2: Update your Google Apps Script**
1. Go to your Google Apps Script project
2. Find line 697 in your code:
   ```javascript
   const formId = 'Vnmm2CpPHiP59Wmd8';
   ```
3. Replace with your new form ID:
   ```javascript
   const formId = 'YOUR_NEW_FORM_ID_HERE';
   ```

### **Step 3: Fix the trigger setup**
The current trigger setup is wrong. Replace the `setupFormTrigger` function with:

```javascript
function setupFormTrigger() {
  // Get the form (replace with your actual form ID)
  const formId = 'YOUR_NEW_FORM_ID_HERE';
  const form = FormApp.openById(formId);

  // Delete existing triggers first
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'onFormSubmit') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  // Create new form submit trigger
  ScriptApp.newTrigger('onFormSubmit')
    .form(form)
    .onFormSubmit()
    .create();

  console.log('Form trigger created successfully for form:', formId);
}
```

### **Step 4: Run the setup**
1. In Google Apps Script, select `setupFormTrigger` from the function dropdown
2. Click **Run** (▶️)
3. Grant permissions if prompted
4. Check the logs for "Form trigger created successfully"

### **Step 5: Test**
1. Submit a test application through your form
2. Check your admin page - the application should appear
3. Check Google Apps Script execution logs for any errors

## 🔍 **Alternative: Check existing triggers**
1. In Google Apps Script, go to **Triggers** (clock icon in left sidebar)
2. Look for triggers pointing to `onFormSubmit`
3. Delete old triggers and create new ones for the correct form

## ✅ **Verification**
- ✅ Form submissions appear in admin page
- ✅ Confirmation emails are sent to applicants
- ✅ No errors in Google Apps Script logs

The key issue is that your script is connected to the old form, not the new one you're using in apply.html.
