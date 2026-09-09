import { useState, useEffect } from 'react';
import { ShieldCheck, ShieldOff, CheckCircle, Loader2, Clock } from 'lucide-react';
import api from '../api';
import StatusBadge from './ui/StatusBadge';

export default function SecurityPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStatus = async () => {
      setLoading(true);
      try {
        const res = await api.getFraudStatus();
        setData(res);
      } catch (err) {
        setError(err.message || 'Failed to load security status');
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm">{error}</div>
      </div>
    );
  }

  const riskScore = data?.riskScore || 0;
  const riskColor = riskScore >= 60 ? 'text-red-500' : riskScore >= 30 ? 'text-amber-500' : 'text-emerald-500';
  const riskBg = riskScore >= 60 ? 'from-red-50 to-red-100/50' : riskScore >= 30 ? 'from-amber-50 to-amber-100/50' : 'from-emerald-50 to-emerald-100/50';
  const riskLabel = riskScore >= 60 ? 'HIGH RISK' : riskScore >= 30 ? 'MEDIUM RISK' : 'LOW RISK';

  return (
    <div className="p-8 space-y-6 overflow-y-auto">
      {data?.accountFrozen && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-start gap-4">
          <div className="bg-red-100 p-3 rounded-xl shrink-0">
            <ShieldOff className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-red-600 mb-1">Account Frozen</h3>
            <p className="text-red-500 text-sm mb-2">{data.frozenReason || 'Suspicious activity detected on your account.'}</p>
            <p className="text-red-400 text-xs">
              Frozen at: {data.frozenAt ? new Date(data.frozenAt).toLocaleString() : 'Unknown'} — Contact support to verify your identity.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`bg-gradient-to-br ${riskBg} border border-gray-200/80 rounded-2xl p-6`}>
          <div className="flex items-center gap-2 text-sm mb-3 text-gray-500">
            <ShieldCheck className="w-4 h-4" /> Risk Assessment
          </div>
          <div className="flex items-baseline gap-3">
            <span className={`text-5xl font-bold ${riskColor}`}>{riskScore}</span>
            <span className="text-gray-400 text-sm">/ 100</span>
          </div>
          <p className={`text-xs font-bold uppercase tracking-wider mt-2 ${riskColor}`}>{riskLabel}</p>
          <p className="text-xs text-gray-400 mt-3">
            Calculated from unresolved fraud events. Lower is safer.
          </p>
        </div>

        <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm mb-3 text-gray-500">
            {data?.accountFrozen ? <ShieldOff className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
            Account Status
          </div>
          <div className="text-2xl font-bold mb-2">
            {data?.accountFrozen ? (
              <span className="text-red-500">Frozen</span>
            ) : (
              <span className="text-emerald-500">Active</span>
            )}
          </div>
          <p className="text-xs text-gray-400">
            {data?.accountFrozen
              ? 'Transactions are blocked until your identity is verified.'
              : 'Your account is in good standing. No restrictions.'}
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">🤖 AI Fraud Detection Agent</h3>
        <p className="text-xs text-gray-500 leading-relaxed mb-4">
          Every transaction is analyzed in real-time by an autonomous LangGraph AI agent powered by Qwen 2.5.
          The agent evaluates transaction velocity, amount anomalies, and historical patterns to determine risk levels.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { level: 'LOW', desc: 'Normal activity', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600' },
            { level: 'MEDIUM', desc: 'Flagged for review', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600' },
            { level: 'HIGH', desc: 'Alert sent to user', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600' },
            { level: 'CRITICAL', desc: 'Account frozen', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-600' },
          ].map(r => (
            <div key={r.level} className={`${r.bg} border ${r.border} rounded-xl p-3 text-center`}>
              <p className={`text-xs font-bold ${r.text} mb-1`}>{r.level}</p>
              <p className="text-[10px] text-gray-500">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Fraud Event Log</h3>

        {(!data?.recentEvents || data.recentEvents.length === 0) ? (
          <div className="text-center py-8">
            <CheckCircle className="w-10 h-10 text-emerald-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No fraud events detected. Your account is clean.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.recentEvents.map(event => (
              <div key={event.id} className={`border rounded-xl px-5 py-4 ${
                event.risk_level === 'CRITICAL' ? 'bg-red-50/50 border-red-200' :
                event.risk_level === 'HIGH' ? 'bg-orange-50/50 border-orange-200' :
                'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={event.risk_level} />
                    <StatusBadge status={event.action_taken?.replace(/_/g, ' ')} />
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                    <Clock className="w-3 h-3" />
                    {new Date(event.created_at).toLocaleString()}
                  </div>
                </div>
                {event.agent_reasoning && (
                  <p className="text-xs text-gray-500 leading-relaxed mt-2">{event.agent_reasoning}</p>
                )}
                <div className="mt-2">
                  {event.resolved ? (
                    <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600">Resolved</span>
                  ) : (
                    <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-600">Unresolved</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
