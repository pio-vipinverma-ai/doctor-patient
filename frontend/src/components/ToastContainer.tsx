import React, { useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import styles from './ToastContainer.module.scss';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className={styles.toastContainer}>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={removeToast}
        />
      ))}
    </div>
  );
};

interface ToastProps {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ id, message, type, onClose }) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '';
    }
  };

  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      <div className={styles.toastIcon}>{getIcon()}</div>
      <div className={styles.toastMessage}>{message}</div>
      <button
        className={styles.toastClose}
        onClick={() => onClose(id)}
        aria-label="Close"
      >
        ×
      </button>
    </div>
  );
};
