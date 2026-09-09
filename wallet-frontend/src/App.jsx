import { useState, useEffect } from 'react';
import api from './api';
import Login from './components/Login';
import Register from './components/Register';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardPage from './components/DashboardPage';
import TransferPage from './components/TransferPage';
import HistoryPage from './components/HistoryPage';
import AccountsPage from './components/AccountsPage';
import NotificationsPage from './components/NotificationsPage';
import SecurityPage from './components/SecurityPage';
import AIChatPage from './components/AIChatPage';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [authPage, setAuthPage] = useState('login');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [profile, setProfile] = useState(null);

  const handleLogout = () => {
    setToken(null);
    setProfile(null);
    localStorage.removeItem('token');
  };

  useEffect(() => {
    api.onUnauthorized = handleLogout;
  }, []);

  useEffect(() => {
    if (!token) return;
    const fetchProfile = async () => {
      try {
        const data = await api.getProfile();
        setProfile(data);
      } catch { /* ignore */ }
    };
    fetchProfile();
  }, [token]);

  useEffect(() => {
    if (!token || activeTab !== 'dashboard') return;
    const refresh = async () => {
      try {
        const data = await api.getProfile();
        setProfile(data);
      } catch { /* ignore */ }
    };
    refresh();
  }, [token, activeTab]);

  if (!token) {
    if (authPage === 'register') {
      return <Register onSwitchToLogin={() => setAuthPage('login')} />;
    }
    return (
      <Login
        onLogin={setToken}
        onSwitchToRegister={() => setAuthPage('register')}
      />
    );
  }

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage profile={profile} onTabChange={setActiveTab} />;
      case 'transfer':
        return <TransferPage profile={profile} />;
      case 'history':
        return <HistoryPage />;
      case 'accounts':
        return <AccountsPage />;
      case 'notifications':
        return <NotificationsPage />;
      case 'security':
        return <SecurityPage />;
      case 'assistant':
        return <AIChatPage />;
      default:
        return <DashboardPage profile={profile} onTabChange={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        profile={profile}
        onLogout={handleLogout}
      />
      <main className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <Header activeTab={activeTab} profile={profile} />
        <div className={`flex-1 flex flex-col ${activeTab === 'assistant' ? 'overflow-hidden' : 'overflow-auto'} bg-gray-50`}>
          {renderPage()}
        </div>
      </main>
    </div>
  );
}
