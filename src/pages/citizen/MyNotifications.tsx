import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { notificationService } from '@/services';
import { Notification } from '@/types';
import { Bell, CheckCircle2, Loader2, Trash2 } from 'lucide-react';

const MyNotifications: React.FC = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await notificationService.getMyNotifications();
      if (response.success) setNotifications(response.data || []);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load notifications', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error('Failed to mark as read');
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={() => notifications.filter(n => !n.read).forEach(n => handleMarkAsRead(n.id))}>
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
          {notifications.map((notification, index) => (
            <motion.div key={notification.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
              <Card className={`glass-card-hover cursor-pointer transition-all ${!notification.read ? 'border-primary/30 bg-primary/5' : ''}`} onClick={() => !notification.read && handleMarkAsRead(notification.id)}>
                <CardContent className="py-4">
                  <div className="flex items-start gap-4">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${!notification.read ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      <Bell className="h-5 w-5" />
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
          ))}
        </div>
      )}
    </div>
  );
};

export default MyNotifications;
