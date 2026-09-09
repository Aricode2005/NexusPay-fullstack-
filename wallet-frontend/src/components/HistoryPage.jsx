import { useState, useEffect } from 'react';
import { Clock, ArrowUpRight, ArrowDownLeft, RefreshCw, Search, Loader2 } from 'lucide-react';
import api from '../api';
import StatusBadge from './ui/StatusBadge';
import EmptyState from './ui/EmptyState';

export default function HistoryPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await api.getHistory();
      setTransactions(data.data || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchHistory(); }, []);

  const filtered = transactions.filter(tx => {
    if (filter !== 'ALL' && tx.transactionType !== filter && tx.status !== filter) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        tx.sender_handle?.toLowerCase().includes(s) ||
        tx.receiver_handle?.toLowerCase().includes(s) ||
        tx.order_id?.toLowerCase().includes(s) ||
        tx.amount?.toString().includes(s)
      );
    }
    return true;
  });

  const FILTERS = ['ALL', 'DEBIT', 'CREDIT', 'SELF', 'SUCCESS', 'PENDING', 'FAILED', 'EXPIRED'];

  return (
    <div className="p-8 space-y-6 overflow-y-auto">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all placeholder-gray-400 text-sm shadow-sm"
            placeholder="Search by handle, order ID, or amount..."
          />
        </div>
        <button onClick={fetchHistory} className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-all" title="Refresh">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              filter === f
                ? 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                : 'bg-white text-gray-400 border border-gray-200 hover:text-gray-600 shadow-sm'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-400">
        Showing {filtered.length} of {transactions.length} transactions
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Clock} title="No Transactions Found" description="Your transaction history will appear here once you start making transfers." />
      ) : (
        <div className="space-y-2.5">
          {filtered.map(tx => {
            const isDebit = tx.transactionType === 'DEBIT';
            const isSelf = tx.transactionType === 'SELF';
            return (
              <div key={tx.id} className="bg-white border border-gray-200/80 rounded-xl px-5 py-4 hover:shadow-md transition-all shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      isSelf ? 'bg-blue-50 text-blue-500' : isDebit ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'
                    }`}>
                      {isDebit ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-sm text-gray-800 font-medium">
                        {isSelf ? 'Self Transfer' : isDebit ? `To @${tx.receiver_handle}` : `From @${tx.sender_handle}`}
                      </p>
                      <p className="text-[11px] text-gray-400">
                        {new Date(tx.timestamp).toLocaleString()} • {tx.sender_bank_name} → {tx.receiver_bank_name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold text-sm ${isSelf ? 'text-blue-500' : isDebit ? 'text-red-500' : 'text-emerald-500'}`}>
                      {isDebit ? '-' : isSelf ? '' : '+'}₹{parseFloat(tx.amount).toLocaleString('en-IN')}
                    </p>
                    <div className="flex items-center gap-1.5 justify-end mt-1">
                      <StatusBadge status={tx.status} />
                      <StatusBadge status={tx.transactionType} />
                    </div>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <p className="text-[10px] text-gray-400 font-mono">Order: {tx.order_id}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
