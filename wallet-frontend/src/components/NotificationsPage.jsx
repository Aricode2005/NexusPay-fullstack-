import { useState, useEffect } from 'react';
import { Bell, ArrowUpRight, ArrowDownLeft, ShieldAlert, ShieldOff, ClipboardCheck, Loader2 } from 'lucide-react';
import api from '../api';
import EmptyState from './ui/EmptyState';

const ICONS = {
  DEBIT: { icon: ArrowUpRight, color: 'text-red-500', bg: 'bg-red-50' },
  CREDIT: { icon: ArrowDownLeft, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  ACCOUNT_FROZEN: { icon: ShieldOff, color: 'text-blue-500', bg: 'bg-blue-50' },
  FRAUD_ALERT: { icon: ShieldAlert, color: 'text-red-500', bg: 'bg-red-50' },
  FRAUD_REVIEW: { icon: ClipboardCheck, color: 'text-amber-600', bg: 'bg-amber-50' },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await api.getNotifications();
        setNotifications(data.data || []);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="p-8">
        <EmptyState icon={Bell} title="No Notifications" description="You're all caught up! Notifications for transactions, fraud alerts, and account activity will appear here." />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-3 overflow-y-auto">
      <p className="text-xs text-gray-400 mb-4">{notifications.length} notification(s) • Auto-marked as read</p>

      {notifications.map(n => {
        const config = ICONS[n.type] || { icon: Bell, color: 'text-gray-400', bg: 'bg-gray-100' };
        const Icon = config.icon;
        const isFraud = ['ACCOUNT_FROZEN', 'FRAUD_ALERT', 'FRAUD_REVIEW'].includes(n.type);

        return (
          <div key={n.id} className={`border rounded-xl px-5 py-4 transition-all shadow-sm ${
            isFraud ? 'bg-red-50/50 border-red-200' : 'bg-white border-gray-200/80'
          }`}>
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${config.bg}`}>
                <Icon className={`w-4 h-4 ${config.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-medium text-gray-800">{n.title}</h4>
                  <span className="text-[10px] text-gray-400 shrink-0">{timeAgo(n.created_at)}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{n.message}</p>
                <div className="mt-2">
                  <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                    isFraud ? 'bg-red-100 text-red-600' : n.type === 'CREDIT' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {n.type}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
