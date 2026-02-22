import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import app from './firebase';

export const initMessaging = async () => {
  if (!app) return;
  if (!import.meta.env.VITE_FIREBASE_VAPID_KEY) return;
  if (!(await isSupported())) return;
  const messaging = getMessaging(app as any);
  try {
    await Notification.requestPermission();
    await getToken(messaging, { vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY });
    onMessage(messaging, () => {});
  } catch {}
};
