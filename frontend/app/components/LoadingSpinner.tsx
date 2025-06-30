'use client';

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  className?: string;
}

export function LoadingSpinner({ size = 'md', color = 'primary', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const colorClasses = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600'
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-current ${sizeClasses[size]} ${colorClasses[color]} ${className}`} />
  );
}

interface ProgressBarProps {
  progress: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  showPercentage?: boolean;
  className?: string;
}

export function ProgressBar({ 
  progress, 
  size = 'md', 
  color = 'primary', 
  showPercentage = false, 
  className = '' 
}: ProgressBarProps) {
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  const colorClasses = {
    primary: 'bg-blue-600',
    secondary: 'bg-gray-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    error: 'bg-red-600'
  };

  return (
    <div className={`w-full ${className}`}>
      <div className={`w-full bg-gray-200 rounded-full ${sizeClasses[size]}`}>
        <div 
          className={`${colorClasses[color]} ${sizeClasses[size]} rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
      {showPercentage && (
        <div className="text-xs text-gray-600 mt-1 text-right">
          {Math.round(progress)}%
        </div>
      )}
    </div>
  );
}

interface LoadingCardProps {
  title: string;
  message?: string;
  progress?: number;
  step?: string;
  estimatedTime?: number;
  startTime?: number;
  showProgress?: boolean;
  showStep?: boolean;
  showTimer?: boolean;
  className?: string;
}

export function LoadingCard({ 
  title, 
  message, 
  progress, 
  step, 
  estimatedTime, 
  startTime,
  showProgress = true,
  showStep = true,
  showTimer = true,
  className = '' 
}: LoadingCardProps) {
  const elapsedTime = startTime ? Date.now() - startTime : 0;
  const remainingTime = estimatedTime && startTime ? Math.max(0, estimatedTime - elapsedTime) : 0;

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center space-x-3 mb-4">
        <LoadingSpinner size="md" color="primary" />
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">{title}</h3>
          {message && (
            <p className="text-sm text-gray-600 mt-1">{message}</p>
          )}
        </div>
      </div>

      {showProgress && progress !== undefined && (
        <div className="mb-4">
          <ProgressBar progress={progress} size="md" color="primary" showPercentage />
        </div>
      )}

      {showStep && step && (
        <div className="mb-3">
          <p className="text-sm font-medium text-gray-700">Current Step:</p>
          <p className="text-sm text-gray-600">{step}</p>
        </div>
      )}

      {showTimer && (estimatedTime || startTime) && (
        <div className="flex justify-between text-xs text-gray-500">
          <span>Elapsed: {formatTime(elapsedTime)}</span>
          {estimatedTime && (
            <span>Estimated: {formatTime(estimatedTime)}</span>
          )}
          {remainingTime > 0 && (
            <span>Remaining: {formatTime(remainingTime)}</span>
          )}
        </div>
      )}
    </div>
  );
}

interface SkeletonLoaderProps {
  type: 'text' | 'title' | 'button' | 'card' | 'list';
  lines?: number;
  className?: string;
}

export function SkeletonLoader({ type, lines = 1, className = '' }: SkeletonLoaderProps) {
  const renderSkeleton = () => {
    switch (type) {
      case 'text':
        return (
          <div className="space-y-2">
            {Array.from({ length: lines }).map((_, i) => (
              <div 
                key={i} 
                className="h-4 bg-gray-200 rounded animate-pulse"
                style={{ width: `${Math.random() * 40 + 60}%` }}
              />
            ))}
          </div>
        );
      
      case 'title':
        return (
          <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4" />
        );
      
      case 'button':
        return (
          <div className="h-10 bg-gray-200 rounded animate-pulse w-24" />
        );
      
      case 'card':
        return (
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="h-6 bg-gray-200 rounded animate-pulse w-1/2 mb-4" />
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div 
                  key={i} 
                  className="h-4 bg-gray-200 rounded animate-pulse"
                  style={{ width: `${Math.random() * 30 + 70}%` }}
                />
              ))}
            </div>
          </div>
        );
      
      case 'list':
        return (
          <div className="space-y-3">
            {Array.from({ length: lines }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mb-1" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={className}>
      {renderSkeleton()}
    </div>
  );
} 