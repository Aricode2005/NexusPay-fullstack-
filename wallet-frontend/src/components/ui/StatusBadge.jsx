const STATUS_STYLES = {
  SUCCESS: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  PENDING: 'bg-amber-50 text-amber-600 border-amber-200',
  FAILED: 'bg-red-50 text-red-600 border-red-200',
  EXPIRED: 'bg-gray-100 text-gray-500 border-gray-200',
  DEBIT: 'bg-red-50 text-red-600 border-red-200',
  CREDIT: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  SELF: 'bg-blue-50 text-blue-600 border-blue-200',
  ACCOUNT_FROZEN: 'bg-blue-50 text-blue-600 border-blue-200',
  FRAUD_ALERT: 'bg-red-50 text-red-600 border-red-200',
  FRAUD_REVIEW: 'bg-amber-50 text-amber-600 border-amber-200',
  LOW: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  MEDIUM: 'bg-amber-50 text-amber-600 border-amber-200',
  HIGH: 'bg-orange-50 text-orange-600 border-orange-200',
  CRITICAL: 'bg-red-50 text-red-600 border-red-200',
};

export default function StatusBadge({ status, className = '' }) {
  const style = STATUS_STYLES[status] || 'bg-gray-100 text-gray-500 border-gray-200';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${style} ${className}`}>
      {status}
    </span>
  );
}
