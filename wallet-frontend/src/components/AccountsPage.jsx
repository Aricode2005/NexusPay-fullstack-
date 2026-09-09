import { useState, useEffect } from 'react';
import { CreditCard, Plus, Star, Loader2, AlertCircle, Building2, Hash, MapPin } from 'lucide-react';
import api from '../api';
import Modal from './ui/Modal';
import EmptyState from './ui/EmptyState';

export default function AccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ handle: '', bankName: '', accountNumber: '', ifscCode: '', branch: '' });
  const [creating, setCreating] = useState(false);
  const [settingPrimary, setSettingPrimary] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const data = await api.getHandles();
      setAccounts(data.handles || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAccounts(); }, []);

  const updateField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setCreating(true);
    try {
      await api.createHandle(form);
      setShowModal(false);
      setForm({ handle: '', bankName: '', accountNumber: '', ifscCode: '', branch: '' });
      setSuccess('Bank account linked successfully!');
      fetchAccounts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleSetPrimary = async (handleId) => {
    setSettingPrimary(handleId);
    try {
      await api.setPrimary(handleId);
      fetchAccounts();
    } catch { /* ignore */ }
    finally { setSettingPrimary(null); }
  };

  const formFields = [
    { key: 'handle', label: 'Handle', icon: Hash, placeholder: 'e.g. aritra@hdfc', required: true },
    { key: 'bankName', label: 'Bank Name', icon: Building2, placeholder: 'e.g. HDFC Bank', required: true },
    { key: 'accountNumber', label: 'Account Number', icon: CreditCard, placeholder: 'Your account number', required: true },
    { key: 'ifscCode', label: 'IFSC Code', icon: Hash, placeholder: 'e.g. HDFC0001234', required: true },
    { key: 'branch', label: 'Branch', icon: MapPin, placeholder: 'e.g. Kolkata Main', required: true },
  ];

  return (
    <div className="p-8 space-y-6 overflow-y-auto">
      <div className="flex items-center justify-between">
        <p className="text-gray-400 text-sm">{accounts.length} account(s) linked</p>
        <button
          onClick={() => { setShowModal(true); setError(''); }}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium py-2.5 px-5 rounded-xl transition-all text-sm shadow-lg shadow-indigo-200"
        >
          <Plus className="w-4 h-4" /> Link New Account
        </button>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3.5 rounded-xl text-sm">{success}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : accounts.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No Bank Accounts Linked"
          description="Link a bank account to start sending and receiving money through NexusPay."
          action={
            <button
              onClick={() => setShowModal(true)}
              className="bg-indigo-50 text-indigo-600 border border-indigo-200 font-medium py-2 px-5 rounded-xl text-sm transition-all hover:bg-indigo-100"
            >
              Link Your First Account
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accounts.map(acc => (
            <div key={acc.id} className={`bg-white border rounded-2xl p-6 transition-all shadow-sm ${acc.is_primary ? 'border-indigo-200 ring-1 ring-indigo-100' : 'border-gray-200/80'}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${acc.is_primary ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-gray-800 font-semibold">@{acc.user_handle}</p>
                    <p className="text-xs text-gray-400">{acc.bank_name}</p>
                  </div>
                </div>
                {acc.is_primary && (
                  <span className="text-[10px] uppercase bg-indigo-100 text-indigo-600 px-2.5 py-1 rounded-full font-bold tracking-wider flex items-center gap-1">
                    <Star className="w-3 h-3" /> Primary
                  </span>
                )}
              </div>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Account</span>
                  <span className="text-gray-600 font-mono text-xs">••••{acc.account_number?.slice(-4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">IFSC</span>
                  <span className="text-gray-600 font-mono text-xs">{acc.ifsc_code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Branch</span>
                  <span className="text-gray-600 text-xs">{acc.branch}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-100">
                  <span className="text-gray-400">Balance</span>
                  <span className="text-gray-900 font-bold">₹{parseFloat(acc.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {!acc.is_primary && (
                <button
                  onClick={() => handleSetPrimary(acc.id)}
                  disabled={settingPrimary === acc.id}
                  className="w-full flex items-center justify-center gap-2 bg-gray-50 hover:bg-indigo-50 text-gray-500 hover:text-indigo-600 border border-gray-200 hover:border-indigo-200 font-medium py-2 rounded-xl transition-all text-xs"
                >
                  {settingPrimary === acc.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Star className="w-3.5 h-3.5" />}
                  Set as Primary
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Link Bank Account">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-4 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-4">
          {formFields.map(({ key, label, icon: Icon, placeholder, required }) => (
            <div key={key}>
              <label className="block text-gray-500 text-xs font-medium mb-1.5 uppercase tracking-wider">{label}</label>
              <div className="relative">
                <Icon className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text" value={form[key]} onChange={e => updateField(key, e.target.value)} required={required}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl py-2.5 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all placeholder-gray-400 text-sm"
                  placeholder={placeholder}
                />
              </div>
            </div>
          ))}

          <p className="text-xs text-gray-500 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
            💡 Your first linked account will automatically be set as your primary receiving account with a demo balance of ₹10,000.
          </p>

          <button
            type="submit" disabled={creating}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
          >
            {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Link Account'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
