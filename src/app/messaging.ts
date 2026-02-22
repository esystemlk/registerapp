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
    await Notification.requestPermission();
    const token = await getToken(messaging, { vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY });
    if (token && auth?.currentUser?.uid) {
      await saveFcmToken(auth.currentUser.uid, token);
    }
    onMessage(messaging, () => {});
  } catch {}
};

export const requestNotifications = async () => {
  await initMessaging();
};
