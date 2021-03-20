const firebaseConfig = {
    apiKey: "AIzaSyCYsfB6D52S48WMpkBWVTtN6TPbBYPfG9E",
    authDomain: "mesch-slides.firebaseapp.com",
    projectId: "mesch-slides",
    storageBucket: "mesch-slides.appspot.com",
    messagingSenderId: "909049059548",
    appId: "1:909049059548:web:7d395ada93ca010c6abc19"
};

const firebaseServerKey =
      'AAAA06eL2Nw:APA91bES7ArKpjP05KPEEYwx8wsEeZs5vGgYYxz0W3Zf8v5ZHrbEKZ7dCNb7YBC6' +
      'KuDszc8PgR8BkwJVXw6-ubImPFzQB7fI_LlKjDJW1tydhodO7ZNX1cS6pZdpq1ynr9JCkxlyHOGN';

// Settings > Cloud Messaging > Web Configuration > Web Push Certificates > Key Pair
const firebaseVapidKey =
      'BB0d7XauTsBgUBQcoz6OTNuLwsjlkM46pZKBLcWzpYlDPNn6eFu0WnofNg4OUAArkdxowf_iWYmVpM8E_k8CwUA';

let firebaseToken = '';

function sendMessage() {
  if (!firebaseToken) {
    firebaseToken = window.location.hash.substr(1);
  }
  
  var notification = {
    'title': 'Test Message',
  };
  
  fetch('https://fcm.googleapis.com/fcm/send', {
    'method': 'POST',
    'headers': {
      'Authorization': 'key=' + firebaseServerKey,
      'Content-Type': 'application/json'
    },
    'body': JSON.stringify({
      data: notification,
      to: firebaseToken
    })
  }).then(function(response) {
    console.log(response);
  }).catch(function(error) {
    console.error(error);
  });
}

function initFirebase() {
  firebase.initializeApp(firebaseConfig);

  const m = firebase.messaging();
  m.usePublicVapidKey(firebaseVapidKey);
  m.getToken().then(function(t) {
    console.log('token: ' + t);
    firebaseToken = t;
  });
  
  m.onMessage(function(payload) {
    console.log('message:', payload);
  });
}
