'use client';

import { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { useAppStore } from '@/store/useAppStore';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { accounts, setAccounts, currentAccount, setCurrentAccount } = useAppStore();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetch('http://localhost:8000/api/accounts')
      .then((res) => res.json())
      .then((data) => {
        setAccounts(data.accounts);
        if (data.accounts.length > 0) {
          setCurrentAccount(data.accounts[0]);
        }
      });
  }, [setAccounts, setCurrentAccount]);

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Header */}
        <Header 
          onMenuClick={() => setSidebarOpen(true)}
          currentAccount={currentAccount}
          accounts={accounts}
          onAccountSwitch={(id) => {
            const account = accounts.find(acc => acc.id === id);
            if(account) setCurrentAccount(account)
          }}
        />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
