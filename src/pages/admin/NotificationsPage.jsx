import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Bell, Check, Pin } from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '../services/api';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page: page.toString(),
        limit: '20',
        sortBy: 'createdAt',
        order: 'desc',
      };

      const response = await apiService.get('/api/notifications', { params });
      setNotifications(response.data.data || []);
      setPagination(response.data.pagination || null);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Có lỗi khi tải danh sách thông báo');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await apiService.post(`/api/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId 
            ? { ...notif, isRead: true }
            : notif
        )
      );
      toast.success('Đã đánh dấu đã đọc');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Có lỗi khi đánh dấu đã đọc');
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiService.post('/api/notifications/read-all');
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      toast.success('Đã đánh dấu tất cả là đã đọc');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Có lỗi khi đánh dấu tất cả');
    }
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read if not already read
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }
    
    // Navigate to the URL if provided
    if (notification.url) {
      navigate(notification.url);
    }
  };

  const getScopeText = (scope) => {
    switch (scope) {
      case 'all':
        return 'Tất cả';
      case 'user':
        return 'Cá nhân';
      case 'contest':
        return 'Cuộc thi';
      case 'role':
        return 'Vai trò';
      default:
        return scope;
    }
  };

  const getScopeVariant = (scope) => {
    switch (scope) {
      case 'all':
        return 'default';
      case 'user':
        return 'secondary';
      case 'contest':
        return 'destructive';
      case 'role':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center space-x-2">
                <Bell className="h-6 w-6" />
                <span>Thông báo</span>
                {unreadCount > 0 && (
                  <Badge variant="destructive">{unreadCount}</Badge>
                )}
              </h1>
              <p className="text-muted-foreground">Xem các thông báo và cập nhật mới nhất</p>
            </div>
          </div>
          
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline" size="sm">
              <Check className="h-4 w-4 mr-2" />
              Đánh dấu tất cả đã đọc
            </Button>
          )}
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground mb-4">Không có thông báo nào</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card 
                key={notification._id}
                className={`
                  cursor-pointer transition-all hover:shadow-md
                  ${!notification.isRead 
                    ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-700' 
                    : 'bg-background hover:bg-muted/50'
                  }
                `}
                onClick={() => handleNotificationClick(notification)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="flex items-center space-x-2">
                        <span className="line-clamp-2">{notification.title}</span>
                        {notification.isPinned && (
                          <Pin className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                        )}
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                        )}
                      </CardTitle>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant={getScopeVariant(notification.scope)}>
                          {getScopeText(notification.scope)}
                        </Badge>
                        {notification.contestCode && (
                          <Badge variant="secondary">
                            {notification.contestCode}
                          </Badge>
                        )}
                        <span className="text-sm text-muted-foreground">
                          {formatDate(notification.createdAt)}
                        </span>
                      </div>
                    </div>
                    
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification._id);
                        }}
                        className="flex-shrink-0"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Đánh dấu đã đọc
                      </Button>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {notification.content}
                  </p>
                  
                  {notification.payload && (
                    <div className="mt-3 p-3 bg-muted rounded-lg">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Thông tin thêm:</p>
                      <div className="text-sm space-y-1">
                        {notification.payload.name && (
                          <p><span className="font-medium">Tên:</span> {notification.payload.name}</p>
                        )}
                        {notification.payload.code && (
                          <p><span className="font-medium">Mã:</span> {notification.payload.code}</p>
                        )}
                        {notification.payload.ip && (
                          <p><span className="font-medium">IP:</span> {notification.payload.ip}</p>
                        )}
                        {notification.payload.oldRole && notification.payload.newRole && (
                          <p><span className="font-medium">Thay đổi quyền:</span> {notification.payload.oldRole} → {notification.payload.newRole}</p>
                        )}
                        {notification.payload.status && (
                          <p><span className="font-medium">Trạng thái:</span> {notification.payload.status}</p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {notification.url && (
                    <div className="mt-3 flex items-center text-sm text-blue-600 dark:text-blue-400">
                      <span>Nhấp để xem chi tiết →</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pageCount > 1 && (
          <div className="flex justify-center space-x-2">
            <Button
              variant="outline"
              disabled={!pagination.hasPrev}
              onClick={() => fetchNotifications(pagination.prevPage)}
            >
              Trang trước
            </Button>
            <span className="flex items-center px-3 text-sm text-muted-foreground">
              Trang {pagination.currentPage} / {pagination.pageCount}
            </span>
            <Button
              variant="outline"
              disabled={!pagination.hasNext}
              onClick={() => fetchNotifications(pagination.nextPage)}
            >
              Trang sau
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;