importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');
// Initialize with minimal config for background handling; messagingSenderId is public
firebase.initializeApp({ messagingSenderId: '23089939460' });
const messaging = firebase.messaging();
messaging.onBackgroundMessage((payload) => {
  const title = (payload.notification && payload.notification.title) || 'Notification';
  const options = {
    body: (payload.notification && payload.notification.body) || '',
    icon: '/logo.png',
  };
  self.registration.showNotification(title, options);
});
