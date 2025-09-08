const admin = require('firebase-admin');
const fs = require('fs');

// Initialize Firebase Admin
const serviceAccount = require('./path-to-service-account-key.json'); // You'll need to add your service account key

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://andrew-cares-village-f4cb6.firebaseio.com'
});

// Read and deploy Firestore rules
const rulesContent = fs.readFileSync('./public/firestore.rules', 'utf8');

admin.securityRules().releaseFirestoreRulesetFromSource(rulesContent)
  .then((ruleset) => {
    console.log('Firestore rules deployed successfully:', ruleset.name);
  })
  .catch((error) => {
    console.error('Error deploying Firestore rules:', error);
  });
