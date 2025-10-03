'use client';

import { useEffect } from 'react';
import { getWebSocketManager } from '@/lib/websocket';

export default function WebSocketInitializer() {
  useEffect(() => {
    getWebSocketManager();
  }, []);

  return null;
}
