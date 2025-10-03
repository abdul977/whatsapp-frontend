import { io, Socket } from 'socket.io-client';
import { useAppStore } from '@/store/useAppStore';
import { Message } from './api';

const normalizePhoneNumber = (value: string) => value.replace(/[^0-9]/g, '');

class WebSocketManager {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;

  constructor() {
    this.connect();
  }

  connect() {
    if (this.isConnecting || this.socket?.connected) {
      return;
    }

    this.isConnecting = true;
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8000';
    
    console.log('Connecting to WebSocket:', wsUrl);

    this.socket = io(wsUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected');
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      
      useAppStore.getState().setWsConnected(true);
      useAppStore.getState().setWsReconnecting(false);
      useAppStore.getState().addNotification({
        type: 'success',
        title: 'Connected',
        message: 'Real-time updates are now active'
      });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
      this.isConnecting = false;
      
      useAppStore.getState().setWsConnected(false);
      
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, try to reconnect
        this.handleReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
      this.isConnecting = false;
      
      useAppStore.getState().setWsConnected(false);
      this.handleReconnect();
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 WebSocket reconnected after ${attemptNumber} attempts`);
      useAppStore.getState().setWsReconnecting(false);
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 WebSocket reconnection attempt ${attemptNumber}`);
      useAppStore.getState().setWsReconnecting(true);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('❌ WebSocket reconnection failed');
      useAppStore.getState().setWsReconnecting(false);
      useAppStore.getState().addNotification({
        type: 'error',
        title: 'Connection Failed',
        message: 'Unable to establish real-time connection. Please refresh the page.'
      });
    });

    // Message events
    this.socket.on('new_message', (data: {
      account_id: string;
      phone_number: string;
      message: Message;
    }) => {
      console.log('📨 New message received:', data);
      
      const { addMessage, addContact, currentAccount } = useAppStore.getState();
      console.log('currentAccount in store:', currentAccount);
      
      // Only process messages for the current account
      if (!currentAccount || data.account_id !== currentAccount.id) {
        console.log('Message ignored because account does not match');
        return;
      }

      // Add message to store
      const normalizedPhone = normalizePhoneNumber(data.phone_number);
      const messagePayload: Message = {
        ...data.message,
        phone_number: data.message.phone_number || data.phone_number,
      };
      addMessage(normalizedPhone, messagePayload);

      // Update or add contact
      addContact({
        phone_number: data.phone_number,
        last_message: data.message.text,
        last_message_time: data.message.timestamp,
        message_count: 1, // This would be updated by a proper API call
        account_id: data.account_id
      });

      // Show notification for incoming messages
      if (data.message.sender_type === 'incoming') {
        useAppStore.getState().addNotification({
          type: 'info',
          title: 'New Message',
          message: `From ${data.phone_number}: ${data.message.text.substring(0, 50)}${data.message.text.length > 50 ? '...' : ''}`
        });
      }
    });

    // System status events
    this.socket.on('system_status', (status: any) => {
      console.log('📊 System status update:', status);
      useAppStore.getState().setSystemStatus(status);
    });

    // Account events
    this.socket.on('account_status', (data: {
      account_id: string;
      status: 'active' | 'inactive' | 'error';
      message?: string;
    }) => {
      console.log('🏢 Account status update:', data);
      
      if (data.status === 'error') {
        useAppStore.getState().addNotification({
          type: 'error',
          title: 'Account Error',
          message: data.message || `Account ${data.account_id} encountered an error`
        });
      }
    });

    // Webhook events
    this.socket.on('webhook_event', (data: any) => {
      console.log('🔗 Webhook event:', data);
      
      // You can handle webhook events here for real-time monitoring
      if (data.type === 'error') {
        useAppStore.getState().addNotification({
          type: 'warning',
          title: 'Webhook Issue',
          message: data.message || 'Webhook encountered an issue'
        });
      }
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    useAppStore.getState().setWsReconnecting(true);

    setTimeout(() => {
      if (!this.socket?.connected) {
        console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  // Join a room for specific phone number updates
  joinRoom(phoneNumber: string) {
    if (this.socket?.connected) {
      this.socket.emit('join_room', { phone_number: phoneNumber });
      console.log(`🏠 Joined room for ${phoneNumber}`);
    }
  }

  // Leave a room
  leaveRoom(phoneNumber: string) {
    if (this.socket?.connected) {
      this.socket.emit('leave_room', { phone_number: phoneNumber });
      console.log(`🚪 Left room for ${phoneNumber}`);
    }
  }

  // Send a custom event
  emit(event: string, data: any) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('⚠️ Cannot emit event: WebSocket not connected');
    }
  }

  // Get connection status
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Disconnect
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    useAppStore.getState().setWsConnected(false);
    useAppStore.getState().setWsReconnecting(false);
  }

  // Reconnect manually
  reconnect() {
    this.disconnect();
    this.reconnectAttempts = 0;
    setTimeout(() => this.connect(), 1000);
  }
}

// Create singleton instance
let wsManager: WebSocketManager | null = null;

export const getWebSocketManager = (): WebSocketManager => {
  if (!wsManager) {
    wsManager = new WebSocketManager();
  }
  return wsManager;
};

// Hook for using WebSocket in components
export const useWebSocket = () => {
  const wsManager = getWebSocketManager();
  
  return {
    isConnected: wsManager.isConnected(),
    joinRoom: wsManager.joinRoom.bind(wsManager),
    leaveRoom: wsManager.leaveRoom.bind(wsManager),
    emit: wsManager.emit.bind(wsManager),
    reconnect: wsManager.reconnect.bind(wsManager),
  };
};

export default WebSocketManager;

