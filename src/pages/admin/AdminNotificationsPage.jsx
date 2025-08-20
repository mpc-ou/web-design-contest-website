import { useEffect, useState } from 'react';
import { Plus, Download, Eye, Edit, Trash2, Pin, PinOff, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/admin/ui/PageHeader';
import DataTable from '../../components/admin/ui/DataTable';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { apiService } from '../../services/api';

const AdminNotificationsPage = () => {
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
      key: 'content',
      title: 'Nội dung',
      type: 'custom',
      render: (value) => (
        <div className="max-w-xs truncate" title={value}>
          {value || '-'}
        </div>
      ),
    },
    {
      key: 'target',
      title: 'Đối tượng',
      type: 'badge',
      badgeVariant: (value) => {
        switch (value) {
          case 'all':
            return 'default';
          case 'users':
            return 'secondary';
          case 'teams':
            return 'outline';
          case 'contest':
            return 'destructive';
          default:
            return 'secondary';
        }
      },
      badgeText: (value) => {
        switch (value) {
          case 'all':
            return 'Tất cả';
          case 'users':
            return 'Người dùng';
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
            return value;
        }
      },
    },
    {
      key: 'isPinned',
      title: 'Ghim',
      type: 'badge',
      badgeVariant: (value) => value ? 'default' : 'outline',
      badgeText: (value) => value ? 'Đã ghim' : 'Chưa ghim',
    },
    {
      key: 'isActive',
      title: 'Trạng thái',
      type: 'badge',
      badgeVariant: (value) => value ? 'default' : 'secondary',
      badgeText: (value) => value ? 'Hoạt động' : 'Không hoạt động',
    },
    {
      key: 'createdAt',
      title: 'Ngày tạo',
      type: 'date',
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
      key: 'toggle-pin',
      label: (notification) => notification.isPinned ? 'Bỏ ghim' : 'Ghim',
      icon: (notification) => notification.isPinned ? PinOff : Pin,
      handler: async (notification) => {
        try {
          await apiService.updateAdminNotification(notification._id, {
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
      key: 'send',
      label: 'Gửi thông báo',
      icon: Send,
      handler: async (notification) => {
        if (window.confirm('Bạn có chắc chắn muốn gửi thông báo này?')) {
          try {
            // Note: API docs không có endpoint này, có thể cần implement
            await apiService.post(`/api/admin/notifications/${notification._id}/send`);
            toast.success('Gửi thông báo thành công');
            fetchNotifications();
          } catch (error) {
            toast.error('Có lỗi khi gửi thông báo');
          }
        }
      },
      condition: (notification) => notification.isActive,
    },
    {
      key: 'delete',
      label: 'Xóa',
      icon: Trash2,
      destructive: true,
      handler: async (notification) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa thông báo này?')) {
          try {
            await apiService.deleteAdminNotification(notification._id);
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
      const params = {
        page: page.toString(),
        limit: '20',
      };
      
      if (search) params.search = search;
      if (target) params.target = target;

      const response = await apiService.getAdminNotifications(params);
      setNotifications(response.data.data || []);
      setPagination(response.data.pagination || null);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      
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
      { value: 'users', label: 'Người dùng' },
      { value: 'teams', label: 'Đội thi' },
      { value: 'contest', label: 'Cuộc thi' },
    ],
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý thông báo"
        description="Tạo và quản lý các thông báo gửi đến người dùng"
        actions={pageActions}
      />

      <DataTable
        data={notifications}
        columns={columns}
        searchable={true}
        filterable={filterOptions}
        onRowAction={rowActions}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        onFilter={handleFilter}
      />
    </div>
  );
};

export default AdminNotificationsPage;