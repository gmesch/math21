const firebaseConfig = {
  apiKey: "AIzaSyAnwQ8v_zvsLvp3lDZYoLJBeoWFKV6FOU4",
  authDomain: "mesch-mathml.firebaseapp.com",
  projectId: "mesch-mathml",
  storageBucket: "mesch-mathml.appspot.com",
  messagingSenderId: "449046222709",
  appId: "1:449046222709:web:ef2712a80e4b0c29fba53c",
  measurementId: "G-DHGNWLC79K"
};

function initFirebase() {
  firebase.initializeApp(firebaseConfig);
  firebase.analytics();

  const initCalled = false;
  
  window.document.addEventListener('keydown', function(event) {
    if (event.keyCode == 70) {
      if (initCalled) {
        initCalled = true;
        const m = firebase.messaging();
        m.usePublicVapidKey(
          'BIydqwbGrkDytzCWN00x18zluRNM1p9oVvtSfYtwVPzUtoPa2RTFQ5ZKoXaO4RhYzkLFCD_3ME1ZEQM8i6qGB5w');
        m.onMessage(function(payload) {
          console.log(payload);
        });
      }
    }
  });
}
