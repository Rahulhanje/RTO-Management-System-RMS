import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { notificationService } from '@/services';
import { Notification } from '@/types';
import { Bell, CheckCircle2, Loader2, Trash2, Info, AlertTriangle, Calendar, CreditCard } from 'lucide-react';

// Mock data for demo mode
const mockNotifications: Notification[] = [
  { id: '1', user_id: 'user1', type: 'GENERAL', message: 'Your vehicle registration (MH12AB1234) has been approved. RC will be dispatched soon.', read: false, created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
  { id: '2', user_id: 'user1', type: 'CHALLAN', message: 'New challan issued for over speeding. Amount: ₹1,000. Pay within 15 days to avoid penalty.', read: false, created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
  { id: '3', user_id: 'user1', type: 'APPOINTMENT', message: 'Reminder: Your driving test is scheduled for tomorrow at 10:00 AM at Pune RTO.', read: false, created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString() },
  { id: '4', user_id: 'user1', type: 'PAYMENT', message: 'Payment of ₹500 received for challan #CH123456. Thank you!', read: true, created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '5', user_id: 'user1', type: 'GENERAL', message: 'Your driving license application has been submitted successfully. Application ID: DL2024001234', read: true, created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() },
];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'CHALLAN': return AlertTriangle;
    case 'APPOINTMENT': return Calendar;
    case 'PAYMENT': return CreditCard;
    default: return Bell;
  }
};

const MyNotifications: React.FC = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await notificationService.getMyNotifications().catch(() => ({ success: false, data: [] }));
      const data = response.success && Array.isArray(response.data) ? response.data : [];
      
      if (data.length === 0) {
        setNotifications(mockNotifications);
        setIsDemoMode(true);
      } else {
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications(mockNotifications);
      setIsDemoMode(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    if (isDemoMode) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      return;
    }
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = () => {
    if (isDemoMode) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast({ title: 'Demo Mode', description: 'All notifications marked as read' });
      return;
    }
    notifications.filter(n => !n.read).forEach(n => handleMarkAsRead(n.id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 fade-in-up">
      {isDemoMode && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
          <Info className="h-4 w-4 text-primary" />
          <span className="text-sm text-primary">Demo Mode: Displaying sample notifications</span>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={handleMarkAllAsRead}>
            <CheckCircle2 className="h-4 w-4 mr-2" />Mark All Read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="py-16 text-center">
            <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Notifications</h3>
            <p className="text-muted-foreground">You're all caught up!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification, index) => {
            const IconComponent = getNotificationIcon(notification.type);
            return (
              <motion.div key={notification.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                <Card className={`glass-card-hover cursor-pointer transition-all ${!notification.read ? 'border-primary/30 bg-primary/5' : ''}`} onClick={() => !notification.read && handleMarkAsRead(notification.id)}>
                  <CardContent className="py-4">
                    <div className="flex items-start gap-4">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${!notification.read ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className={`${!notification.read ? 'font-medium' : 'text-muted-foreground'}`}>{notification.message}</p>
                        <p className="text-sm text-muted-foreground mt-1">{new Date(notification.created_at).toLocaleString()}</p>
                      </div>
                      {!notification.read && <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyNotifications;
