import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/', label: 'Dashboard', icon: '📊', public: true },
  { path: '/dams', label: 'Dams', icon: '🏔️', public: true },
  { path: '/reports', label: 'Reports', icon: '📄', public: true },
  { path: '/alerts', label: 'Alert Config', icon: '🔔', roles: ['admin'] },
  { path: '/audit-logs', label: 'Audit Logs', icon: '📋', roles: ['admin'] },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const visibleItems = navItems.filter(item => {
    if (item.public) return true;
    if (!user) return false;
    if (item.roles && !item.roles.includes(user.role)) return false;
    return true;
  });

  return (
    <div className="w-64 bg-blue-900 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-blue-800">
        <h1 className="text-white font-bold text-lg">💧 Dam Monitor</h1>
        <p className="text-blue-300 text-xs mt-1">KSEB Water Level System</p>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 p-4">
        {visibleItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-sm transition
              ${location.pathname === item.path
                ? 'bg-blue-700 text-white font-medium'
                : 'text-blue-200 hover:bg-blue-800'
              }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* User Info + Login/Logout */}
      <div className="p-4 border-t border-blue-800">
        {user ? (
          <>
            <div className="text-blue-300 text-xs mb-2">
              <p className="font-medium text-white">{user?.full_name}</p>
              <p className="capitalize">{user?.role}</p>
            </div>
            <button
              onClick={logout}
              className="w-full bg-blue-800 text-white text-sm py-2 rounded hover:bg-red-700 transition"
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="w-full block text-center bg-blue-700 text-white text-sm py-2 rounded hover:bg-blue-600 transition"
          >
            Login
          </Link>
        )}
      </div>
    </div>
  );
}