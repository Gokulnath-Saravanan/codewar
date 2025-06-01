import React from 'react';

const LoadingSpinner = ({ 
  size = 'medium', 
  color = 'primary', 
  text = null,
  className = '' 
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
    xlarge: 'w-16 h-16'
  };

  const colorClasses = {
    primary: 'border-primary-500',
    white: 'border-white',
    gray: 'border-gray-500',
    success: 'border-success-500',
    warning: 'border-warning-500',
    danger: 'border-danger-500'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div 
        className={`
          ${sizeClasses[size]} 
          ${colorClasses[color]}
          border-4 border-t-transparent 
          rounded-full animate-spin
        `}
      />
      {text && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {text}
        </p>
      )}
    </div>
  );
};

// Overlay spinner for full-screen loading
export const LoadingOverlay = ({ show, text = 'Loading...' }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl">
        <LoadingSpinner size="large" text={text} />
      </div>
    </div>
  );
};

// Inline loading component for buttons
export const ButtonSpinner = ({ size = 'small', className = '' }) => {
  return (
    <LoadingSpinner 
      size={size} 
      color="white" 
      className={`inline-block ${className}`}
    />
  );
};

export default LoadingSpinner;