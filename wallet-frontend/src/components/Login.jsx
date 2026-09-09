import { useState } from 'react';
import { Wallet, User, Lock, Loader2, ArrowRight } from 'lucide-react';
import api from '../api';

export default function Login({ onLogin, onSwitchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.login(email, password);
      localStorage.setItem('token', data.token);
      onLogin(data.token);
    } catch (err) {
      if (err.status === 429) {
        setError('Too many login attempts. Please wait before trying again.');
        setCooldown(60);
        const interval = setInterval(() => {
          setCooldown(prev => {
            if (prev <= 1) { clearInterval(interval); return 0; }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(err.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-100/60 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-100/60 rounded-full blur-3xl" />
      <div className="absolute top-0 right-1/3 w-72 h-72 bg-amber-100/40 rounded-full blur-3xl" />

      <div className="bg-white/80 backdrop-blur-xl border border-gray-200/80 rounded-3xl shadow-xl shadow-gray-200/50 w-full max-w-md p-10 relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-2xl mb-5 shadow-lg shadow-indigo-200">
            <Wallet className="text-white w-9 h-9" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">NexusPay</h1>
          <p className="text-gray-500 mt-2 text-sm">Enterprise Digital Wallet</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3.5 rounded-xl mb-5 text-sm text-center">
            {error}
          </div>
        )}

        {cooldown > 0 && (
          <div className="bg-amber-50 border border-amber-200 text-amber-700 p-3 rounded-xl mb-5 text-sm text-center">
            Rate limited — retry in <span className="font-bold">{cooldown}s</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-600 text-xs font-medium mb-2 uppercase tracking-wider">Email</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all placeholder-gray-400"
                placeholder="you@example.com"
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-600 text-xs font-medium mb-2 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)} required
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all placeholder-gray-400"
                placeholder="••••••••"
              />
            </div>
          </div>
          <button
            type="submit" disabled={loading || cooldown > 0}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-3.5 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            Don't have an account?{' '}
            <button onClick={onSwitchToRegister} className="text-indigo-600 hover:text-indigo-500 font-medium transition-colors">
              Create one
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
