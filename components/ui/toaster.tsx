'use client';

import { ToastContainer, type ToastProps } from './toast';
import { useToastStore } from '@/lib/toast-store';

export function Toaster({ position = 'top-right' }: { position?: ToastProps['position'] }) {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);
  
  const toastsWithOnClose = toasts.map((toast) => ({
    ...toast,
    onClose: removeToast,
  }));
  
  return <ToastContainer toasts={toastsWithOnClose} onClose={removeToast} position={position} />;
}

