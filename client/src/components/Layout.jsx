import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import api from '../api.js';

const employeeNav = [
  { to: '/app', label: 'Dashboard', end: true },
  { to: '/app/find', label: 'Find a Ride' },
  { to: '/app/offer', label: 'Offer a Ride' },
  { to: '/app/trips', label: 'My Trips' },
  { to: '/app/vehicles', label: 'My Vehicles' },
  { to: '/app/wallet', label: 'Wallet' },
  { to: '/app/history', label: 'Ride History' },
  { to: '/app/places', label: 'Saved Places' },
];

const adminNav = [
  { to: '/app/admin', label: 'Admin Dashboard' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const nav = user?.isAdmin ? adminNav : employeeNav;

  const loadNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.notifications || []);
      setUnread(data.unread || 0);
    } catch {
      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    let alive = true;
    const poll = async () => {
      try {
        const { data } = await api.get('/notifications');
        if (alive) {
          setNotifications(data.notifications || []);
          setUnread(data.unread || 0);
        }
      } catch { /* ignore */ }
    };
    poll();
    const t = setInterval(poll, 20000);
    return () => { alive = false; clearInterval(t); };
  }, []);

  const toggleNotifications = async () => {
    const next = !notifOpen;
    setNotifOpen(next);
    if (next) await loadNotifications();
  };

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read');
      setNotifications((items) => items.map((item) => ({ ...item, is_read: true })));
      setUnread(0);
    } catch {
      // ignore
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <button className="md:hidden text-slate-600" onClick={() => setOpen((o) => !o)}>☰</button>
            <Link to="/app" className="text-lg font-extrabold tracking-tight text-brand-dark">🚗 Carpool</Link>
            <span className="ml-2 hidden rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 sm:inline">{user?.orgName}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button onClick={toggleNotifications} className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100">
                🔔{unread > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">{unread}</span>}
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-lg">
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-800">Notifications</div>
                      <div className="text-xs text-slate-500">{unread > 0 ? `${unread} unread` : 'All caught up'}</div>
                    </div>
                    <button onClick={markAllRead} className="text-xs font-semibold text-brand-dark">Mark all read</button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {loadingNotifications ? (
                      <div className="px-4 py-5 text-sm text-slate-500">Loading...</div>
                    ) : notifications.length === 0 ? (
                      <div className="px-4 py-5 text-sm text-slate-500">No notifications yet.</div>
                    ) : (
                      notifications.map((item) => (
                        <div key={item.notification_id} className={`border-b border-slate-100 px-4 py-3 ${!item.is_read ? 'bg-slate-50' : ''}`}>
                          <div className="text-sm font-medium text-slate-700">{item.title}</div>
                          <div className="mt-1 text-sm text-slate-600">{item.body}</div>
                          <div className="mt-2 text-[11px] text-slate-400">{new Date(item.created_at).toLocaleString()}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="hidden text-right sm:block">
              <div className="text-sm font-semibold text-slate-700">{user?.fullName}</div>
              <div className="text-xs text-slate-400">{user?.email}</div>
            </div>
            <button onClick={handleLogout} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100">Logout</button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-6 px-4 py-6">
        <aside className={`${open ? 'block' : 'hidden'} md:block w-full md:w-56 shrink-0`}>
          <nav className="space-y-1">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'bg-brand text-white' : 'text-slate-600 hover:bg-slate-100'}`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
