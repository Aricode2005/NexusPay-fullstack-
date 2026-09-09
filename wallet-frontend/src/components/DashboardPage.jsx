import { useState, useEffect } from 'react';
import { Wallet, CreditCard, Activity, ArrowUpRight, ArrowDownLeft, Send, Plus } from 'lucide-react';
import StatusBadge from './ui/StatusBadge';

export default function DashboardPage({ profile, onTabChange }) {
  const totalBalance = profile?.handles?.reduce((sum, h) => sum + parseFloat(h.balance || 0), 0) || 0;
  const primaryHandle = profile?.handles?.find(h => h.is_primary);

  return (
    <div className="p-8 space-y-8 overflow-y-auto">
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => onTabChange('transfer')}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium py-2.5 px-5 rounded-xl transition-all text-sm shadow-lg shadow-indigo-200"
        >
          <Send className="w-4 h-4" /> Send Money
        </button>
        <button
          onClick={() => onTabChange('accounts')}
          className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-600 font-medium py-2.5 px-5 rounded-xl transition-all text-sm border border-gray-200 shadow-sm"
        >
          <Plus className="w-4 h-4" /> Link Account
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 shadow-lg shadow-indigo-200">
          <div className="flex items-center gap-2 text-indigo-100 text-sm mb-3">
            <Wallet className="w-4 h-4" /> Total Balance
          </div>
          <div className="text-3xl font-bold text-white">
            ₹{totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-indigo-200 mt-2">
            Across {profile?.handles?.length || 0} linked account(s)
          </p>
        </div>

        <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-600 text-sm mb-3">
            <CreditCard className="w-4 h-4" /> Primary Handle
          </div>
          <div className="text-xl font-bold text-gray-900">
            {primaryHandle ? `@${primaryHandle.user_handle}` : 'None linked'}
          </div>
          <p className="text-xs text-gray-400 mt-2">{primaryHandle?.bank_name || 'Link a bank account first'}</p>
        </div>

        <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 text-amber-600 text-sm mb-3">
            <Activity className="w-4 h-4" /> Recent Activity
          </div>
          <div className="text-xl font-bold text-gray-900">
            {profile?.recentTransactions?.length || 0} Transactions
          </div>
          <p className="text-xs text-gray-400 mt-2">Last 5 transactions shown below</p>
        </div>
      </div>

      {/* Account Details */}
      {profile?.user && (
        <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Account Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-gray-400 mb-1">Full Name</p>
              <p className="text-gray-800 font-medium">{profile.user.full_name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Email</p>
              <p className="text-gray-800 font-medium">{profile.user.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Phone</p>
              <p className="text-gray-800 font-medium">{profile.user.phone}</p>
            </div>
          </div>
        </div>
      )}

      {/* Linked Handles */}
      {profile?.handles?.length > 0 && (
        <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Linked Bank Accounts</h3>
          <div className="space-y-3">
            {profile.handles.map(h => (
              <div key={h.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-5 py-4 border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${h.is_primary ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-gray-800 font-medium text-sm">@{h.user_handle}</p>
                    <p className="text-xs text-gray-400">{h.bank_name}</p>
                  </div>
                  {h.is_primary && (
                    <span className="text-[10px] uppercase bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-bold tracking-wider">Primary</span>
                  )}
                </div>
                <p className="text-gray-800 font-semibold">₹{parseFloat(h.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      {profile?.recentTransactions?.length > 0 && (
        <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Recent Transactions</h3>
            <button onClick={() => onTabChange('history')} className="text-xs text-indigo-600 hover:text-indigo-500 transition-colors font-medium">
              View All →
            </button>
          </div>
          <div className="space-y-2.5">
            {profile.recentTransactions.map(tx => {
              const isSender = profile.handles?.some(h => h.user_handle === tx.sender_handle);
              return (
                <div key={tx.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-5 py-3.5 border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSender ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}`}>
                      {isSender ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-sm text-gray-800">
                        {isSender ? `To @${tx.receiver_handle}` : `From @${tx.sender_handle}`}
                      </p>
                      <p className="text-[11px] text-gray-400">{new Date(tx.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold text-sm ${isSender ? 'text-red-500' : 'text-emerald-500'}`}>
                      {isSender ? '-' : '+'}₹{parseFloat(tx.amount).toLocaleString('en-IN')}
                    </p>
                    <StatusBadge status={tx.status} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
