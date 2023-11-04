importScripts('https://www.gstatic.com/firebasejs/8.4.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.4.1/firebase-messaging.js');

   /*Update with yours config*/
 const firebaseConfig = {
    apiKey: "AIzaSyBSFicqAo4z_OfQi0hPVXxQhst6NpED45E",
    authDomain: "test2-cloud-functions.firebaseapp.com",
    projectId: "test2-cloud-functions",
    storageBucket: "test2-cloud-functions.appspot.com",
    messagingSenderId: "717544126722",
    appId: "1:717544126722:web:0034936c6de2ac97ca6a1b"
  };
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  /*messaging.onMessage((payload) => {
  console.log('Message received. ', payload);*/
  messaging.onBackgroundMessage(function(payload) {
    console.log('Received background message ', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
      body: payload.notification.body,
    };

    self.registration.showNotification(notificationTitle,
      notificationOptions);
  });