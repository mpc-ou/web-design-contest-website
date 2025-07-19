import { useState } from 'react';

/**
 * Hook để quản lý thông báo snackbar
 * @returns {Object} Đối tượng chứa state và functions quản lý thông báo
 */
export function useNotification() {
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info', 
  });

  const showNotification = (message, severity = 'info') => {
    setNotification({
      open: true,
      message,
      severity,
    });
  };

  const hideNotification = () => {
    setNotification((prev) => ({
      ...prev,
      open: false,
    }));
  };

  const notificationProps = {
    open: notification.open,
    onClose: hideNotification,
    message: notification.message,
    severity: notification.severity,
  };

  return {
    notification: notificationProps,
    showSuccess: (message) => showNotification(message, 'success'),
    showError: (message) => showNotification(message, 'error'),
    showInfo: (message) => showNotification(message, 'info'),
    showWarning: (message) => showNotification(message, 'warning'),
    hideNotification,
  };
}