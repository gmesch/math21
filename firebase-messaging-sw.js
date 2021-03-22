importScripts('https://www.gstatic.com/firebasejs/8.3.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.3.1/firebase-messaging.js');

firebase.initializeApp({
  apiKey: "AIzaSyCYsfB6D52S48WMpkBWVTtN6TPbBYPfG9E",
  authDomain: "mesch-slides.firebaseapp.com",
  projectId: "mesch-slides",
  storageBucket: "mesch-slides.appspot.com",
  messagingSenderId: "909049059548",
  appId: "1:909049059548:web:7d395ada93ca010c6abc19"
});

const m = firebase.messaging();
