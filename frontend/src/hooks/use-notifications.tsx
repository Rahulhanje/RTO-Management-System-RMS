import { useState, useEffect } from 'react';
import { notificationService } from '@/services';
import { Notification } from '@/types';

export const useNotifications = (autoRefresh: boolean = false) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const response = await notificationService.getMyNotifications();
      if (response.success && response.data) {
        const notificationsData = (response.data as any).notifications || response.data || [];
        if (Array.isArray(notificationsData)) {
          setNotifications(notificationsData);
          setUnreadCount(notificationsData.filter(n => !n.is_read).length);
        } else {
          setNotifications([]);
          setUnreadCount(0);
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Auto-refresh every 30 seconds if enabled
    if (autoRefresh) {
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  return {
    notifications,
    unreadCount,
    isLoading,
    refetch: fetchNotifications,
  };
};
