import { create } from 'zustand';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertState {
  isVisible: boolean;
  type: AlertType;
  title: string;
  message: string;
  confirmText: string;
  cancelText?: string;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  show: (params: {
    type?: AlertType;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void | Promise<void>;
    onCancel?: () => void;
  }) => void;
  hide: () => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  isVisible: false,
  type: 'info',
  title: '',
  message: '',
  confirmText: 'OK',
  cancelText: undefined,
  onConfirm: undefined,
  onCancel: undefined,

  show: ({ 
    type = 'info', 
    title, 
    message, 
    confirmText = 'OK', 
    cancelText, 
    onConfirm,
    onCancel 
  }) => {
    set({
      isVisible: true,
      type,
      title,
      message,
      confirmText,
      cancelText,
      onConfirm,
      onCancel,
    });
  },

  hide: () => {
    set({
      isVisible: false,
    });
  },
}));
