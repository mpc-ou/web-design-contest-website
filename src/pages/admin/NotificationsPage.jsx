import { useEffect, useState } from 'react';
import { Plus, Download, Eye, Edit, Trash2, Bell, Send, Pin, PinOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/admin/ui/PageHeader';
import DataTable from '../../components/admin/ui/DataTable';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { apiService } from '../../services/api';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTarget, setFilterTarget] = useState('all');

  const columns = [
    {
      key: 'title',
      title: 'Tiêu đề',
      className: 'font-medium min-w-[200px]',
    },
    {
      key: 'message',
      title: 'Nội dung',
      type: 'custom',
      render: (value, item) => {
        if (!item.message) return '-';
        const truncated = item.message.length > 150 
          ? item.message.substring(0, 150) + '...'
          : item.message;
        return (
          <div className="max-w-sm">
            <p className="text-sm" title={item.message}>
              {truncated}
            </p>
          </div>
        );
      },
    },
    {
      key: 'target',
      title: 'Đối tượng',
      type: 'badge',
      badgeVariant: (value) => {
        switch (value) {
          case 'all':
            return 'default';
          case 'students':
            return 'secondary';
          case 'teams':
            return 'outline';
          case 'contest':
            return 'destructive';
          default:
            return 'outline';
        }
      },
      badgeText: (value) => {
        switch (value) {
          case 'all':
            return 'Tất cả';
          case 'students':
            return 'Sinh viên';
          case 'teams':
            return 'Đội thi';
          case 'contest':
            return 'Cuộc thi';
          default:
            return value;
        }
      },
    },
    {
      key: 'targetInfo',
      title: 'Chi tiết đối tượng',
      type: 'custom',
      render: (value, item) => {
        if (!item.targetId) return '-';
        return (
          <div className="text-sm text-muted-foreground">
            ID: {item.targetId}
          </div>
        );
      },
    },
    {
      key: 'priority',
      title: 'Ưu tiên',
      type: 'badge',
      badgeVariant: (value) => {
        switch (value) {
          case 'high':
            return 'destructive';
          case 'medium':
            return 'default';
          case 'low':
            return 'secondary';
          default:
            return 'outline';
        }
      },
      badgeText: (value) => {
        switch (value) {
          case 'high':
            return 'Cao';
          case 'medium':
            return 'Trung bình';
          case 'low':
            return 'Thấp';
          default:
            return value || 'Thấp';
        }
      },
    },
    {
      key: 'isPinned',
      title: 'Ghim',
      type: 'custom',
      render: (value, item) => {
        return item.isPinned ? (
          <Pin className="h-4 w-4 text-yellow-500" />
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
    {
      key: 'readCount',
      title: 'Đã đọc',
      type: 'custom',
      render: (value, item) => (
        <div className="flex items-center space-x-1">
          <Eye className="h-4 w-4 text-muted-foreground" />
          <span>{item.readCount || 0}</span>
        </div>
      ),
    },
    {
      key: 'createdAt',
      title: 'Ngày tạo',
      type: 'datetime',
    },
    {
      key: 'isActive',
      title: 'Trạng thái',
      type: 'badge',
      badgeVariant: (value) => value ? 'default' : 'secondary',
      badgeText: (value) => value ? 'Hoạt động' : 'Đã ẩn',
    },
  ];

  const rowActions = [
    {
      key: 'view',
      label: 'Xem chi tiết',
      icon: Eye,
      handler: (notification) => {
        navigate(`/admin/notifications/${notification._id}`);
      },
    },
    {
      key: 'edit',
      label: 'Chỉnh sửa',
      icon: Edit,
      handler: (notification) => {
        navigate(`/admin/notifications/${notification._id}/edit`);
      },
    },
    {
      key: 'send',
      label: 'Gửi ngay',
      icon: Send,
      handler: async (notification) => {
        if (window.confirm('Bạn có chắc chắn muốn gửi thông báo này ngay?')) {
          try {
            await apiService.post(`/admin/notifications/${notification._id}/send`);
            toast.success('Gửi thông báo thành công');
            fetchNotifications();
          } catch (error) {
            toast.error('Có lỗi xảy ra: ' + (error.response?.data?.error || error.message));
          }
        }
      },
      condition: (notification) => notification.isActive,
    },
    {
      key: 'toggle-pin',
      label: (notification) => notification.isPinned ? 'Bỏ ghim' : 'Ghim',
      icon: (notification) => notification.isPinned ? PinOff : Pin,
      handler: async (notification) => {
        try {
          await apiService.put(`/admin/notifications/${notification._id}`, {
            ...notification,
            isPinned: !notification.isPinned
          });
          toast.success(`${notification.isPinned ? 'Bỏ ghim' : 'Ghim'} thông báo thành công`);
          fetchNotifications();
        } catch (error) {
          toast.error('Có lỗi xảy ra');
        }
      },
    },
    {
      key: 'toggle-status',
      label: (notification) => notification.isActive ? 'Ẩn' : 'Hiển thị',
      icon: Eye,
      handler: async (notification) => {
        try {
          await apiService.put(`/admin/notifications/${notification._id}`, {
            ...notification,
            isActive: !notification.isActive
          });
          toast.success(`${notification.isActive ? 'Ẩn' : 'Hiển thị'} thông báo thành công`);
          fetchNotifications();
        } catch (error) {
          toast.error('Có lỗi xảy ra');
        }
      },
    },
    {
      key: 'delete',
      label: 'Xóa',
      icon: Trash2,
      destructive: true,
      handler: async (notification) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa thông báo này?')) {
          try {
            await apiService.delete(`/admin/notifications/${notification._id}`);
            toast.success('Xóa thông báo thành công');
            fetchNotifications();
          } catch (error) {
            toast.error('Có lỗi xảy ra');
          }
        }
      },
    },
  ];

  const fetchNotifications = async (page = 1, search = '', target = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });
      
      if (search) params.append('search', search);
      if (target) params.append('target', target);

      const response = await apiService.get(`/admin/notifications?${params}`);
      setNotifications(response.data.data || []);
      setPagination(response.data.pagination || null);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      
      // Set empty data for development
      setNotifications([]);
      setPagination(null);
      
      if (error.response?.status === 404) {
        toast.error('API endpoint chưa được implement');
      } else {
        toast.error('Có lỗi khi tải danh sách thông báo');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (filterTarget) params.append('target', filterTarget);

      const response = await apiService.get(`/admin/reports/notifications?${params}`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `notifications_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Xuất file thành công');
    } catch (error) {
      console.error('Error exporting notifications:', error);
      toast.error('Có lỗi khi xuất file');
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleSearch = (search) => {
    setSearchTerm(search);
    fetchNotifications(1, search, filterTarget);
  };

  const handleFilter = (target) => {
    setFilterTarget(target);
    fetchNotifications(1, searchTerm, target);
  };

  const handlePageChange = (page) => {
    fetchNotifications(page, searchTerm, filterTarget);
  };

  const pageActions = [
    {
      label: 'Tạo thông báo',
      variant: 'default',
      icon: Plus,
      onClick: () => navigate('/admin/notifications/create'),
    },
  ];

  const filterOptions = {
    options: [
      { value: 'all', label: 'Tất cả' },
      { value: 'students', label: 'Sinh viên' },
      { value: 'teams', label: 'Đội thi' },
      { value: 'contest', label: 'Cuộc thi' },
    ],
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý thông báo"
        description="Tạo và quản lý thông báo gửi đến người dùng"
        actions={pageActions}
        badge={{
          text: `${notifications.length} thông báo`,
          variant: 'outline',
        }}
      />

      <DataTable
        data={notifications}
        columns={columns}
        searchable={true}
        filterable={filterOptions}
        exportable={true}
        onRowAction={rowActions}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        onFilter={handleFilter}
        onExport={handleExport}
      />
    </div>
  );
};

export default NotificationsPage;