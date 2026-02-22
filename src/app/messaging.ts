import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import app from './firebase';
import { saveFcmToken } from './services/db';
import { auth } from './firebase';
import { toast } from 'sonner';

const getSw = async () => {
  if (typeof window === 'undefined') return undefined;
  if (!('serviceWorker' in navigator)) return undefined;
  try {
    const reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    return reg;
  } catch {
    return undefined;
  }
};

export const initMessaging = async () => {
  if (!app) return;
  if (!import.meta.env.VITE_FIREBASE_VAPID_KEY) return;
  if (!(await isSupported())) return;
  const messaging = getMessaging(app as any);
  try {
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      const reg = await getSw();
      const token = await getToken(messaging, { vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY, serviceWorkerRegistration: reg });
      if (token && auth?.currentUser?.uid) {
        await saveFcmToken(auth.currentUser.uid, token);
      }
    }
    onMessage(messaging, () => {});
  } catch {}
};

export const requestNotifications = async () => {
  if (!app) { toast.error('App not initialized'); return; }
  if (!import.meta.env.VITE_FIREBASE_VAPID_KEY) { toast.error('VAPID key missing'); return; }
  if (!(await isSupported())) { toast.error('Notifications not supported in this browser'); return; }
  try {
    if (typeof Notification !== 'undefined') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        toast.error('Notifications permission denied');
        return;
      }
    }
    const messaging = getMessaging(app as any);
    const reg = await getSw();
    const token = await getToken(messaging, { vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY, serviceWorkerRegistration: reg });
    if (!token) {
      toast.error('Failed to get device token');
      return;
    }
    if (auth?.currentUser?.uid) {
      await saveFcmToken(auth.currentUser.uid, token);
      toast.success('Notifications enabled');
    } else {
      toast.success('Notifications enabled for this device');
    }
  } catch {
    toast.error('Failed to enable notifications');
  }
};
