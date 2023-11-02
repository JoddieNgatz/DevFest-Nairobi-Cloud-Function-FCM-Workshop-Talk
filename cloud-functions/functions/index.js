// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require("firebase-functions");

// The Firebase Admin SDK to access Cloud Firestore.
const admin = require("firebase-admin");

admin.initializeApp();

const FieldValue = require("firebase-admin").firestore.FieldValue;

exports.helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", { structuredData: true });
  response.send("Hello from Firebase!");
});


// Firestore Triggered Notifications

exports.sendOrderPlacedNotification = functions.firestore
  .document("/Orders/{orderId}")
  .onCreate(async (snapshot, context) => {
    functions.logger.info("Hello logs!", { structuredData: true });
    response.send("Hello from Firebase!");
  });

exports.sendOrderUpdatedNotification = functions.firestore
  .document("/Orders/{orderId}")
  .onUpdate(async (snapshot, context) => {

    //When an order document is updated in firestore

    //send single notification
     
    //send multicast notifications
  });


//send combined message notification to single device
function sendNotification(token, orderId, title, body, tab) {
  const message = {
    notification: {
      title,
      body,
    },
    data: {
      title,
      body,
      click_action: "FLUTTER_NOTIFICATION_CLICK",
      tab: tab,
      orderId,
    },
    android: {
      notification: {
        sound: "default",
        image:
          "https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/events/DF22-Bevy-EventThumb%402x_7wlrADr.png",
      },
    },
    token,
  };
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





//send new reward notification to a user
function multicastNotifications(tokens, title, body, tab, orderId) {
  try {
    const message = {
      notification: {
        title,
        body,
      },
      data: {
        click_action: "FLUTTER_NOTIFICATION_CLICK",
        tab: tab,
        orderId,
      },
      android: {
        notification: {
          sound: "default",
          image:
            "https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/events/DF22-Bevy-EventThumb%402x_7wlrADr.png",
        },
      },
      tokens,
    };
    admin
      .messaging()
      .sendMulticast(message)
      .then((response) => {
        console.log("Successfully sent message:", response);
        if (response.failureCount > 0) {
          const failedTokens = [];
          response.responses.forEach((resp, idx) => {
            if (!resp.success) {
              failedTokens.push(tokens[idx]);
            }
          });
          console.log("List of tokens that caused failures: " + failedTokens);
        }
        return;
      })
      .catch((error) => {
        console.log("Error sending multicast notification:", error);
        return;
      });
  } catch (err) {
    console.log("Error sending multicast notification:", err);
  }
}
