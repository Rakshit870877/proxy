importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js')
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js')

const firebaseConfig = {
  apiKey: "AIzaSyBvkmRhiWS6ZvUZ80WAbjMaozZVGBGBI_8",
  authDomain: "bsna-7d618.firebaseapp.com",
  projectId: "bsna-7d618",
  storageBucket: "bsna-7d618.firebasestorage.app",
  messagingSenderId: "887656770285",
  appId: "1:887656770285:web:52e3661686dc0e93283ae4",
  measurementId: "G-95QMLDPKMY",
  importance:"false",
  repeat
};

firebase.initializeApp(firebaseConfig)

// Retrieve firebase messaging
const messaging = firebase.messaging()


self.addEventListener('push', function (event) {
  const payload = event.data.json()
  const notificationTitle = payload.notification.title
  const notificationOptions = {
    body: payload.notification.body,
  }

  event.waitUntil(self.registration.showNotification(notificationTitle, notificationOptions))
})

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.image,
  }

  self.registration.showNotification(notificationTitle, notificationOptions)
})


if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('../firebase-messaging-sw.js')
  .then(function(registration) {
    console.log('Registration successful, scope is:', registration.scope);
  }).catch(function(err) {
    console.log('Service worker registration failed, error:', err);
  });
}

