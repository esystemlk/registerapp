import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../AuthContext';
import { Button } from './ui/button';
import { requestNotifications } from '../messaging';

export default function HeaderBar({ title, color = '#0066FF' }: { title: string; color?: string }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [dark, setDark] = useState<boolean>(() => {
    try {
      const v = localStorage.getItem('theme');
      return v === 'dark';
    } catch { return false; }
  });
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('click', handler);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', handler);
      document.removeEventListener('keydown', onKey);
    };
  }, []);
  useEffect(() => {
    try {
      if (dark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    } catch {}
  }, [dark]);
  const initial = (user?.name || user?.email || 'U').charAt(0).toUpperCase();
  return (
    <div className="sticky top-0 z-10 shadow-sm" style={{ backgroundColor: color }}>
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="smartlabs" className="w-10 h-10 rounded-full bg-white object-cover" />
            <p className="text-white/90 text-xs">{title}</p>
          </div>
          <div className="flex items-center gap-2 relative" ref={ref}>
            <div
              className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center cursor-pointer select-none"
              onClick={() => setOpen(!open)}
              title={user?.name || user?.email}
            >
              {user?.avatar ? (
                <img src={user.avatar} alt="profile" className="w-9 h-9 rounded-full object-cover" />
              ) : (
                <span className="text-sm font-semibold" style={{ color: color }}>{initial}</span>
              )}
            </div>
            {open && (
              <div
                className="absolute right-0 top-12 z-50 w-64 sm:w-56 max-w-[90vw] bg-white/90 backdrop-blur-xl border border-black/10 shadow-2xl rounded-xl p-2 pointer-events-auto"
                role="menu"
                aria-label="Profile menu"
              >
                <div className="px-2 py-1 text-xs text-gray-700">{user?.email}</div>
                <button type="button" className="w-full text-left px-2 py-2 text-sm hover:bg-gray-100 rounded text-gray-800" onClick={() => { navigate('/profile'); setOpen(false); }}>
                  Profile
                </button>
                <button type="button" className="w-full text-left px-2 py-2 text-sm hover:bg-gray-100 rounded text-gray-800" onClick={() => { setDark(!dark); }}>
                  {dark ? 'Light Mode' : 'Dark Mode'}
                </button>
                <button type="button" className="w-full text-left px-2 py-2 text-sm hover:bg-gray-100 rounded text-gray-800" onClick={async () => { await requestNotifications(); setOpen(false); }}>
                  Enable Notifications
                </button>
                <div className="border-t my-1" />
                <button type="button" className="w-full text-left px-2 py-2 text-sm hover:bg-gray-100 rounded text-gray-800" onClick={() => { navigate('/student/dashboard'); setOpen(false); }}>
                  Student Portal
                </button>
                <button type="button" className="w-full text-left px-2 py-2 text-sm hover:bg-gray-100 rounded text-gray-800" onClick={() => { navigate('/lecturer/dashboard'); setOpen(false); }}>
                  Lecturer Portal
                </button>
                <button type="button" className="w-full text-left px-2 py-2 text-sm hover:bg-gray-100 rounded text-gray-800" onClick={() => { navigate('/admin/dashboard'); setOpen(false); }}>
                  Admin Portal
                </button>
                <button type="button" className="w-full text-left px-2 py-2 text-sm hover:bg-gray-100 rounded text-gray-800" onClick={() => { navigate('/super-admin/dashboard'); setOpen(false); }}>
                  Super Admin
                </button>
                <button type="button" className="w-full text-left px-2 py-2 text-sm hover:bg-gray-100 rounded text-gray-800" onClick={() => { navigate('/developer/dashboard'); setOpen(false); }}>
                  Developer
                </button>
                <div className="border-t my-1" />
                <Button variant="outline" className="w-full justify-start" onClick={() => { logout(); setOpen(false); }}>
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
