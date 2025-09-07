# 🔍 Debug Form Submission Issue

## Problem: Form submitted but not appearing in admin panel

### Step 1: Check Google Apps Script Execution Logs
1. Go to your Google Apps Script project
2. Click "Executions" (play button icon) in left sidebar
3. Look for recent executions of `onFormSubmit` function
4. Check if there are any errors or if the function didn't run at all

### Step 2: Manual Test Function
Add this test function to your Google Apps Script to check Firestore connection:

```javascript
function testFirestoreConnection() {
  try {
    console.log('Testing Firestore connection...');
    
    // Test data
    const testData = {
      fullName: 'Test User',
      email: 'test@example.com',
      phone: '1234567890',
      experience: 'Test experience',
      subjects: 'Test subjects',
      motivation: 'Test motivation',
      status: 'pending',
      submittedAt: new Date().toISOString()
    };
    
    const success = saveToFirestore(testData);
    
    if (success) {
      console.log('✅ Firestore connection working');
      console.log('Check your admin panel for test application');
    } else {
      console.log('❌ Firestore connection failed');
    }
    
  } catch (error) {
    console.error('Error testing Firestore:', error);
  }
}
```

### Step 3: Check Firestore Rules
Your Firestore security rules might be blocking writes. Check if you have:

```javascript
// In Firestore Rules
allow write: if request.auth != null || 
  resource == null && 
  request.resource.data.keys().hasAll(['fullName', 'email']);
```

### Step 4: Check Admin Panel Firebase Connection
In browser console on admin.html, check for Firebase errors:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for Firebase connection errors
4. Check if `instructor_applications` collection is being queried

### Step 5: Manual Firestore Check
1. Go to Firebase Console → Firestore Database
2. Look for `instructor_applications` collection
3. Check if any documents were created

## Quick Fix Options:

### Option A: Test with Manual Data
Run `testFirestoreConnection()` in Google Apps Script to bypass form trigger.

### Option B: Check Trigger Association
The trigger might not be associated with your specific form. In Google Apps Script:
1. Go to Triggers tab
2. Check if the trigger shows the correct form ID
3. If not, delete and recreate the trigger

### Option C: Alternative Trigger Method
If form triggers aren't working, we can use a time-based trigger that checks for new responses every minute.
