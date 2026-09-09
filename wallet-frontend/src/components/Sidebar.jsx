import { useState, useEffect } from 'react';
import {
  Home, Send, Clock, CreditCard, Bell, Bot, ShieldCheck,
  Wallet, LogOut, Menu, X
} from 'lucide-react';
import api from '../api';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'transfer', label: 'Send Money', icon: Send },
  { id: 'history', label: 'Transactions', icon: Clock },
  { id: 'accounts', label: 'Accounts', icon: CreditCard },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: ShieldCheck },
  { id: 'assistant', label: 'AI Assistant', icon: Bot },
];

export default function Sidebar({ activeTab, onTabChange, profile, onLogout }) {
  const [collapsed, setCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [serverUp, setServerUp] = useState(null);

  useEffect(() => {
    const checkNotifications = async () => {
      try {
        const data = await api.getNotifications();
        const unread = data.data?.filter(n => !n.is_read).length || 0;
        setUnreadCount(unread);
      } catch { /* ignore */ }
    };

    const checkHealth = async () => {
      try {
        await api.healthCheck();
        setServerUp(true);
      } catch {
        setServerUp(false);
      }
    };

    checkHealth();
    checkNotifications();
    const interval = setInterval(checkNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-white shadow-md p-2 rounded-xl text-gray-600"
      >
        {collapsed ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      <aside className={`${collapsed ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:relative z-40 w-72 bg-white border-r border-gray-200/80 flex flex-col h-screen transition-transform duration-300`}>
        {/* Logo */}
        <div className="p-6 flex items-center gap-3 border-b border-gray-100">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-xl shadow-md shadow-indigo-200">
            <Wallet className="text-white w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight block text-gray-900">NexusPay</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400">Enterprise Wallet</span>
              {serverUp !== null && (
                <span className={`w-1.5 h-1.5 rounded-full ${serverUp ? 'bg-emerald-400' : 'bg-red-400'}`} title={serverUp ? 'Server Online' : 'Server Offline'} />
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => { onTabChange(item.id); setCollapsed(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium relative ${
                activeTab === item.id
                  ? 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700 border border-transparent'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
              {item.id === 'notifications' && unreadCount > 0 && (
                <span className="absolute right-3 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-gray-100">
          {profile?.user && (
            <div className="flex items-center gap-3 px-3 py-2 mb-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
                {profile.user.full_name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-gray-800 truncate">{profile.user.full_name}</p>
                <p className="text-xs text-gray-400 truncate">{profile.user.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
