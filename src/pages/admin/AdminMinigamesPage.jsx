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

  // Định nghĩa cấu trúc dữ liệu hiển thị
  const columns = [
    {
      key: 'thumbnail',
      title: '',
      type: 'custom',
      render: (_, item) => {
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
      key: 'name', // Từ backend là 'name' không phải 'title'
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
      key: 'maxNumber', // Từ backend là 'maxNumber' không phải 'maxParticipants'
      title: 'Số tối đa',
      type: 'custom',
      render: (value) => (
        <span className="font-medium">{value || 'Không giới hạn'}</span>
      ),
    },
    {
      key: 'participants',
      title: 'Đã tham gia',
      type: 'custom',
      render: (_, item) => {
        // Đếm số lượng vé đã đăng ký (sẽ được tính từ API)
        const takenCount = item.takenCount || 0;
        return (
          <div className="flex items-center space-x-2">
            <span className="font-medium">{takenCount}</span>
            {item.maxNumber && (
              <span className="text-xs text-muted-foreground">
                / {item.maxNumber}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'startTime', // Từ backend là 'startTime' không phải 'startDate'
      title: 'Ngày bắt đầu',
      type: 'datetime',
    },
    {
      key: 'endTime', // Từ backend là 'endTime' không phải 'endDate'
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
      key: 'winners',
      label: 'Xem người thắng',
      icon: Award,
      handler: async (minigame) => {
        try {
          // Sử dụng API endpoint từ backend để lấy danh sách người thắng
          const response = await apiService.getAdminLuckyWinners(minigame._id);
          if (response.data.winners && response.data.winners.length > 0) {
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
            // Sử dụng API endpoint từ backend để quay số
            await apiService.drawAdminLucky(minigame._id, true);
            toast.success('Quay số thành công');
            fetchMinigames();
          } catch (error) {
            toast.error('Có lỗi khi quay số');
          }
        }
      },
      // Chỉ hiển thị nút quay số khi minigame đã kết thúc
      condition: (minigame) => minigame.status === 'ended' || minigame.status === 'closed',
    },
    {
      key: 'close',
      label: 'Đóng sớm',
      icon: Pause,
      destructive: true,
      handler: async (minigame) => {
        if (window.confirm('Bạn có chắc chắn muốn đóng minigame này sớm?')) {
          try {
            // Sử dụng API endpoint từ backend để đóng minigame sớm
            await apiService.closeAdminMinigame(minigame._id);
            toast.success('Đóng minigame thành công');
            fetchMinigames();
          } catch (error) {
            toast.error('Có lỗi xảy ra');
          }
        }
      },
      // Chỉ hiển thị nút đóng sớm khi minigame đang hoạt động
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
            // Sử dụng API endpoint từ backend để xóa minigame
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

      // Sử dụng API endpoint từ backend để lấy danh sách minigames
      const response = await apiService.getAdminMinigames(params);
      
      // Xử lý và tính toán trạng thái cho từng minigame
      const processedMinigames = (response.data.minigames || []).map(minigame => {
        // Tính toán trạng thái dựa trên thời gian và các trường từ backend
        const now = new Date();
        const startTime = new Date(minigame.startTime);
        const endTime = new Date(minigame.endTime);
        
        let status = 'upcoming';
        if (minigame.isClosed) {
          status = 'closed';
        } else if (!minigame.isActive) {
          status = 'ended';
        } else if (now >= endTime) {
          status = 'ended';
        } else if (now >= startTime) {
          status = 'active';
        }
        
        return {
          ...minigame,
          status
        };
      });
      
      setMinigames(processedMinigames);
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