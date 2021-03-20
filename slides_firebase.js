// Settings > General
const firebaseConfig = {
    apiKey: "AIzaSyCYsfB6D52S48WMpkBWVTtN6TPbBYPfG9E",
    authDomain: "mesch-slides.firebaseapp.com",
    projectId: "mesch-slides",
    storageBucket: "mesch-slides.appspot.com",
    messagingSenderId: "909049059548",
    appId: "1:909049059548:web:7d395ada93ca010c6abc19"
};

// Settings > Cloud Messaging > Server Key
const firebaseServerKey =
      'AAAA06eL2Nw:APA91bES7ArKpjP05KPEEYwx8wsEeZs5vGgYYxz0W3Zf8v5ZHrbEKZ7dCNb7YBC6' +
      'KuDszc8PgR8BkwJVXw6-ubImPFzQB7fI_LlKjDJW1tydhodO7ZNX1cS6pZdpq1ynr9JCkxlyHOGN';

// Settings > Cloud Messaging > Web Configuration > Web Push Certificates > Key Pair
const firebaseVapidKey =
      'BB0d7XauTsBgUBQcoz6OTNuLwsjlkM46pZKBLcWzpYlDPNn6eFu0WnofNg4OUAArkdxowf_iWYmVpM8E_k8CwUA';

const firebaseServer = 'https://mesch-slides.uc.r.appspot.com';
//const firebaseServer = 'http://localhost:8080';

function sendStateMessage(topic, state) {
  fetch(firebaseServer + '/topic/' + topic, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({state: state})
  }).then(function(response) {
    console.log(response);
  }).catch(function(error) {
    console.error(error);
  });
}

function initFirebaseLead(topic) {
  let currentState = '';
  window.setInterval(function() {
    if (window.location.hash != currentState) {
      currentState = window.location.hash;
      sendStateMessage(topic, currentState.substr(1));
    }
  }, 100);
}

function initFirebaseFollow(topic) {
  firebase.initializeApp(firebaseConfig);

  const m = firebase.messaging();
  m.usePublicVapidKey(firebaseVapidKey);

  m.getToken().then(function(token) {
    console.log('token: ', token);

    fetch(firebaseServer + '/topic/' + topic + '/sub/' + token, {
      method: 'PUT'
    }).then(function(response) {
      console.log(response);
    }).catch(function(error) {
      console.error(error);
    });
  });

  window.addEventListener('unload', function() {
    fetch(firebaseServer + '/topic/' + topic + '/sub/' + token, {
      method: 'DELETE'
    }).then(function(response) {
      console.log(response);
    }).catch(function(error) {
      console.error(error);
    });
  });
  
  m.onMessage(function(payload) {
    window.location.assign('#' + payload.data.state);
  });
}
