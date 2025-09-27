'use client';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'green' | 'blue' | 'gray' | 'white';
  className?: string;
}

export default function LoadingSpinner({ 
  size = 'md', 
  color = 'green',
  className = ''
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  const colorClasses = {
    green: 'border-green-600',
    blue: 'border-blue-600',
    gray: 'border-gray-600',
    white: 'border-white'
  };

  return (
    <div 
      className={`
        animate-spin rounded-full border-2 border-t-transparent
        ${sizeClasses[size]} 
        ${colorClasses[color]}
        ${className}
      `}
    />
  );
}

interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  message?: string;
}

export function LoadingOverlay({ isLoading, children, message = 'Loading...' }: LoadingOverlayProps) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
          <div className="flex flex-col items-center space-y-3">
            <LoadingSpinner size="lg" />
            <p className="text-sm text-gray-600">{message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
