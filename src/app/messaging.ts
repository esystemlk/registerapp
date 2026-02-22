import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import app from './firebase';
import { saveFcmToken } from './services/db';
import { auth } from './firebase';

export const initMessaging = async () => {
  if (!app) return;
  if (!import.meta.env.VITE_FIREBASE_VAPID_KEY) return;
  if (!(await isSupported())) return;
  const messaging = getMessaging(app as any);
  try {
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      const token = await getToken(messaging, { vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY });
      if (token && auth?.currentUser?.uid) {
        await saveFcmToken(auth.currentUser.uid, token);
      }
    }
    onMessage(messaging, () => {});
  } catch {}
};

export const requestNotifications = async () => {
  if (!app) return;
  if (!import.meta.env.VITE_FIREBASE_VAPID_KEY) return;
  if (!(await isSupported())) return;
  try {
    if (typeof Notification !== 'undefined') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return;
    }
    await initMessaging();
  } catch {}
};
