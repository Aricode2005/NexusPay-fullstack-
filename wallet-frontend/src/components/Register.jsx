import { useState } from 'react';
import { Wallet, User, Lock, Mail, Phone, CreditCard, Hash, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import api from '../api';

export default function Register({ onSwitchToLogin }) {
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', password: '', aadharNumber: '', mpin: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const updateField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.mpin && (form.mpin.length !== 4 || !/^\d{4}$/.test(form.mpin))) {
      setError('MPIN must be exactly 4 digits.');
      return;
    }

    if (form.aadharNumber.length !== 12 || !/^\d{12}$/.test(form.aadharNumber)) {
      setError('Aadhar number must be exactly 12 digits.');
      return;
    }

    setLoading(true);
    try {
      await api.register(form);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-xl border border-gray-200/80 rounded-3xl shadow-xl shadow-gray-200/50 w-full max-w-md p-10 text-center">
          <div className="bg-emerald-50 p-4 rounded-2xl inline-flex mb-5">
            <CheckCircle className="w-12 h-12 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Account Created!</h2>
          <p className="text-gray-600 text-sm mb-2">Your identity has been registered successfully.</p>
          <p className="text-gray-400 text-xs mb-8">Please proceed to link a bank account after logging in.</p>
          <button
            onClick={onSwitchToLogin}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-200"
          >
            Continue to Sign In
          </button>
        </div>
      </div>
    );
  }

  const fields = [
    { key: 'fullName', label: 'Full Name', icon: User, type: 'text', placeholder: 'Aritra Das', required: true },
    { key: 'email', label: 'Email Address', icon: Mail, type: 'email', placeholder: 'aritra@example.com', required: true },
    { key: 'phone', label: 'Phone Number', icon: Phone, type: 'tel', placeholder: '+919876543210', required: true },
    { key: 'aadharNumber', label: 'Aadhar Number', icon: CreditCard, type: 'text', placeholder: '123456789012', required: true, maxLength: 12 },
    { key: 'password', label: 'Password', icon: Lock, type: 'password', placeholder: '••••••••', required: true },
    { key: 'mpin', label: 'Transaction PIN (MPIN)', icon: Hash, type: 'password', placeholder: '4-digit PIN', maxLength: 4 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-100/60 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-100/60 rounded-full blur-3xl" />

      <div className="bg-white/80 backdrop-blur-xl border border-gray-200/80 rounded-3xl shadow-xl shadow-gray-200/50 w-full max-w-md p-10 relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-2xl mb-5 shadow-lg shadow-indigo-200">
            <Wallet className="text-white w-9 h-9" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Create Account</h1>
          <p className="text-gray-500 mt-2 text-sm">Register your identity on NexusPay</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3.5 rounded-xl mb-5 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map(({ key, label, icon: Icon, type, placeholder, required, maxLength }) => (
            <div key={key}>
              <label className="block text-gray-600 text-xs font-medium mb-1.5 uppercase tracking-wider">{label}</label>
              <div className="relative">
                <Icon className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                <input
                  type={type}
                  value={form[key]}
                  onChange={e => updateField(key, e.target.value)}
                  required={required}
                  maxLength={maxLength}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl py-2.5 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all placeholder-gray-400 text-sm"
                  placeholder={placeholder}
                />
              </div>
            </div>
          ))}

          <button
            type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-3.5 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 mt-6"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={onSwitchToLogin} className="text-gray-500 hover:text-gray-700 text-sm transition-colors inline-flex items-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
