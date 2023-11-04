// import 'package:cloud_firestore/cloud_firestore.dart';
// import 'package:firebase_core/firebase_core.dart';
// import 'package:firebase_messaging/firebase_messaging.dart';
// import 'package:flutter/material.dart';

// import 'firebase_options.dart';

// Future<void> main() async {
//   WidgetsFlutterBinding.ensureInitialized();
//   await Firebase.initializeApp(
//     options: DefaultFirebaseOptions.currentPlatform,
//   );
//   FirebaseMessaging.onBackgroundMessage(_backgroundMessageHandler);
//   runApp(const MyApp());
// }

// Future<void> _backgroundMessageHandler(RemoteMessage message) async {
//   print("Handling a background message: ${message.notification?.body}");
// }

// class MyApp extends StatelessWidget {
//   const MyApp({super.key});

//   // This widget is the root of your application.
//   @override
//   Widget build(BuildContext context) {
//     return MaterialApp(
//       title: 'Flutter Notifications Demo',
//       theme: ThemeData(
//         // This is the theme of your application.
//         //
//         // TRY THIS: Try running your application with "flutter run". You'll see
//         // the application has a blue toolbar. Then, without quitting the app,
//         // try changing the seedColor in the colorScheme below to Colors.green
//         // and then invoke "hot reload" (save your changes or press the "hot
//         // reload" button in a Flutter-supported IDE, or press "r" if you used
//         // the command line to start the app).
//         //
//         // Notice that the counter didn't reset back to zero; the application
//         // state is not lost during the reload. To reset the state, use hot
//         // restart instead.
//         //
//         // This works for code too, not just values: Most code changes can be
//         // tested with just a hot reload.
//         colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
//         useMaterial3: true,
//       ),
//       home: const MyHomePage(title: 'Flutter Notification Demo Home Page'),
//     );
//   }
// }

// class MyHomePage extends StatefulWidget {
//   const MyHomePage({super.key, required this.title});

//   // This widget is the home page of your application. It is stateful, meaning
//   // that it has a State object (defined below) that contains fields that affect
//   // how it looks.

//   // This class is the configuration for the state. It holds the values (in this
//   // case the title) provided by the parent (in this case the App widget) and
//   // used by the build method of the State. Fields in a Widget subclass are
//   // always marked "final".

//   final String title;

//   @override
//   State<MyHomePage> createState() => _MyHomePageState();
// }

// class _MyHomePageState extends State<MyHomePage> {
//   int _counter = 0;
//   String _fcmToken = '';
//   bool recievedNotification = false;
//   String notificationBody = '';
//   String notificationTitle = '';
//   final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;
//   bool _orderPlaced = false;
//   Future<void> _incrementCounter() async {
//     setState(() {
//       // This call to setState tells the Flutter framework that something has
//       // changed in this State, which causes it to rerun the build method below
//       // so that the display can reflect the updated values. If we changed
//       // _counter without calling setState(), then the build method would not be
//       // called again, and so nothing would appear to happen.
//       _counter++;
//     });
//     await FirebaseFirestore.instance.collection('carriers').doc().set({
//       'fcmToken': _fcmToken,
//       'createdAt': DateTime.now(),
//       'status': 'active'
//     });
//   }

//   void getToken() async {
//     _fcmToken = (await _firebaseMessaging.getToken())!;
//     debugPrint("Obtained Device Token: $_fcmToken");
//     // You can now use this token to send push notifications
//     await FirebaseFirestore.instance.collection('users').doc().set({
//       'fcmToken': _fcmToken,
//     });
//   }

//   Future<void> getPermission() async {
//     FirebaseMessaging messaging = FirebaseMessaging.instance;

//     NotificationSettings settings = await messaging.requestPermission(
//       alert: true,
//       announcement: false,
//       badge: true,
//       carPlay: false,
//       criticalAlert: false,
//       provisional: false,
//       sound: true,
//     );

//     print('User granted permission: ${settings.authorizationStatus}');
//   }

//   void messageListener(BuildContext context) {
//     FirebaseMessaging.onMessage.listen((RemoteMessage message) {
//       print('Got a message whilst in the foreground!');
//       print('Message data: ${message.data}');

//       if (message.notification != null) {
//         print(
//             'Message also contained a notification: ${message.notification!.body}');
//         showDialog(
//             context: context,
//             builder: ((BuildContext context) {
//               return DynamicDialog(
//                   title: message.notification!.title,
//                   body: message.notification!.body);
//             }));
//       }
//     });
//   }

//   @override
//   void initState() {
//     super.initState();
//     getToken();

//     // Request permissions if iOS
//     _firebaseMessaging.requestPermission(
//       alert: true,
//       badge: true,
//       provisional: false,
//       sound: true,
//     );

//     // Handle incoming notifications
//     FirebaseMessaging.onMessage.listen((RemoteMessage message) {
//       print("Received a message: ${message.notification!.body}");
//       setState(() {
//         recievedNotification = true;
//         notificationBody =
//             'Received notification: ${message.notification!.body!}';
//         notificationTitle = message.notification!.title!;
//       });
//     });

