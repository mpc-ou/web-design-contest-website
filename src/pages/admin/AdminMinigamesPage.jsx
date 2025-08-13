import { useEffect, useState } from 'react';
import { Plus, Download, Eye, Edit, Trash2, Play, Pause, Award, RotateCcw, Trophy, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/admin/ui/PageHeader';
import DataTable from '../../components/admin/ui/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { apiService } from '../../services/api';
import { formatDate, formatDateTime } from '../../utils/format';

const AdminMinigamesPage = () => {
  const navigate = useNavigate();
  const [minigames, setMinigames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    ended: 0,
    upcoming: 0
  });

  // Định nghĩa cột dữ liệu
  const columns = [
    {
      key: 'thumbnail',
      title: '',
      width: '80px',
      type: 'custom',
      render: (_, item) => (
        <div className="relative w-16 h-16 bg-muted rounded-lg overflow-hidden group">
          {item.thumbnail ? (
            <img 
              src={item.thumbnail} 
              alt={item.name}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div className="w-full h-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/40 flex" 
               style={{ display: item.thumbnail ? 'none' : 'flex' }}>
            <Trophy className="h-6 w-6 text-primary" />
          </div>
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
        </div>
      ),
    },
    {
      key: 'info',
      title: 'Thông tin minigame',
      className: 'min-w-[250px]',
      type: 'custom',
      render: (_, item) => (
        <div className="space-y-1">
          <div className="font-semibold text-base">{item.name}</div>
          <div className="text-sm text-muted-foreground line-clamp-2" title={item.description}>
            {item.description || 'Không có mô tả'}
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Badge variant="outline" className="h-5">
              {item.contest || 'Chưa liên kết cuộc thi'}
            </Badge>
          </div>
        </div>
      ),
    },
    {
      key: 'participants',
      title: 'Tham gia',
      width: '120px',
      type: 'custom',
      render: (_, item) => {
        const takenCount = item.takenCount || 0;
        const progress = item.maxNumber ? (takenCount / item.maxNumber) * 100 : 0;
        return (
          <div className="text-center space-y-1">
            <div className="font-semibold text-lg">{takenCount}</div>
            <div className="text-xs text-muted-foreground">
              {item.maxNumber ? `/ ${item.maxNumber}` : '/ ∞'}
            </div>
            {item.maxNumber && (
              <div className="w-full bg-muted rounded-full h-1.5">
                <div 
                  className="bg-primary rounded-full h-1.5 transition-all duration-300"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'timeInfo',
      title: 'Thời gian',
      width: '180px',
      type: 'custom',
      render: (_, item) => (
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-green-600" />
            <span className="text-muted-foreground">Bắt đầu:</span>
            <span className="font-medium">{formatDateTime(item.startTime)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-red-600" />
            <span className="text-muted-foreground">Kết thúc:</span>
            <span className="font-medium">{formatDateTime(item.endTime)}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'prizes',
      title: 'Giải thưởng',
      width: '120px',
      type: 'custom',
      render: (_, item) => (
        <div className="text-center space-y-1">
          <div className="font-semibold">{item.prizes?.length || 0}</div>
          <div className="text-xs text-muted-foreground">
            Max: {item.maxWinners || 1}
          </div>
          {item.winTickets?.length > 0 && (
            <Badge variant="default" className="text-xs">
              {item.winTickets.length} đã thắng
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      title: 'Trạng thái',
      width: '120px',
      type: 'custom',
      render: (_, item) => {
        const status = getMinigameStatus(item);
        return (
          <div className="space-y-1">
            <Badge variant={getStatusVariant(status.key)} className="w-full justify-center">
              {status.label}
            </Badge>
            {!item.isActive && (
              <Badge variant="secondary" className="w-full justify-center text-xs">
                Vô hiệu hóa
              </Badge>
            )}
          </div>
        );
      },
    },
  ];

  // Actions cho từng hàng
  const rowActions = [
    {
      key: 'view',
      label: 'Xem chi tiết',
      icon: Eye,
      handler: (minigame) => navigate(`/admin/minigames/${minigame._id}`),
    },
    {
      key: 'edit',
      label: 'Chỉnh sửa',
      icon: Edit,
      handler: (minigame) => navigate(`/admin/minigames/${minigame._id}/edit`),
    },
    {
      key: 'tickets',
      label: 'Quản lý vé',
      icon: Trophy,
      handler: (minigame) => navigate(`/admin/minigames/${minigame._id}/tickets`),
    },
    {
      key: 'winners',
      label: 'Xem người thắng',
      icon: Award,
      handler: async (minigame) => {
        try {
          const response = await apiService.getAdminLuckyWinners(minigame._id);
          if (response.data?.length > 0) {
            navigate(`/admin/minigames/${minigame._id}/winners`);
          } else {
            toast.info('Chưa có người thắng cuộc');
          }
        } catch (error) {
          console.error('Error checking winners:', error);
          navigate(`/admin/minigames/${minigame._id}/winners`);
        }
      },
    },
    {
      key: 'draw',
      label: 'Quay số',
      icon: RotateCcw,
      variant: 'default',
      handler: async (minigame) => {
        if (window.confirm('Bạn có chắc chắn muốn quay số cho minigame này?')) {
          try {
            await apiService.drawAdminLucky(minigame._id, true);
            toast.success('Quay số thành công!');
            fetchMinigames();
          } catch (error) {
            console.error('Error drawing:', error);
            toast.error('Có lỗi khi quay số');
          }
        }
      },
      condition: (minigame) => {
        const status = getMinigameStatus(minigame);
        return status.key === 'ended' && minigame.isActive;
      },
    },
    {
      key: 'close',
      label: 'Đóng sớm',
      icon: Pause,
      destructive: true,
      handler: async (minigame) => {
        if (window.confirm('Bạn có chắc chắn muốn đóng sớm minigame này?')) {
          try {
            await apiService.closeAdminMinigame(minigame._id);
            toast.success('Đóng minigame thành công');
            fetchMinigames();
          } catch (error) {
            console.error('Error closing:', error);
            toast.error('Có lỗi xảy ra');
          }
        }
      },
      condition: (minigame) => {
        const status = getMinigameStatus(minigame);
        return status.key === 'active' && !minigame.isClosed;
      },
    },
    {
      key: 'delete',
      label: 'Xóa',
      icon: Trash2,
      destructive: true,
      handler: async (minigame) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa minigame này? Hành động này không thể hoàn tác.')) {
          try {
            await apiService.deleteAdminMinigame(minigame._id);
            toast.success('Xóa minigame thành công');
            fetchMinigames();
          } catch (error) {
            console.error('Error deleting:', error);
            toast.error('Có lỗi xảy ra');
          }
        }
      },
    },
  ];

  // Helper functions
  const getMinigameStatus = (minigame) => {
    const now = new Date();
    const startTime = new Date(minigame.startTime);
    const endTime = new Date(minigame.endTime);
    
    if (minigame.isClosed) return { key: 'closed', label: 'Đã đóng' };
    if (!minigame.isActive) return { key: 'inactive', label: 'Vô hiệu hóa' };
    if (now < startTime) return { key: 'upcoming', label: 'Sắp diễn ra' };
    if (now > endTime) return { key: 'ended', label: 'Đã kết thúc' };
    return { key: 'active', label: 'Đang diễn ra' };
  };

  const getStatusVariant = (statusKey) => {
    switch (statusKey) {
      case 'active': return 'default';
      case 'upcoming': return 'secondary';
      case 'ended': return 'outline';
      case 'closed': return 'destructive';
      case 'inactive': return 'secondary';
      default: return 'secondary';
    }
  };

  // Fetch data
  const fetchMinigames = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const params = {
        page: page.toString(),
        limit: '20',
        sortBy: 'createdAt',
        order: 'desc'
      };
      
      if (search) params.search = search;

      const response = await apiService.getAdminMinigames(params);
      
      // Process minigames with calculated status and ticket count
      const processedMinigames = (response.data.minigames || []).map(minigame => ({
        ...minigame,
        takenCount: minigame.takenCount || 0 // Backend should provide this
      }));
      
      setMinigames(processedMinigames);
      setPagination(response.data.pagination || null);
      
      // Calculate stats
      const statsData = processedMinigames.reduce((acc, minigame) => {
        acc.total++;
        const status = getMinigameStatus(minigame);
        if (status.key === 'active') acc.active++;
        else if (status.key === 'ended') acc.ended++;
        else if (status.key === 'upcoming') acc.upcoming++;
        return acc;
      }, { total: 0, active: 0, ended: 0, upcoming: 0 });
      
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching minigames:', error);
      setMinigames([]);
      setPagination(null);
      toast.error('Có lỗi khi tải danh sách minigames');
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
      label: 'Xuất báo cáo',
      variant: 'outline',
      icon: Download,
      onClick: async () => {
        try {
          // API export should be implemented in backend
          toast.info('Tính năng xuất báo cáo đang được phát triển');
        } catch (error) {
          toast.error('Có lỗi khi xuất báo cáo');
        }
      },
    },
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
        description="Quản lý các trò chơi nhỏ và hoạt động tương tác với người dùng"
        actions={pageActions}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng số</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Minigames</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang hoạt động</CardTitle>
            <Play className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Minigames</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sắp diễn ra</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.upcoming}</div>
            <p className="text-xs text-muted-foreground">Minigames</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã kết thúc</CardTitle>
            <Pause className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.ended}</div>
            <p className="text-xs text-muted-foreground">Minigames</p>
          </CardContent>
        </Card>
      </div>

      <DataTable
        data={minigames}
        columns={columns}
        searchable={true}
        searchPlaceholder="Tìm kiếm theo tên minigame..."
        onRowAction={rowActions}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        emptyMessage="Chưa có minigame nào được tạo"
        className="bg-card"
      />
    </div>
  );
};

export default AdminMinigamesPage;