import { useEffect, useState } from 'react';
import { Plus, Download, Eye, Edit, Trash2, Play, Pause, Award, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/admin/ui/PageHeader';
import DataTable from '../../components/admin/ui/DataTable';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { apiService } from '../../services/api';

const AdminMinigamesPage = () => {
  const navigate = useNavigate();
  const [minigames, setMinigames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const columns = [
    {
      key: 'title',
      title: 'Tên minigame',
      className: 'font-medium min-w-[200px]',
    },
    {
      key: 'description',
      title: 'Mô tả',
      type: 'custom',
      render: (value) => (
        <div className="max-w-xs truncate" title={value}>
          {value || '-'}
        </div>
      ),
    },
    {
      key: 'type',
      title: 'Loại',
      type: 'badge',
      badgeVariant: () => 'outline',
    },
    {
      key: 'maxParticipants',
      title: 'Số người tối đa',
      type: 'custom',
      render: (value) => (
        <span className="font-medium">{value || 'Không giới hạn'}</span>
      ),
    },
    {
      key: 'currentParticipants',
      title: 'Đã tham gia',
      type: 'custom',
      render: (value, item) => (
        <div className="flex items-center space-x-2">
          <span className="font-medium">{value || 0}</span>
          {item.maxParticipants && (
            <span className="text-xs text-muted-foreground">
              / {item.maxParticipants}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'startDate',
      title: 'Ngày bắt đầu',
      type: 'datetime',
    },
    {
      key: 'endDate',
      title: 'Ngày kết thúc',
      type: 'datetime',
    },
    {
      key: 'status',
      title: 'Trạng thái',
      type: 'badge',
      badgeVariant: (value) => {
        switch (value) {
          case 'upcoming':
            return 'secondary';
          case 'active':
            return 'default';
          case 'ended':
            return 'outline';
          case 'closed':
            return 'destructive';
          default:
            return 'secondary';
        }
      },
      badgeText: (value) => {
        switch (value) {
          case 'upcoming':
            return 'Sắp diễn ra';
          case 'active':
            return 'Đang diễn ra';
          case 'ended':
            return 'Đã kết thúc';
          case 'closed':
            return 'Đã đóng';
          default:
            return value;
        }
      },
    },
  ];

  const rowActions = [
    {
      key: 'view',
      label: 'Xem chi tiết',
      icon: Eye,
      handler: (minigame) => {
        navigate(`/admin/minigames/${minigame._id}`);
      },
    },
    {
      key: 'edit',
      label: 'Chỉnh sửa',
      icon: Edit,
      handler: (minigame) => {
        navigate(`/admin/minigames/${minigame._id}/edit`);
      },
    },
    {
      key: 'winners',
      label: 'Xem người thắng',
      icon: Award,
      handler: async (minigame) => {
        try {
          const response = await apiService.getAdminLuckyWinners(minigame._id);
          if (response.data.length > 0) {
            navigate(`/admin/minigames/${minigame._id}/winners`);
          } else {
            toast.info('Chưa có người thắng');
          }
        } catch (error) {
          toast.error('Có lỗi khi kiểm tra người thắng');
        }
      },
    },
    {
      key: 'draw',
      label: 'Quay số',
      icon: RotateCcw,
      handler: async (minigame) => {
        if (window.confirm('Bạn có chắc chắn muốn quay số cho minigame này?')) {
          try {
            await apiService.drawAdminLucky(minigame._id, true);
            toast.success('Quay số thành công');
            fetchMinigames();
          } catch (error) {
            toast.error('Có lỗi khi quay số');
          }
        }
      },
      condition: (minigame) => minigame.status === 'ended',
    },
    {
      key: 'close',
      label: 'Đóng sớm',
      icon: Pause,
      destructive: true,
      handler: async (minigame) => {
        if (window.confirm('Bạn có chắc chắn muốn đóng minigame này sớm?')) {
          try {
            await apiService.closeAdminMinigame(minigame._id);
            toast.success('Đóng minigame thành công');
            fetchMinigames();
          } catch (error) {
            toast.error('Có lỗi xảy ra');
          }
        }
      },
      condition: (minigame) => minigame.status === 'active',
    },
    {
      key: 'delete',
      label: 'Xóa',
      icon: Trash2,
      destructive: true,
      handler: async (minigame) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa minigame này?')) {
          try {
            await apiService.deleteAdminMinigame(minigame._id);
            toast.success('Xóa minigame thành công');
            fetchMinigames();
          } catch (error) {
            toast.error('Có lỗi xảy ra');
          }
        }
      },
    },
  ];

  const fetchMinigames = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const params = {
        page: page.toString(),
        limit: '20',
      };
      
      if (search) params.search = search;

      const response = await apiService.getAdminMinigames(params);
      setMinigames(response.data.data || []);
      setPagination(response.data.pagination || null);
    } catch (error) {
      console.error('Error fetching minigames:', error);
      
      setMinigames([]);
      setPagination(null);
      
      if (error.response?.status === 404) {
        toast.error('API endpoint chưa được implement');
      } else {
        toast.error('Có lỗi khi tải danh sách minigames');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMinigames();
  }, []);

  const handleSearch = (search) => {
    setSearchTerm(search);
    fetchMinigames(1, search);
  };

  const handlePageChange = (page) => {
    fetchMinigames(page, searchTerm);
  };

  const pageActions = [
    {
      label: 'Tạo minigame',
      variant: 'default',
      icon: Plus,
      onClick: () => navigate('/admin/minigames/create'),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý minigames"
        description="Quản lý các trò chơi nhỏ và hoạt động tương tác"
        actions={pageActions}
      />

      <DataTable
        data={minigames}
        columns={columns}
        searchable={true}
        onRowAction={rowActions}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
      />
    </div>
  );
};

export default AdminMinigamesPage;