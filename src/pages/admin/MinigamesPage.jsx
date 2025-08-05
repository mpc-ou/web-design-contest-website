import { useEffect, useState } from 'react';
import { Plus, Download, Eye, Edit, Trash2, Play, Pause, Trophy, Ticket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/admin/ui/PageHeader';
import DataTable from '../../components/admin/ui/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { apiService } from '../../services/api';

const MinigamesPage = () => {
  const navigate = useNavigate();
  const [minigames, setMinigames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const columns = [
    {
      key: 'thumbnail',
      title: 'Ảnh',
      type: 'custom',
      render: (value, item) => {
        return item.thumbnail ? (
          <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden">
            <img 
              src={item.thumbnail} 
              alt={item.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="w-full h-full items-center justify-center hidden">
              <Trophy className="h-6 w-6 text-muted-foreground" />
            </div>
          </div>
        ) : (
          <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
            <Trophy className="h-6 w-6 text-muted-foreground" />
          </div>
        );
      },
    },
    {
      key: 'name',
      title: 'Tên minigame',
      className: 'font-medium min-w-[200px]',
    },
    {
      key: 'description',
      title: 'Mô tả',
      type: 'custom',
      render: (value, item) => {
        if (!item.description) return '-';
        const truncated = item.description.length > 100 
          ? item.description.substring(0, 100) + '...'
          : item.description;
        return (
          <div className="max-w-xs">
            <p className="text-sm" title={item.description}>
              {truncated}
            </p>
          </div>
        );
      },
    },
    {
      key: 'contestInfo',
      title: 'Cuộc thi',
      type: 'custom',
      render: (value, item) => {
        if (!item.contest) return '-';
        return (
          <div className="space-y-1">
            <div className="font-medium">{item.contest.name}</div>
            <div className="text-xs text-muted-foreground">{item.contest.code}</div>
          </div>
        );
      },
    },
    {
      key: 'maxNumber',
      title: 'Số tối đa',
      type: 'custom',
      render: (value, item) => (
        <Badge variant="outline">
          {item.maxNumber || 'N/A'}
        </Badge>
      ),
    },
    {
      key: 'ticketCount',
      title: 'Số vé',
      type: 'custom',
      render: (value, item) => (
        <div className="flex items-center space-x-1">
          <Ticket className="h-4 w-4 text-muted-foreground" />
          <span>{item.ticketCount || 0}</span>
        </div>
      ),
    },
    {
      key: 'winnerCount',
      title: 'Người thắng',
      type: 'custom',
      render: (value, item) => {
        const winnerCount = item.winnerCount || 0;
        return (
          <div className="flex items-center space-x-1">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <span className="font-medium">{winnerCount}</span>
          </div>
        );
      },
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
      type: 'custom',
      render: (value, item) => {
        const now = new Date();
        const startDate = new Date(item.startDate);
        const endDate = new Date(item.endDate);
        
        let status = 'upcoming';
        let text = 'Sắp diễn ra';
        let variant = 'secondary';
        
        if (now >= startDate && now <= endDate && item.isActive) {
          status = 'active';
          text = 'Đang diễn ra';
          variant = 'default';
        } else if (now > endDate || !item.isActive) {
          status = 'ended';
          text = 'Đã kết thúc';
          variant = 'outline';
        }
        
        return (
          <Badge variant={variant}>
            {text}
          </Badge>
        );
      },
    },
    {
      key: 'isActive',
      title: 'Kích hoạt',
      type: 'badge',
      badgeVariant: (value) => value ? 'default' : 'secondary',
      badgeText: (value) => value ? 'Có' : 'Không',
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
      key: 'view-tickets',
      label: 'Xem vé số',
      icon: Ticket,
      handler: (minigame) => {
        navigate(`/admin/lucky?minigameId=${minigame._id}`);
      },
    },
    {
      key: 'view-winners',
      label: 'Xem người thắng',
      icon: Trophy,
      handler: (minigame) => {
        navigate(`/admin/lucky/winners/${minigame._id}`);
      },
    },
    {
      key: 'draw-winner',
      label: 'Quay số',
      icon: Trophy,
      handler: async (minigame) => {
        if (window.confirm('Bạn có chắc chắn muốn quay số cho minigame này?')) {
          try {
            const response = await apiService.post(`/admin/lucky/draw/${minigame._id}?confirm=true`);
            toast.success('Quay số thành công!');
            console.log('Winners:', response.data);
            fetchMinigames();
          } catch (error) {
            toast.error('Có lỗi xảy ra: ' + (error.response?.data?.error || error.message));
          }
        }
      },
      condition: (minigame) => {
        const now = new Date();
        const endDate = new Date(minigame.endDate);
        return now > endDate && minigame.isActive;
      },
    },
    {
      key: 'close-early',
      label: 'Đóng sớm',
      icon: Pause,
      destructive: true,
      handler: async (minigame) => {
        if (window.confirm('Bạn có chắc chắn muốn đóng minigame này sớm?')) {
          try {
            await apiService.patch(`/admin/minigames/close/${minigame._id}`);
            toast.success('Đóng minigame thành công');
            fetchMinigames();
          } catch (error) {
            toast.error('Có lỗi xảy ra');
          }
        }
      },
      condition: (minigame) => {
        const now = new Date();
        const startDate = new Date(minigame.startDate);
        const endDate = new Date(minigame.endDate);
        return now >= startDate && now <= endDate && minigame.isActive;
      },
    },
    {
      key: 'delete',
      label: 'Xóa',
      icon: Trash2,
      destructive: true,
      handler: async (minigame) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa minigame này?')) {
          try {
            await apiService.delete(`/admin/minigames/${minigame._id}`);
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
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });
      
      if (search) params.append('search', search);

      const response = await apiService.get(`/admin/minigames?${params}`);
      setMinigames(response.data.data || []);
      setPagination(response.data.pagination || null);
    } catch (error) {
      console.error('Error fetching minigames:', error);
      
      // Set empty data for development
      setMinigames([]);
      setPagination(null);
      
      if (error.response?.status === 404) {
        toast.error('API endpoint chưa được implement');
      } else {
        toast.error('Có lỗi khi tải danh sách minigame');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await apiService.get('/admin/reports/minigames', {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `minigames_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Xuất file thành công');
    } catch (error) {
      console.error('Error exporting minigames:', error);
      toast.error('Có lỗi khi xuất file');
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
        title="Quản lý Minigames"
        description="Quản lý các minigame và hoạt động quay số may mắn"
        actions={pageActions}
        badge={{
          text: `${minigames.length} minigames`,
          variant: 'outline',
        }}
      />

      <DataTable
        data={minigames}
        columns={columns}
        searchable={true}
        exportable={true}
        onRowAction={rowActions}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        onExport={handleExport}
      />
    </div>
  );
};

export default MinigamesPage;