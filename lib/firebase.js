// Settings > General
const firebaseConfig = {
  apiKey: "AIzaSyCYsfB6D52S48WMpkBWVTtN6TPbBYPfG9E",
  authDomain: "mesch-slides.firebaseapp.com",
  projectId: "mesch-slides",
  storageBucket: "mesch-slides.appspot.com",
  messagingSenderId: "909049059548",
  appId: "1:909049059548:web:7d395ada93ca010c6abc19"
};

// Settings > Cloud Messaging > Web Configuration > Web Push Certificates > Key Pair
const firebaseVapidKey =
      'BB0d7XauTsBgUBQcoz6OTNuLwsjlkM46pZKBLcWzpYlDPNn6eFu0WnofNg4OUAArkdxowf_iWYmVpM8E_k8CwUA';

const firebaseServer = 'https://mesch-slides.uc.r.appspot.com';
//const firebaseServer = 'http://localhost:8080';

function logResponse_(response) {
  console.log(response);
  response.text().then(function(text) {
    console.log(text);
  });
}


class FirebaseSender {
  constructor(topic) {
    this.topic_ = topic;
  }

  send(data) {
    const url = firebaseServer + '/topic/' + this.topic_;

    // Firebase message data are string-string maps, not JSON.
    const flatData = {};
    const keep = [];
    for (const key in data) {
      if (typeof data[key] == 'string') {
        flatData[key] = data[key];
        keep.push(key);
      } else {
        flatData[key] = JSON.stringify(data[key]);
      }
    }
    flatData.keep = JSON.stringify(keep);

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(flatData)
    };
    console.log('send', url, data, options);
    fetch(url, options).then(function(response) {
      logResponse_(response);
    }).catch(function(error) {
      console.error(error);
    });
  }
}

class FirebaseReceiver {
  constructor(topic) {
    this.handlers_ = [];
    
    firebase.initializeApp(firebaseConfig);

    const m = firebase.messaging();
    m.usePublicVapidKey(firebaseVapidKey);

    m.getToken().then(function(token) {
      fetch(firebaseServer + '/topic/' + topic + '/sub/' + token, {
        method: 'PUT'
      }).then(function(response) {
        logResponse_(response);
      }).catch(function(error) {
        console.error(error);
      });
    });

    window.addEventListener('unload', function() {
      fetch(firebaseServer + '/topic/' + topic + '/sub/' + token, {
        method: 'DELETE'
      }).then(function(response) {
        logResponse_(response);
      }).catch(function(error) {
        console.error(error);
      });
    });
  
    m.onMessage(this.onMessage_.bind(this));
  }

  onMessage_(payload) {
    console.log('receive', payload);

    // Cf. send().
    const keep = JSON.parse(payload.data.keep);
    const data = {};
    for (const key in payload.data) {
      if (keep.indexOf(key) == -1) {
        data[key] = JSON.parse(payload.data[key]);
      } else {
        data[key] = payload.data[key];
      }
    }
    
    console.log('receive data', data);
    for (const handler of this.handlers_) {
      handler(data);
    }
  }

  onMessage(handler) {
    this.handlers_.push(handler);
  }
}
