const TITLES = {
  dashboard: 'Dashboard',
  transfer: 'Send Money',
  history: 'Transaction History',
  accounts: 'Bank Accounts',
  notifications: 'Notifications',
  security: 'Security Center',
  assistant: 'AI Financial Assistant',
};

export default function Header({ activeTab, profile }) {
  return (
    <header className="h-16 flex items-center justify-between px-8 border-b border-gray-200/80 bg-white/80 backdrop-blur-md shrink-0">
      <h1 className="text-xl font-semibold text-gray-900">{TITLES[activeTab] || 'Dashboard'}</h1>
      {profile?.user && (
        <span className="text-sm text-gray-400 hidden sm:block">
          Welcome, <span className="text-gray-600 font-medium">{profile.user.full_name}</span>
        </span>
      )}
    </header>
  );
}
