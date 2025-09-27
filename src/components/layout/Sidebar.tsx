'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  CreditCardIcon,
  DocumentTextIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ClockIcon,
  DocumentMagnifyingGlassIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  ChatBubbleLeftRightIcon as ChatIconSolid,
  UserGroupIcon as UserGroupIconSolid,
  CreditCardIcon as CreditCardIconSolid,
  DocumentTextIcon as DocumentTextIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  Cog6ToothIcon as Cog6ToothIconSolid,
  ClockIcon as ClockIconSolid,
  DocumentMagnifyingGlassIcon as DocumentMagnifyingGlassIconSolid
} from '@heroicons/react/24/solid';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { 
    name: 'Dashboard', 
    href: '/', 
    icon: HomeIcon, 
    iconSolid: HomeIconSolid,
    description: 'Overview and quick stats'
  },
  { 
    name: 'Chat', 
    href: '/chat', 
    icon: ChatBubbleLeftRightIcon, 
    iconSolid: ChatIconSolid,
    description: 'Send and receive messages'
  },
  { 
    name: 'Contacts', 
    href: '/contacts', 
    icon: UserGroupIcon, 
    iconSolid: UserGroupIconSolid,
    description: 'Manage your contacts'
  },
  { 
    name: 'Accounts', 
    href: '/accounts', 
    icon: CreditCardIcon, 
    iconSolid: CreditCardIconSolid,
    description: 'WhatsApp Business accounts'
  },
  { 
    name: 'Templates', 
    href: '/templates', 
    icon: DocumentTextIcon, 
    iconSolid: DocumentTextIconSolid,
    description: 'Message templates'
  },
  { 
    name: 'Analytics', 
    href: '/analytics', 
    icon: ChartBarIcon, 
    iconSolid: ChartBarIconSolid,
    description: 'Reports and insights'
  },
  { 
    name: 'History', 
    href: '/history', 
    icon: ClockIcon, 
    iconSolid: ClockIconSolid,
    description: 'Message history'
  },
  { 
    name: 'Logs', 
    href: '/logs', 
    icon: DocumentMagnifyingGlassIcon, 
    iconSolid: DocumentMagnifyingGlassIconSolid,
    description: 'Webhook logs'
  },
  { 
    name: 'Settings', 
    href: '/settings', 
    icon: Cog6ToothIcon, 
    iconSolid: Cog6ToothIconSolid,
    description: 'App configuration'
  },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 lg:hidden">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">WA</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">WhatsApp Business</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = isActive ? item.iconSolid : item.icon;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => {
                    // Close mobile sidebar when navigating
                    if (window.innerWidth < 1024) {
                      onClose();
                    }
                  }}
                  className={`
                    group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200
                    ${isActive 
                      ? 'bg-green-100 text-green-700 border-r-2 border-green-500' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon 
                    className={`
                      mr-3 h-5 w-5 flex-shrink-0
                      ${isActive ? 'text-green-500' : 'text-gray-400 group-hover:text-gray-500'}
                    `} 
                  />
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                  </div>
                  {isActive && (
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="bg-green-50 rounded-lg p-3">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-green-800">System Online</p>
                  <p className="text-xs text-green-600">All services running</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
