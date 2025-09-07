# 🔧 Debug Form Trigger Issues

## Current Status
- ✅ Form ID updated: `1FAIpQLSfb-1lUAH-jkKDfonRpy1v97TCzOs1ctlvHEgf5VuHZzgTOjQ`
- ❌ Applications still not appearing in admin page

## 🚨 **Critical Steps to Fix:**

### **Step 1: Run setupFormTrigger Function**
1. In Google Apps Script, select `setupFormTrigger` from dropdown
2. Click **Run** (▶️)
3. **Check the logs** - should see:
   - `✅ Form trigger created successfully`
   - `Form title: [Your Form Name]`
4. If you see errors, the form ID might still be wrong

### **Step 2: Verify Triggers**
1. In Google Apps Script, click **Triggers** (clock icon in left sidebar)
2. Look for triggers with:
   - **Function:** `onFormSubmit`
   - **Event source:** From form
   - **Event type:** On form submit
3. **Delete any old triggers** pointing to wrong forms
4. Should have exactly **ONE** trigger for your current form

### **Step 3: Test Form Submission**
1. Submit a test application through your form
2. **Immediately check Google Apps Script:**
   - Go to **Executions** (play button icon)
   - Look for recent `onFormSubmit` executions
   - Click on any execution to see logs/errors

### **Step 4: Check Firestore Connection**
The script saves to Firestore collection `instructor_applications`. Verify:
1. Your Firebase project ID is correct: `andrew-cares-village-f4cb6`
2. Your Firebase API key is correct: `AIzaSyAM8S_LtlBaqfp7WoU6xLdaEMIyW_cZHRc`
3. Firestore rules allow writes to `instructor_applications`

### **Step 5: Manual Trigger Setup (If Function Fails)**
If `setupFormTrigger` doesn't work:
1. Go to **Triggers** in Google Apps Script
2. Click **"+ Add Trigger"**
3. Configure:
   - **Choose function:** `onFormSubmit`
   - **Choose deployment:** Head
   - **Select event source:** From form
   - **Select form:** Find your form in the dropdown
   - **Select event type:** On form submit
4. Click **Save**

### **Step 6: Debug Logs**
Add this test function to your script:
```javascript
function testFormConnection() {
  const formId = '1FAIpQLSfb-1lUAH-jkKDfonRpy1v97TCzOs1ctlvHEgf5VuHZzgTOjQ';
  try {
    const form = FormApp.openById(formId);
    console.log('✅ Form found:', form.getTitle());
    console.log('✅ Form URL:', form.getPublishedUrl());
    console.log('✅ Form edit URL:', form.getEditUrl());
  } catch (error) {
    console.error('❌ Form connection failed:', error);
  }
}
```

## 🔍 **Most Likely Issues:**

1. **Trigger not created** - Run `setupFormTrigger` function
2. **Wrong form ID** - Double-check the long ID from edit URL
3. **Multiple triggers** - Delete old triggers, keep only one
4. **Firestore permissions** - Check Firebase rules
5. **Script not deployed** - Redeploy as new version

## ✅ **Success Indicators:**
- ✅ `setupFormTrigger` runs without errors
- ✅ One trigger visible in Triggers tab
- ✅ Form submissions show in Executions tab
- ✅ Applications appear in admin page
- ✅ Confirmation emails are sent

Run `setupFormTrigger` first and check the logs!
