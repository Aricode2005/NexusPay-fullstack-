import { useState } from 'react';
import { Send, ArrowRight, CheckCircle, AlertCircle, Loader2, Hash, RotateCcw } from 'lucide-react';
import api from '../api';

export default function TransferPage({ profile }) {
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState('HANDLE');
  const [form, setForm] = useState({
    userHandle: '', receiverHandle: '', bankName: '', accountNumber: '', amount: '', remarks: ''
  });
  const [orderId, setOrderId] = useState('');
  const [txDetails, setTxDetails] = useState(null);
  const [mpin, setMpin] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handles = profile?.handles || [];
  const updateField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleIntent = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        transferMethod: method,
        userHandle: form.userHandle,
        amount: parseFloat(form.amount),
        remarks: form.remarks,
      };
      if (method === 'HANDLE') {
        payload.receiverHandle = form.receiverHandle;
      } else {
        payload.bankName = form.bankName;
        payload.accountNumber = form.accountNumber;
      }
      const data = await api.createIntent(payload);
      setOrderId(data.order_id);
      setTxDetails(data.transaction);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async () => {
    const pin = mpin.join('');
    if (pin.length !== 4) {
      setError('Please enter your 4-digit MPIN');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = await api.executeTransfer(orderId, pin);
      setTxDetails(data.transaction);
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMpinChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newMpin = [...mpin];
    newMpin[index] = value.slice(-1);
    setMpin(newMpin);
    if (value && index < 3) {
      document.getElementById(`mpin-${index + 1}`)?.focus();
    }
  };

  const handleMpinKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !mpin[index] && index > 0) {
      document.getElementById(`mpin-${index - 1}`)?.focus();
    }
  };

  const reset = () => {
    setStep(1);
    setForm({ userHandle: '', receiverHandle: '', bankName: '', accountNumber: '', amount: '', remarks: '' });
    setOrderId('');
    setTxDetails(null);
    setMpin(['', '', '', '']);
    setError('');
  };

  // ─── Step 3: Success ─────────────────────
  if (step === 3) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="bg-emerald-50 p-5 rounded-full inline-flex mb-6">
            <CheckCircle className="w-16 h-16 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Transfer Successful!</h2>
          <p className="text-gray-500 mb-6 text-sm">Your money has been sent securely.</p>

          <div className="bg-white border border-gray-200/80 rounded-2xl p-6 text-left space-y-3 mb-6 shadow-sm">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Amount</span>
              <span className="text-gray-900 font-bold text-lg">₹{parseFloat(txDetails?.amount || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="border-t border-gray-100" />
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">To</span>
              <span className="text-gray-800">@{txDetails?.receiver_handle}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">From</span>
              <span className="text-gray-800">@{txDetails?.sender_handle}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Order ID</span>
              <span className="text-gray-500 text-xs font-mono">{txDetails?.order_id}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Status</span>
              <span className="text-emerald-600 font-semibold">SUCCESS</span>
            </div>
          </div>

          <button
            onClick={reset}
            className="flex items-center gap-2 mx-auto bg-white hover:bg-gray-50 text-gray-600 font-medium py-2.5 px-6 rounded-xl transition-all text-sm border border-gray-200 shadow-sm"
          >
            <RotateCcw className="w-4 h-4" /> New Transfer
          </button>
        </div>
      </div>
    );
  }

  // ─── Step 2: MPIN Verification ─────────────────────
  if (step === 2) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="bg-indigo-50 p-4 rounded-2xl inline-flex mb-4">
              <Hash className="w-8 h-8 text-indigo-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Verify Transaction</h2>
            <p className="text-gray-400 text-sm">Enter your 4-digit MPIN to authorize</p>
          </div>

          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 mb-6 space-y-2.5 shadow-sm">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Sending</span>
              <span className="text-gray-900 font-bold">₹{parseFloat(txDetails?.amount || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">From</span>
              <span className="text-gray-800">@{txDetails?.sender_handle}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">To</span>
              <span className="text-gray-800">@{txDetails?.receiver_handle}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Bank</span>
              <span className="text-gray-500">{txDetails?.receiver_bank_name}</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-5 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          <div className="flex justify-center gap-3 mb-6">
            {mpin.map((digit, i) => (
              <input
                key={i}
                id={`mpin-${i}`}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleMpinChange(i, e.target.value)}
                onKeyDown={e => handleMpinKeyDown(i, e)}
                className="w-14 h-14 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
              />
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => { setStep(1); setMpin(['', '', '', '']); setError(''); }}
              className="flex-1 bg-white hover:bg-gray-50 text-gray-600 font-medium py-3 rounded-xl transition-all text-sm border border-gray-200"
            >
              Back
            </button>
            <button
              onClick={handleExecute}
              disabled={loading || mpin.join('').length !== 4}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Confirm <ArrowRight className="w-4 h-4" /></>}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Step 1: Transfer Intent ─────────────────────
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="w-full max-w-lg">
        <div className="bg-white border border-gray-200/80 rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-indigo-50 p-2.5 rounded-xl">
              <Send className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Send Money</h2>
              <p className="text-xs text-gray-400">Step 1 of 2 — Enter transfer details</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-5 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleIntent} className="space-y-4">
            <div>
              <label className="block text-gray-500 text-xs font-medium mb-2 uppercase tracking-wider">Transfer Method</label>
              <div className="grid grid-cols-2 gap-2">
                {['HANDLE', 'BANK_ACCOUNT'].map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMethod(m)}
                    className={`py-2.5 rounded-xl text-sm font-medium transition-all ${
                      method === m
                        ? 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                        : 'bg-gray-50 text-gray-400 border border-gray-200 hover:text-gray-600'
                    }`}
                  >
                    {m === 'HANDLE' ? 'By Handle' : 'By Bank Account'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-gray-500 text-xs font-medium mb-2 uppercase tracking-wider">Send From</label>
              <select
                value={form.userHandle}
                onChange={e => updateField('userHandle', e.target.value)}
                required
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all appearance-none"
              >
                <option value="">Select your handle</option>
                {handles.map(h => (
                  <option key={h.id} value={h.user_handle}>
                    @{h.user_handle} — ₹{parseFloat(h.balance).toLocaleString('en-IN')} ({h.bank_name})
                  </option>
                ))}
              </select>
            </div>

            {method === 'HANDLE' ? (
              <div>
                <label className="block text-gray-500 text-xs font-medium mb-2 uppercase tracking-wider">Receiver Handle</label>
                <input
                  type="text" value={form.receiverHandle} onChange={e => updateField('receiverHandle', e.target.value)} required
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all placeholder-gray-400"
                  placeholder="e.g. priya@sbi"
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-gray-500 text-xs font-medium mb-2 uppercase tracking-wider">Bank Name</label>
                  <input
                    type="text" value={form.bankName} onChange={e => updateField('bankName', e.target.value)} required
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all placeholder-gray-400"
                    placeholder="e.g. State Bank of India"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 text-xs font-medium mb-2 uppercase tracking-wider">Account Number</label>
                  <input
                    type="text" value={form.accountNumber} onChange={e => updateField('accountNumber', e.target.value)} required
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all placeholder-gray-400"
                    placeholder="Account number"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-gray-500 text-xs font-medium mb-2 uppercase tracking-wider">Amount (₹)</label>
              <input
                type="number" value={form.amount} onChange={e => updateField('amount', e.target.value)} required min="1" step="0.01"
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all placeholder-gray-400 text-lg font-semibold"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-gray-500 text-xs font-medium mb-2 uppercase tracking-wider">Remarks (Optional)</label>
              <input
                type="text" value={form.remarks} onChange={e => updateField('remarks', e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all placeholder-gray-400"
                placeholder="e.g. Dinner split"
              />
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-3.5 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 mt-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Continue to Verify <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
