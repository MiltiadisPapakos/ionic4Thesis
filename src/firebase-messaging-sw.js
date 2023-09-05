
importScripts('https://www.gstatic.com/firebasejs/7.6.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.6.0/firebase-messaging.js');
firebase.initializeApp({
  apiKey: "AIzaSyCXWydohCURGsRUMzo_0Or0sbLY4orvEUs",
  authDomain: "ionic4thesis.firebaseapp.com",
  databaseURL: "https://ionic4thesis-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "ionic4thesis",
  storageBucket: "ionic4thesis.appspot.com",
  messagingSenderId: "841782522419",
  appId: "1:841782522419:web:b00accb5317b2f45f72946",
  measurementId: "G-0X7Y6859Y7"
});
const messaging = firebase.messaging();
