// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require("firebase-functions");

// The Firebase Admin SDK to access Cloud Firestore.
const admin = require("firebase-admin");

const FieldValue = require("firebase-admin").firestore.FieldValue;


exports.sendWelcomeNotification = functions.auth.user().onCreate((user) => {
    const message = {
        notification: {
            title: 'Welcome to DevFest',
            body: 'Thank you for regisetering'
        },
        data: {
            title,
            body,
            click_action: "FLUTTER_NOTIFICATION_CLICK",
            tab: '/home',
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
    sendNotification(message)
});

exports.sendByeNotification = functions.auth.user().onDelete((user) => {
    const message = {
        notification: {
            title: 'Bye from DevFest',
            body: 'Sad to see you go.'
        },
        data: {
            title,
            body,
            click_action: "FLUTTER_NOTIFICATION_CLICK",
            tab: '/main',
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
    sendNotification(message);
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

