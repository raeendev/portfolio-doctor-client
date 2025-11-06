'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, TrendingDown } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'position';

interface PositionNotification {
  type: 'LONG' | 'SHORT';
  symbol: string;
  size: number;
  price: number;
}

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  position?: PositionNotification;
  duration?: number;
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void;
  showPositionNotification: (position: PositionNotification) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration || 5000,
    };
    
    setToasts((prev) => [...prev, newToast]);
    
    // Auto remove after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, newToast.duration);
    }
  }, []);

  const showPositionNotification = useCallback((position: PositionNotification) => {
    const isLong = position.type === 'LONG';
    const title = `Position ${position.type} Opened`;
    const message = `${position.symbol} - ${position.size} @ $${position.price.toFixed(3)}`;
    
    showToast({
      type: 'position',
      title,
      message,
      position,
      duration: 8000, // 8 seconds for position notifications
    });
  }, [showToast]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, showPositionNotification }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const getToastStyles = () => {
    if (toast.type === 'position') {
      const isLong = toast.position?.type === 'LONG';
      return {
        bg: isLong ? 'bg-[#10b981]/20' : 'bg-[#ef4444]/20',
        border: isLong ? 'border-[#10b981]' : 'border-[#ef4444]',
        iconColor: isLong ? 'text-[#10b981]' : 'text-[#ef4444]',
        titleColor: isLong ? 'text-[#10b981]' : 'text-[#ef4444]',
      };
    }
    
    switch (toast.type) {
      case 'success':
        return {
          bg: 'bg-[#10b981]/20',
          border: 'border-[#10b981]',
          iconColor: 'text-[#10b981]',
          titleColor: 'text-[#10b981]',
        };
      case 'error':
        return {
          bg: 'bg-[#ef4444]/20',
          border: 'border-[#ef4444]',
          iconColor: 'text-[#ef4444]',
          titleColor: 'text-[#ef4444]',
        };
      case 'warning':
        return {
          bg: 'bg-[#f59e0b]/20',
          border: 'border-[#f59e0b]',
          iconColor: 'text-[#f59e0b]',
          titleColor: 'text-[#f59e0b]',
        };
      default:
        return {
          bg: 'bg-[#3b82f6]/20',
          border: 'border-[#3b82f6]',
          iconColor: 'text-[#3b82f6]',
          titleColor: 'text-[#3b82f6]',
        };
    }
  };

  const styles = getToastStyles();
  const Icon = toast.type === 'position' 
    ? (toast.position?.type === 'LONG' ? TrendingUp : TrendingDown)
    : TrendingUp;

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.95 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`pointer-events-auto relative ${styles.bg} ${styles.border} border rounded-lg shadow-lg p-4 backdrop-blur-sm`}
    >
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 ${styles.iconColor}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold text-sm ${styles.titleColor} mb-1`}>
            {toast.title}
          </h4>
          {toast.message && (
            <p className="text-xs text-[#e5e7eb] mb-2">
              {toast.message}
            </p>
          )}
          {toast.position && (
            <div className="mt-2 pt-2 border-t border-[#252b3b]">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#9ca3af]">Symbol:</span>
                <span className="text-[#e5e7eb] font-medium">{toast.position.symbol}</span>
              </div>
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-[#9ca3af]">Size:</span>
                <span className="text-[#e5e7eb] font-medium">{toast.position.size}</span>
              </div>
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-[#9ca3af]">Price:</span>
                <span className="text-[#e5e7eb] font-medium">${toast.position.price.toFixed(3)}</span>
              </div>
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-[#9ca3af]">Type:</span>
                <span className={`font-medium ${toast.position.type === 'LONG' ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                  {toast.position.type}
                </span>
              </div>
            </div>
          )}
        </div>
        <button
          onClick={() => onRemove(toast.id)}
          className="flex-shrink-0 text-[#9ca3af] hover:text-[#e5e7eb] transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

