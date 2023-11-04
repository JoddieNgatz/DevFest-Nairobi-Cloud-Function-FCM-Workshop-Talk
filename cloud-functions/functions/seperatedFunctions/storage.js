// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require("firebase-functions");

// The Firebase Admin SDK to access Cloud Firestore.
const admin = require("firebase-admin");

const FieldValue = require("firebase-admin").firestore.FieldValue;

//Http Triggered Functions

exports.backup = functions.storage.object().onFinalize(async (object) => {
    const { bucket, name } = object;

    console.log(`New file ${name} was created in ${bucket}`);

    const body = (`New file ${name} was created in ${bucket}`);

    // Here you might add code to process the file
    // For example, let's say we want to check the size of the file:
    try {
        const file = storage.bucket(bucket).file(name);
        const [metadata] = await file.getMetadata();

        console.log(`File size: ${metadata.size} bytes`);
        const adminSnapshot = await admin.firestore()
            .collection("admin")
            .get();
        let tokens = [];
        if (!adminSnapshot.empty) {
            console.log(`Admins found: ${adminSnapshot.size}`);
            adminSnapshot.forEach((doc) => {
                const id = doc.id;
                const { fcmToken = null } = doc.data();
                tokens.push(fcmToken);
            });
        }
        if (tokens.length > 1) {
            multicastNotifications(tokens, 'Successful Upload', body, '/files')
        }
    } catch (error) {
        console.error(`Failed to process file ${name} in bucket ${bucket}`, error);
    }
});



exports.backupArchived = functions.storage.object().onArchive(async (object) => {
    const { bucket, name } = object;

    const body = (`Archived file ${name} was archived in ${bucket}`);

    // Here you might add code to process the file
    // For example, let's say we want to check the size of the file:
    try {
        const file = storage.bucket(bucket).file(name);
        const [metadata] = await file.getMetadata();

        console.log(`File size: ${metadata.size} bytes`);
        const adminSnapshot = await admin.firestore()
            .collection("admin")
            .get();
        let tokens = [];
        if (!adminSnapshot.empty) {
            console.log(`Admins found: ${adminSnapshot.size}`);
            adminSnapshot.forEach((doc) => {
                const id = doc.id;
                const { fcmToken = null } = doc.data();
                tokens.push(fcmToken);
            });
        }
        if (tokens.length > 1) {
            multicastNotifications(tokens, 'Successful Archive', body, '/files')
        }
    } catch (error) {
        console.error(`Failed to process file ${name} in bucket ${bucket}`, error);
    }
});

exports.backupDeleted = functions.storage.object().onDelete(async (object) => {
    const { bucket, name } = object;
    const body = (`New file ${name} was deleted in ${bucket}`);

    // Here you might add code to process the file
    // For example, let's say we want to check the size of the file:
    try {
        const file = storage.bucket(bucket).file(name);
        const [metadata] = await file.getMetadata();

        console.log(`File size: ${metadata.size} bytes`);
        const adminSnapshot = await admin.firestore()
            .collection("admin")
            .get();
        let tokens = [];
        if (!adminSnapshot.empty) {
            console.log(`Admins found: ${adminSnapshot.size}`);
            adminSnapshot.forEach((doc) => {
                const id = doc.id;
                const { fcmToken = null } = doc.data();
                tokens.push(fcmToken);
            });
        }
        if (tokens.length > 1) {
            multicastNotifications(tokens, 'Successful Deletion', body, '/files')
        }
    } catch (error) {
        console.error(`Failed to process file ${name} in bucket ${bucket}`, error);
    }
});



//send new reward notification to a user
function multicastNotifications(tokens, title, body, tab,) {
    try {
        const message = {
            notification: {
                title,
                body,
            },
            data: {
                click_action: "FLUTTER_NOTIFICATION_CLICK",
                tab: '/orders',
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


