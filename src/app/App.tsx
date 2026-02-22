import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AuthProvider } from './AuthContext';
import { Toaster } from './components/ui/sonner';
import { useEffect } from 'react';
import { initMessaging } from './messaging';

export default function App() {
  useEffect(() => {
    initMessaging();
  }, []);
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
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
