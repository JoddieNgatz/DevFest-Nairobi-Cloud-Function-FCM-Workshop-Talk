// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require("firebase-functions");

// The Firebase Admin SDK to access Cloud Firestore.
const admin = require("firebase-admin");

admin.initializeApp();

const FieldValue = require("firebase-admin").firestore.FieldValue;
// Imports the Google Cloud client library
const { PubSub } = require('@google-cloud/pubsub');
// Creates a client; cache this for further use
const pubSubClient = new PubSub();

//Import functions from diffrent files.
const analytics = require("./seperatedFunctions/analytics");
const auth = require("./seperatedFunctions/auth");
const firestore = require("./seperatedFunctions/firestore");
const storage = require("./seperatedFunctions/storage");
const topic_scheduled = require("./seperatedFunctions/topic_scheduled");

//other functions

exports.sendCouponOnPurchase = analytics.sendCouponOnPurchase;

exports.sendWelcomeNotification = auth.sendWelcomeNotification;
exports.sendByeNotification = auth.sendByeNotification;

exports.sendOrderPlacedNotification = firestore.sendOrderPlacedNotification;
exports.sendOrderUpdatedNotification = firestore.sendOrderUpdatedNotification;
exports.sendOrderDeletedNotification = firestore.sendOrderDeletedNotification;
exports.sendOrderUpdatedNotification = firestore.sendOrderUpdatedNotification;

exports.backup = storage.backup;
exports.backupArchived = storage.backupArchived;
exports.backupDeleted = storage.backupDeleted;

exports.scheduler = topic_scheduled.unpaidOrdersReminder;
exports.pubSub = topic_scheduled.pubSub;


//Http Triggered Functions

exports.helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", { structuredData: true });
  response.send("Hello from Devfest!");
});



exports.sendNotification = functions.https.onRequest(async (request, response) => {
  functions.logger.info("Hello logs!", { structuredData: true });

  const data = request.body;
  // Call the helper function to send the notification
  await sendNotification(data);
  console.log('Hello from Devfest: ', data);
  response.send("Devfest!");

});


exports.sendNNewHello = functions.https.onRequest(async (request, response) => {
  functions.logger.info("Hello Devfest!", { structuredData: true });

  console.log('Hello from Devfest: ', data);
  response.send("Devfest!");

});


// Register an HTTP function with the Functions Framework
exports.webHook = functions.https.onRequest((request, response) => {
  // Check for POST request
  if (request.method !== 'POST') {
    response.status(405).send('Method Not Allowed');
    return;
  }

  try {
    // Process the webhook payload
    const data = request.body;
    console.log('Received webhook payload:', data);

    // TODO: Add your webhook logic here

    // Responding to the webhook
    response.status(200).send('Webhook received successfully!');
  } catch (e) {
    console.error('Error processing webhook', e);
    response.status(500).send('Internal Server Error');
  }
});


exports.publishToTopic = functions.https.onRequest(async (request, response) => {
  if (request.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {

    const pubSubClient = PubSub();
    const topicName = 'pubSub';
    const data = JSON.stringify(request.body);
    const dataBuffer = Buffer.from(data);

    const messageId = await pubSubClient.topic(topicName).publish(dataBuffer);
    response.status(200).send(`Message ${messageId} published.`);
  } catch (error) {
    console.error('Error publishing to Pub/Sub', error);
    response.status(500).send('Internal Server Error');
  }
});


//send combined message notification to single device
function sendNotification(message) {
  admin
    .messaging()
    .send(message)
    .then((response) => {
      console.log("Successfully sent message:", response);
      return;
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.log("Error sending message:", error);
      return;
    });
}
