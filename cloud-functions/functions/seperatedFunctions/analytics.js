// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require("firebase-functions");

// The Firebase Admin SDK to access Cloud Firestore.
const admin = require("firebase-admin");


const FieldValue = require("firebase-admin").firestore.FieldValue;

//Http Triggered Functions

exports.sendCouponOnPurchase = functions.analytics.event('in_app_purchase').onLog(async (event) => {
    const user = event.user;
    const uid = user.userId; // The user ID set via the setUserId API.
    const userDetails = await admin.firestore()
        .collection("user").doc(uid)
        .get();
    const { fcmToken } = userDetails.data();
    const title = 'Heres a gift from us';
    const body = 'Enjoy a 20% discount on your next order';
    const message = {
        notification: {
            title,
            body,
        },
        data: {
            title,
            body,
            click_action: "FLUTTER_NOTIFICATION_CLICK",
            tab: '/orders',
            orderId,
        },
        android: {
            notification: {
                sound: "default",
                image:
                    "https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/events/DF22-Bevy-EventThumb%402x_7wlrADr.png",
            },
        },
        fcmToken,
    };
    // For purchases above 500 USD, we send a coupon of higher value.
    if (purchaseValue > 500) {
        return sendNotification(message);
    }
    return null;
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