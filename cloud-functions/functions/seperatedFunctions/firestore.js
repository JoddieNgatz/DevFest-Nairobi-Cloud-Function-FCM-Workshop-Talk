// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require("firebase-functions");

// The Firebase Admin SDK to access Cloud Firestore.
const admin = require("firebase-admin");

const FieldValue = require("firebase-admin").firestore.FieldValue;


// Firestore Triggered Notifications

exports.sendOrderPlacedNotification = functions.firestore
    .document("orders/{orderId}")
    .onCreate(async (snapshot, context) => {
        const orderId = context.params.orderId;

        // Use the snapshot data directly if it contains fcmToken and order data
        const orderData = snapshot.data();
        const fcmToken = orderData.fcmToken; // Assuming fcmToken is part of order data

        // If there's no fcmToken, there's no need to continue.
        if (!fcmToken) {
            console.log('No FCM token found in order data, cannot send notification');
            return null;
        }

        const message = {
            notification: {
                title: 'Order Confirmed',
                body: 'Thank you for placing your order',
            },
            data: {
                click_action: "FLUTTER_NOTIFICATION_CLICK",
                status: 'done',
                orderId: orderId,
            },
            token: fcmToken, // Use 'token' instead of 'fcmToken' as per FCM message structure
            android: {
                notification: {
                    sound: "default",
                },
            },
        };

        // Call the helper function to send the notification
        return await sendNotification(message);
    });

exports.sendOrderUpdatedNotification = functions.firestore
    .document("/orders/{orderId}")
    .onUpdate(async (snapshot, context) => {
        const orderId = context.params.orderId;

        // get the snapshot data directly if it contains fcmToken and order data
        const orderData = snapshot.after.data();
        const fcmToken = orderData.fcmToken;

        // If there's no fcmToken, there's no need to continue.
        if (!fcmToken) {
            console.log('No FCM token found in order data, cannot send notification');
            return null;
        }

        const message = {
            notification: {
                title: 'Order Updated',
                body: 'Thank you, Order again.',
            },
            data: {
                click_action: "FLUTTER_NOTIFICATION_CLICK",
                status: 'done',
                orderId: orderId,
            },
            token: fcmToken,
            android: {
                notification: {
                    sound: "default",
                },
            },
        };

        // Call the helper function to send the notification
        return await sendNotification(message);
    });


exports.sendOrderDeletedNotification = functions.firestore
    .document("/orders/{orderId}").onDelete(async (snapshot, context) => {

        const title = 'Order Canceled';
        const body = 'Order has been deleted. Thank you';


        const orderId = context.params.orderId;

        // get the snapshot data directly if it contains fcmToken and order data
        const orderData = snapshot.data();
        const fcmToken = orderData.fcmToken;

        // If there's no fcmToken, there's no need to continue.
        if (!fcmToken) {
            console.log('No FCM token found in order data, cannot send notification');
            return null;
        }

        const message = {
            notification: {
                title: title,
                body: body,
            },
            data: {
                click_action: "FLUTTER_NOTIFICATION_CLICK",
                status: 'done',
                orderId: orderId,
            },
            token: fcmToken,
            android: {
                notification: {
                    sound: "default",
                },
            },
        };

        // Call the helper function to send the notification
        return await sendNotification(message);
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


