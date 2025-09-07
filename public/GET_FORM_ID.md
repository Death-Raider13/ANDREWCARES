# 🔍 How to Get the Correct Google Form ID

## The Problem:
Google Forms has different URLs that change when you click different tabs:
- **Share URL**: `https://forms.gle/Vnmm2CpPHiP59Wmd8` (short)
- **Edit URL**: `https://docs.google.com/forms/d/[LONG_ID]/edit` (long)
- **Responses URL**: `https://docs.google.com/forms/d/[LONG_ID]/responses` (long)

## ✅ Simple Solution:

### Method 1: From Your Current Form
1. Go to your form: `https://forms.gle/tEk7627VeeRxnEo58`
2. Click the **"Edit"** button (pencil icon)
3. Look at the URL bar - it should show something like:
   ```
   https://docs.google.com/forms/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
   ```
4. Copy the long ID: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`

### Method 2: From Google Drive
1. Go to [Google Drive](https://drive.google.com)
2. Find your form (search for "Instructor Application" or similar)
3. Right-click the form → **"Get link"**
4. The link will contain the long form ID

### Method 3: From Responses Tab
If you're already in the responses tab and see a URL like:
```
https://docs.google.com/forms/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/responses
```
Just copy the long ID part: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`

## 🔧 Update Your Google Apps Script:

Replace line 700 in your script:
```javascript
const formId = 'YOUR_COPIED_LONG_FORM_ID_HERE';
```

## ⚠️ Important Notes:
- The form ID should be 40+ characters long
- It should NOT start with `1FAIpQLSf` (that's a response ID, not form ID)
- It should look like: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`

## 🧪 Test Function:
Add this to your Google Apps Script to test the form ID:

```javascript
function testFormId() {
  const formId = 'YOUR_FORM_ID_HERE'; // Replace with your actual ID
  
  try {
    const form = FormApp.openById(formId);
    console.log('✅ Form found!');
    console.log('Form title:', form.getTitle());
    console.log('Form URL:', form.getPublishedUrl());
  } catch (error) {
    console.error('❌ Form ID is incorrect:', error);
  }
}
```

Once you have the correct form ID, run `setupFormTrigger()` again and it should work without errors.
