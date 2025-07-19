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
    primary: 'text-accent-gold',
    secondary: 'text-text-muted',
    success: 'text-vechain-green',
    warning: 'text-accent-amber',
    error: 'text-red-400'
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-accent-gold/30 border-t-current ${sizeClasses[size]} ${colorClasses[color]} ${className}`} />
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
    primary: 'bg-accent-gold',
    secondary: 'bg-text-muted',
    success: 'bg-vechain-green',
    warning: 'bg-accent-amber',
    error: 'bg-red-400'
  };

  const progressWidth = Math.min(100, Math.max(0, progress));

  return (
    <div className={`w-full ${className}`}>
      <div className={`w-full bg-primary-blue/30 rounded-full ${sizeClasses[size]}`}>
        <div 
          className={`${colorClasses[color]} ${sizeClasses[size]} rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${progressWidth}%` }}
        />
      </div>
      {showPercentage && (
        <div className="text-xs text-text-muted mt-1 text-right font-body">
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
    <div className={`bg-background-card border border-accent-gold/30 rounded-xl shadow-sarcophagus p-6 ${className}`}>
      <div className="flex items-center space-x-3 mb-4">
        <LoadingSpinner size="md" color="primary" />
        <div className="flex-1">
          <h3 className="font-heading font-semibold text-accent-gold">{title}</h3>
          {message && (
            <p className="text-sm text-text-secondary mt-1 font-body">{message}</p>
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
          <p className="text-sm font-medium text-accent-gold font-body">Current Step:</p>
          <p className="text-sm text-text-secondary font-body">{step}</p>
        </div>
      )}

      {showTimer && (estimatedTime || startTime) && (
        <div className="flex justify-between text-xs text-text-muted font-body">
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
                className="h-4 bg-accent-gold/20 rounded animate-pulse"
                style={{ width: `${Math.random() * 40 + 60}%` }}
              />
            ))}
          </div>
        );
      
      case 'title':
        return (
          <div className="h-6 bg-accent-gold/20 rounded animate-pulse w-3/4" />
        );
      
      case 'button':
        return (
          <div className="h-10 bg-accent-gold/20 rounded animate-pulse w-24" />
        );
      
      case 'card':
        return (
          <div className="bg-background-card border border-accent-gold/30 rounded-xl shadow-sarcophagus p-6">
            <div className="h-6 bg-accent-gold/20 rounded animate-pulse w-1/2 mb-4" />
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div 
                  key={i} 
                  className="h-4 bg-accent-gold/20 rounded animate-pulse"
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
              <div key={i} className="flex items-center space-x-3 p-3 bg-primary-blue/20 rounded-lg border border-accent-gold/20">
                <div className="w-8 h-8 bg-accent-gold/20 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-accent-gold/20 rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-accent-gold/20 rounded animate-pulse w-1/2" />
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