import 'dart:async';
import 'dart:convert';
import 'dart:developer';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:flutter_notification_client/firebase_options.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Notification Client',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        // This is the theme of your application.
        //
        // TRY THIS: Try running your application with "flutter run". You'll see
        // the application has a blue toolbar. Then, without quitting the app,
        // try changing the seedColor in the colorScheme below to Colors.green
        // and then invoke "hot reload" (save your changes or press the "hot
        // reload" button in a Flutter-supported IDE, or press "r" if you used
        // the command line to start the app).
        //
        // Notice that the counter didn't reset back to zero; the application
        // state is not lost during the reload. To reset the state, use hot
        // restart instead.
        //
        // This works for code too, not just values: Most code changes can be
        // tested with just a hot reload.
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      home: PushNotificationApp(),
    );
  }
}

/// Entry point for the example application.
class PushNotificationApp extends StatefulWidget {
  static const routeName = "/firebase-push";

  @override
  _PushNotificationAppState createState() => _PushNotificationAppState();
}

class _PushNotificationAppState extends State<PushNotificationApp> {
  @override
  void initState() {
    getPermission();
    messageListener(context);
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder(
      // Initialize FlutterFire
      future: Firebase.initializeApp(
        options: DefaultFirebaseOptions.currentPlatform,
      ),
      builder: (context, snapshot) {
        // Check for errors
        if (snapshot.hasError) {
          return Center(
            child: Text(snapshot.error.toString()),
          );
        }
        // Once complete, show your application
        if (snapshot.connectionState == ConnectionState.done) {
          print('android firebase initiated');
          return NotificationPage();
        }
        // Otherwise, show something whilst waiting for initialization to complete
        return Center(
          child: CircularProgressIndicator(),
        );
      },
    );
  }

  Future<void> getPermission() async {
    FirebaseMessaging messaging = FirebaseMessaging.instance;

    NotificationSettings settings = await messaging.requestPermission(
      alert: true,
      announcement: false,
      badge: true,
      carPlay: false,
      criticalAlert: false,
      provisional: false,
      sound: true,
    );

    print('User granted permission: ${settings.authorizationStatus}');
  }

  void messageListener(BuildContext context) {
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      print('Got a message whilst in the foreground!');
      print('Message data: ${message.data}');

      if (message.notification != null) {
        print(
            'Message also contained a notification: ${message.notification!.body}');
        showDialog(
            context: context,
            builder: ((BuildContext context) {
              return DynamicDialog(
                  title: message.notification!.title,
                  body: message.notification!.body);
            }));
      }
    });
  }
}

class NotificationPage extends StatefulWidget {
  @override
  State<StatefulWidget> createState() => _Application();
}

class _Application extends State<NotificationPage> {
  late String _token;
  late Stream<String> _tokenStream;
  int notificationCount = 0;
  bool _orderPlaced = false;
  Future<void> setToken() async {
    String? token = await FirebaseMessaging.instance.getToken();
    print('FCM TokenToken: $token');
    setState(() {
      _token = token!;
    });
    await FirebaseFirestore.instance
        .collection('users')
        .doc()
        .set({'fcmToken': _token, 'createdAt': DateTime.now()});
  }

  @override
  void initState() {
    super.initState();
    //get token
    setToken();
  }

  _createOrder() async {
    await FirebaseFirestore.instance.collection('orders').doc().set(
        {'fcmToken': _token, 'createdAt': DateTime.now(), 'status': 'pending'});
    setState(() {
      _orderPlaced = true;
    });
  }

  @override
  Widget build(BuildContext context) {
    double width = MediaQuery.of(context).size.width;
    double height = MediaQuery.of(context).size.height;
    if (height / width < 1.64) {
      width = width / 1.5;
    }
    return Scaffold(
        appBar: AppBar(
          backgroundColor: Theme.of(context).colorScheme.inversePrimary,
          title: Text('Firebase push notification'),
        ),
        body: Container(
            child: Center(
          child: Card(
            margin: EdgeInsets.all(10),
            elevation: 10,
            child: ListTile(
              title: Container(
                width: width / 1.5,
                child: MaterialButton(
                  color: Theme.of(context).colorScheme.inversePrimary,
                  onPressed: _createOrder,
                  child: Row(
                    children: [
                      Icon(!_orderPlaced ? Icons.add : Icons.check),
                      Text(
                        !_orderPlaced ? 'Create Order' : 'Order Placed',
                        style: Theme.of(context).textTheme.headlineMedium,
                      ),
                    ],
                  ),
                ),
                // Center(
                //   child: OutlinedButton.icon(
                //     label: Text('Push Notification',
                //         style: TextStyle(
                //             color: Colors.blueAccent,
                //             fontWeight: FontWeight.bold,
                //             fontSize: 16)),
                //     onPressed: () {
                //       sendPushMessageToWeb();
                //     },
                //     icon: Icon(Icons.notifications),
                //   ),
                // ),
              ),
            ),
          ),
        )));
  }
}

//push notification dialog for foreground
class DynamicDialog extends StatefulWidget {
  final title;
  final body;
  DynamicDialog({this.title, this.body});
  @override
  _DynamicDialogState createState() => _DynamicDialogState();
}

class _DynamicDialogState extends State<DynamicDialog> {
  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(widget.title),
      actions: <Widget>[
        OutlinedButton.icon(
            label: Text('Close'),
            onPressed: () {
              Navigator.pop(context);
            },
            icon: Icon(Icons.close))
      ],
      content: Text(widget.body),
    );
  }
}
