import { useState, useCallback } from 'react';

interface ConfirmationState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  type: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export const useConfirmation = () => {
  const [confirmation, setConfirmation] = useState<ConfirmationState>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'OK',
    cancelText: 'Cancel',
    type: 'warning',
    onConfirm: () => {},
    onCancel: () => {},
  });

  const showConfirmation = useCallback((
    title: string,
    message: string,
    onConfirm: () => void,
    options?: {
      confirmText?: string;
      cancelText?: string;
      type?: 'danger' | 'warning' | 'info';
    }
  ) => {
    setConfirmation({
      isOpen: true,
      title,
      message,
      confirmText: options?.confirmText || 'OK',
      cancelText: options?.cancelText || 'Cancel',
      type: options?.type || 'warning',
      onConfirm: () => {
        onConfirm();
        hideConfirmation();
      },
      onCancel: hideConfirmation,
    });
  }, []);

  const hideConfirmation = useCallback(() => {
    setConfirmation(prev => ({ ...prev, isOpen: false }));
  }, []);

  const confirmDelete = useCallback((
    itemName: string,
    onConfirm: () => void
  ) => {
    showConfirmation(
      'Delete Confirmation',
      `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
      onConfirm,
      {
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'danger'
      }
    );
  }, [showConfirmation]);

  const confirmAction = useCallback((
    title: string,
    message: string,
    onConfirm: () => void,
    confirmText = 'Confirm'
  ) => {
    showConfirmation(
      title,
      message,
      onConfirm,
      {
        confirmText,
        cancelText: 'Cancel',
        type: 'warning'
      }
    );
  }, [showConfirmation]);

  return {
    confirmation,
    showConfirmation,
    hideConfirmation,
    confirmDelete,
    confirmAction,
  };
};