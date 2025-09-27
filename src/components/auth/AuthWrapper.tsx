'use client';

import { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Set mounted to true after component mounts to prevent hydration mismatch
    setIsMounted(true);
  }, []);

  // Show a simple loading state before mounting to avoid hydration issues
  if (!isMounted) {
    return null;
  }

  // For all routes, wrap with MainLayout
  return (
    <MainLayout>
      {children}
    </MainLayout>
  );
}
