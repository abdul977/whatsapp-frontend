import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Account, Contact, Message } from '@/lib/api';

// Types
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface SystemStatus {
  online: boolean;
  redis_connected: boolean;
  webhook_status: 'active' | 'inactive' | 'error';
  last_updated: string;
}

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface AppState {
  // User state
  user: User | null;
  isAuthenticated: boolean;
  
  // System state
  systemStatus: SystemStatus | null;
  loading: boolean;
  error: string | null;
  
  // Accounts
  accounts: Account[];
  currentAccount: Account | null;
  
  // Contacts
  contacts: Contact[];
  selectedContact: Contact | null;
  
  // Messages
  messages: Record<string, Message[]>; // phone_number -> messages
  
  // Notifications
  notifications: Notification[];
  unreadCount: number;
  
  // UI state
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  
  // WebSocket state
  wsConnected: boolean;
  wsReconnecting: boolean;
}

interface AppActions {
  // User actions
  setUser: (user: User | null) => void;
  login: (user: User) => void;
  logout: () => void;
  
  // System actions
  setSystemStatus: (status: SystemStatus) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Account actions
  setAccounts: (accounts: Account[]) => void;
  setCurrentAccount: (account: Account | null) => void;
  switchAccount: (accountId: string) => void;
  
  // Contact actions
  setContacts: (contacts: Contact[]) => void;
  setSelectedContact: (contact: Contact | null) => void;
  addContact: (contact: Contact) => void;
  updateContact: (phoneNumber: string, updates: Partial<Contact>) => void;
  
  // Message actions
  setMessages: (phoneNumber: string, messages: Message[]) => void;
  addMessage: (phoneNumber: string, message: Message) => void;
  clearMessages: (phoneNumber: string) => void;
  
  // Notification actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  
  // UI actions
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  
  // WebSocket actions
  setWsConnected: (connected: boolean) => void;
  setWsReconnecting: (reconnecting: boolean) => void;
  
  // Utility actions
  reset: () => void;
}

const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  systemStatus: null,
  loading: false,
  error: null,
  accounts: [],
  currentAccount: null,
  contacts: [],
  selectedContact: null,
  messages: {},
  notifications: [],
  unreadCount: 0,
  sidebarOpen: false,
  theme: 'light',
  wsConnected: false,
  wsReconnecting: false,
};

export const useAppStore = create<AppState & AppActions>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        // User actions
        setUser: (user) => set({ user, isAuthenticated: !!user }),
        login: (user) => set({ user, isAuthenticated: true }),
        logout: () => set({ 
          user: null, 
          isAuthenticated: false,
          currentAccount: null,
          contacts: [],
          messages: {},
          notifications: [],
          unreadCount: 0
        }),
        
        // System actions
        setSystemStatus: (systemStatus) => set({ systemStatus }),
        setLoading: (loading) => set({ loading }),
        setError: (error) => set({ error }),
        
        // Account actions
        setAccounts: (accounts) => set({ accounts }),
        setCurrentAccount: (currentAccount) => set({ currentAccount }),
        switchAccount: (accountId) => {
          const { accounts } = get();
          const account = accounts.find(acc => acc.id === accountId);
          if (account) {
            set({ 
              currentAccount: account,
              contacts: [], // Clear contacts when switching accounts
              messages: {}, // Clear messages when switching accounts
              selectedContact: null
            });
          }
        },
        
        // Contact actions
        setContacts: (contacts) => set({ contacts }),
        setSelectedContact: (selectedContact) => set({ selectedContact }),
        addContact: (contact) => {
          const { contacts } = get();
          const existingIndex = contacts.findIndex(c => c.phone_number === contact.phone_number);
          if (existingIndex >= 0) {
            // Update existing contact
            const updatedContacts = [...contacts];
            updatedContacts[existingIndex] = { ...updatedContacts[existingIndex], ...contact };
            set({ contacts: updatedContacts });
          } else {
            // Add new contact
            set({ contacts: [...contacts, contact] });
          }
        },
        updateContact: (phoneNumber, updates) => {
          const { contacts } = get();
          const updatedContacts = contacts.map(contact =>
            contact.phone_number === phoneNumber
              ? { ...contact, ...updates }
              : contact
          );
          set({ contacts: updatedContacts });
        },
        
        // Message actions
        setMessages: (phoneNumber, messages) => {
          const { messages: currentMessages } = get();
          set({
            messages: {
              ...currentMessages,
              [phoneNumber]: messages
            }
          });
        },
        addMessage: (phoneNumber, message) => {
          const { messages: currentMessages } = get();
          const existingMessages = currentMessages[phoneNumber] || [];
          
          // Check if message already exists (prevent duplicates)
          const messageExists = existingMessages.some(m => 
            m.id === message.id || m.message_id === message.message_id
          );
          
          if (!messageExists) {
            set({
              messages: {
                ...currentMessages,
                [phoneNumber]: [...existingMessages, message].sort(
                  (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                )
              }
            });
          }
        },
        clearMessages: (phoneNumber) => {
          const { messages: currentMessages } = get();
          const { [phoneNumber]: removed, ...rest } = currentMessages;
          set({ messages: rest });
        },
        
        // Notification actions
        addNotification: (notification) => {
          const { notifications } = get();
          const newNotification: Notification = {
            ...notification,
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            read: false
          };
          
          set({ 
            notifications: [newNotification, ...notifications].slice(0, 50), // Keep only last 50
            unreadCount: get().unreadCount + 1
          });
        },
        markNotificationRead: (id) => {
          const { notifications, unreadCount } = get();
          const updatedNotifications = notifications.map(notif =>
            notif.id === id ? { ...notif, read: true } : notif
          );
          const wasUnread = notifications.find(n => n.id === id && !n.read);
          
          set({ 
            notifications: updatedNotifications,
            unreadCount: wasUnread ? Math.max(0, unreadCount - 1) : unreadCount
          });
        },
        clearNotifications: () => set({ notifications: [], unreadCount: 0 }),
        
        // UI actions
        setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
        setTheme: (theme) => set({ theme }),
        
        // WebSocket actions
        setWsConnected: (wsConnected) => set({ wsConnected }),
        setWsReconnecting: (wsReconnecting) => set({ wsReconnecting }),
        
        // Utility actions
        reset: () => set(initialState),
      }),
      {
        name: 'whatsapp-app-store',
        partialize: (state) => ({
          currentAccount: state.currentAccount,
          theme: state.theme,
        }),
      }
    ),
    {
      name: 'whatsapp-app-store',
    }
  )
);
