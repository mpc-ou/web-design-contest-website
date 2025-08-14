import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { BellIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { apiService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

const NotificationPopup = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isOpen && currentUser) {
      fetchNotifications();
    }
  }, [isOpen, currentUser]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      // No filter; just get the latest notifications
      const response = await apiService.getNotifications({
        limit: 20,
        sortBy: 'createdAt',
        order: 'desc',
      });
      const notifs = response.data?.data || [];
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Không thể tải thông báo');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await apiService.markNotificationAsRead(notificationId);
      setNotifications(prev => prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Không thể đánh dấu đã đọc');
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiService.markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('Đã đánh dấu tất cả là đã đọc');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Không thể đánh dấu tất cả');
    }
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read first (if needed)
    if (!notification.isRead) {
      try {
        await apiService.markNotificationAsRead(notification._id);
        setNotifications(prev => prev.map(n => n._id === notification._id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        // Don’t block navigation if marking read fails
        console.error('Error marking notification as read:', error);
      }
    }
    // Close popup and navigate if url is available
    onClose?.();
    if (notification.url) {
      navigate(notification.url);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScopeBadge = (notif) => {
    switch (notif.scope) {
      case 'all':
        return <Badge variant="outline" className="text-xs">Tất cả</Badge>;
      case 'contest':
        return <Badge variant="secondary" className="text-xs">Cuộc thi {notif.contestCode}</Badge>;
      case 'role':
        return <Badge variant="outline" className="text-xs">Vai trò: {notif.role}</Badge>;
      case 'user':
        return <Badge variant="outline" className="text-xs">Cá nhân</Badge>;
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed right-4 top-16 w-96 max-h-[80vh] bg-background border rounded-lg shadow-lg">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <BellIcon className="h-5 w-5" />
            <h3 className="font-semibold">Thông báo</h3>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={markAllAsRead} disabled={unreadCount === 0}>
              <CheckIcon className="h-4 w-4 mr-1" />
              Đánh dấu tất cả
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <XMarkIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : notifications.length > 0 ? (
            <div className="p-2">
              {notifications.map((notification) => (
                <Card 
                  key={notification._id} 
                  className={`
                    mb-2 cursor-pointer transition-all hover:shadow-md gap-2 py-4
                    ${!notification.isRead 
                      ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-700' 
                      : 'bg-background hover:bg-muted/50'
                    }
                  `}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <CardHeader className="pb-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-sm font-medium line-clamp-2">
                          {notification.title}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          {getScopeBadge(notification)}
                          {notification.isPinned && (
                            <Badge variant="secondary" className="text-xs">
                              Đã ghim
                            </Badge>
                          )}
                        </div>
                      </div>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 flex-shrink-0"></div>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <CardDescription className="text-sm line-clamp-3">
                      {notification.content}
                    </CardDescription>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        {formatDate(notification.createdAt)}
                      </span>
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification._id);
                          }}
                        >
                          <CheckIcon className="h-3 w-3 mr-1" />
                          Đánh dấu đã đọc
                        </Button>
                      )}
                    </div>
                    
                    {notification.url && (
                      <div className="mt-2 flex items-center text-xs text-blue-600 dark:text-blue-400">
                        <span>Nhấp để xem chi tiết →</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <BellIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Không có thông báo nào</p>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

export default NotificationPopup;