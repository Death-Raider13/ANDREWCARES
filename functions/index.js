/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { setGlobalOptions } = require("firebase-functions");
const { onRequest } = require("firebase-functions/https");
const logger = require("firebase-functions/logger");

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });


const functions = require("firebase-functions");
const cloudinary = require("cloudinary").v2;

// Set your Cloudinary credentials in your functions environment
// using the Firebase CLI.
cloudinary.config({
    cloud_name: functions.config().cloudinary.cloud_name,
    api_key: functions.config().cloudinary.api_key,
    api_secret: functions.config().cloudinary.api_secret,
});

exports.getCloudinarySignature = functions.https.onCall(async (data, context) => {
    // Check for authentication
    if (!context.auth) {
        throw new functions.https.HttpsError(
            "unauthenticated",
            "You must be logged in to upload videos.",
        );
    }

    // Optional: You could add a check here to ensure the user is an instructor
    // const userDoc = await admin.firestore().collection('users')
    //   .doc(context.auth.uid).get();
    // if (userDoc.data().role !== 'instructor') {
    //   throw new functions.https.HttpsError(
    //       "permission-denied",
    //       "You must be an instructor to upload videos.",
    //    );
    // }

    const timestamp = Math.round((new Date()).getTime() / 1000);

    // Generate the signature
    const signature = cloudinary.utils.api_sign_request(
        { timestamp: timestamp },
        functions.config().cloudinary.api_secret,
    );

    return { signature, timestamp };
});
