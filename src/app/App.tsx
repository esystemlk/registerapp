import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AuthProvider } from './AuthContext';
import { Toaster } from './components/ui/sonner';
import { useEffect, useMemo, useState } from 'react';
import { initMessaging, requestNotifications } from './messaging';
import { Button } from './components/ui/button';
import { toast } from './components/ui/sonner';

export default function App() {
  const [showNotif, setShowNotif] = useState(false);
  const supported = useMemo(() => {
    try { return typeof Notification !== 'undefined'; } catch { return false; }
  }, []);
  useEffect(() => {
    initMessaging();
    try {
      if (supported) {
        setShowNotif(Notification.permission !== 'granted');
      }
    } catch {}
  }, []);
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        {showNotif && (
          <div className="w-full px-4 py-2 text-sm flex items-center justify-between" style={{ backgroundColor: '#fff7ed', color: '#9a3412' }}>
            <div className="pr-3">
              Enable notifications to receive booking updates, reminders, and messages.
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={async () => {
                await requestNotifications();
                try {
                  setShowNotif(typeof Notification !== 'undefined' && Notification.permission !== 'granted');
                } catch {
                  setShowNotif(false);
                }
              }}>
                Enable Notifications
              </Button>
            </div>
          </div>
        )}
        <div className="flex-1">
          <RouterProvider router={router} />
        </div>
        <footer className="text-center text-gray-500 text-xs py-3">
          Developed by esystemlk
        </footer>
      </div>
      <Toaster />
    </AuthProvider>
  );
}
