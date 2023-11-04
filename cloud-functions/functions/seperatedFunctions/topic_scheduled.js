// The Firebase Admin SDK to access Cloud Firestore.
const admin = require("firebase-admin");
const functions = require("firebase-functions");
const FieldValue = require("firebase-admin").firestore.FieldValue;


// Cloud Function to send reminders for unpaid orders
exports.unpaidOrdersReminder = functions.pubsub.schedule('0 1 * * *').timeZone('Europe/Stockholm').onRun(async (context) => {
  const currentDate = new Date();
  const dayBefore = new Date(currentDate.setDate(currentDate.getDate() - 1));
  console.log(`Searching for unpaid orders on: ${formatDate(dayBefore)}`);

  try {
    const pendingOrderSnapshot = await admin.firestore()
      .collection("orders")
      .where("status", "==", "pending")
      .where("createdAt", ">=", new Date(dayBefore.setHours(0, 0, 0, 0)))
      .get();

    if (!pendingOrderSnapshot.empty) {
      console.log(`Unpaid orders found: ${pendingOrderSnapshot.size}`);
      pendingOrderSnapshot.forEach((doc) => {
        const orderId = doc.id;
        const { fcmToken, createdAt } = doc.data();
        console.log(`Unpaid order ID: ${orderId}, created at: ${createdAt.toDate()}`);

        if (fcmToken) {
          const notificationTitle = "Complete Your Order";
          const notificationBody = "Reminder to complete your order. Apply this discount code: Complete10 to get 10% off";
          sendNotification(fcmToken, notificationTitle, notificationBody);
        }
      });
    } else {
      console.log("No unpaid orders found for the specified date.");
    }
  } catch (error) {
    console.error("An error occurred while sending reminders for unpaid orders:", error);
  }
  return null; // Cloud Functions should return a value or a promise
});

// Helper function to format date to string
const formatDate = (date) => {
  const day = `0${date.getDate()}`.slice(-2);
  const month = `0${date.getMonth() + 1}`.slice(-2); // Months are 0-indexed
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};


exports.pubSub = functions.pubsub.topic("pubSub")
  .onPublish(async (message) => {
    const payload = JSON.parse(Buffer.from(message.data, 'base64').toString());

    const fcmMessage = {
      notification: {
        title: payload.title,
        body: payload.body
      },
      token: payload.token // or use `topic: '/topics/your-topic'` if you're sending to a topic
    };

    try {
      // Send a message to the device corresponding to the provided registration token
      const response = await admin.messaging().send(fcmMessage);
      console.log('Successfully sent message:', response);
    } catch (error) {
      console.error('Error sending FCM message:', error);
    }
  });


//send combined message notification to single device
function sendNotification(token, notificationTitle, notificationBody) {
  const fcmMessage = {
    notification: {
      title: notificationTitle,
      body: notificationBody
    },
    token: token // or use `topic: '/topics/your-topic'` if you're sending to a topic
  };
  admin
    .messaging()
    .send(fcmMessage)
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
