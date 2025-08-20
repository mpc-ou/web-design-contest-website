/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react';
import { Plus, Download, Eye, Edit, Trash2, Play, Pause, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/admin/ui/PageHeader';
import DataTable from '../../components/admin/ui/DataTable';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { apiService } from '../../services/api';

const ContestsPage = () => {
  const navigate = useNavigate();
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const columns = [
    {
      key: 'name',
      title: 'Tên cuộc thi',
      className: 'font-medium min-w-[200px]',
    },
    {
      key: 'code',
      title: 'Mã cuộc thi',
      className: 'font-mono',
    },
    {
      key: 'category',
      title: 'Danh mục',
      type: 'badge',
      badgeVariant: () => 'outline',
    },
    {
      key: 'registrationStart',
      title: 'Mở đăng ký',
      type: 'custom',
      render: (value, item) => {
        const date = item.timeline?.registrationStart;
        return date ? new Date(date).toLocaleDateString('vi-VN') : '-';
      },
    },
    {
      key: 'registrationEnd',
      title: 'Đóng đăng ký',
      type: 'custom',
      render: (value, item) => {
        const date = item.timeline?.registrationEnd;
        return date ? new Date(date).toLocaleDateString('vi-VN') : '-';
      },
    },
    {
      key: 'status',
      title: 'Trạng thái',
      type: 'badge',
      badgeVariant: (value) => {
        switch (value) {
          case 'upcoming':
            return 'secondary';
          case 'registration':
            return 'default';
          case 'ongoing':
            return 'destructive';
          case 'judging':
            return 'outline';
          case 'completed':
            return 'secondary';
          default:
            return 'outline';
        }
      },
      badgeText: (value) => {
        switch (value) {
          case 'upcoming':
            return 'Sắp diễn ra';
          case 'registration':
            return 'Đang mở đăng ký';
          case 'ongoing':
            return 'Đang diễn ra';
          case 'judging':
            return 'Đang chấm';
          case 'completed':
            return 'Hoàn thành';
          default:
            return value;
        }
      },
    },
    {
      key: 'participantCount',
      title: 'Số đội tham gia',
      type: 'custom',
      render: (value, item) => (
        <div className="flex items-center space-x-1">
          <Trophy className="h-4 w-4 text-muted-foreground" />
          <span>{value || 0}</span>
        </div>
      ),
    },
  ];

  const rowActions = [
    {
      key: 'view',
      label: 'Xem chi tiết',
      icon: Eye,
      handler: (contest) => {
        navigate(`/admin/contests/${contest.code}`);
      },
    },
    {
      key: 'edit',
      label: 'Chỉnh sửa',
      icon: Edit,
      handler: (contest) => {
        navigate(`/admin/contests/${contest.code}/edit`);
      },
    },
    {
      key: 'toggle-status',
      label: (contest) => contest.isActive ? 'Tạm dừng' : 'Kích hoạt',
      icon: (contest) => contest.isActive ? Pause : Play,
      handler: async (contest) => {
        try {
          await apiService.patch(`/api/admin/contests/${contest.code}`, { isActive: !contest.isActive });
          toast.success(`${contest.isActive ? 'Tạm dừng' : 'Kích hoạt'} cuộc thi thành công`);
          fetchContests();
        } catch (error) {
          toast.error('Có lỗi xảy ra');
        }
      },
    },
    {
      key: 'participants',
      label: 'Xem đội tham gia',
      icon: Trophy,
      handler: (contest) => {
        navigate(`/admin/teams?contestId=${contest._id}`);
      },
    },
    {
      key: 'delete',
      label: 'Xóa',
      icon: Trash2,
      destructive: true,
      handler: async (contest) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa cuộc thi này?')) {
          try {
            await apiService.deleteAdminContest(contest.code);
            toast.success('Xóa cuộc thi thành công');
            fetchContests();
          } catch (error) {
            toast.error('Có lỗi xảy ra');
          }
        }
      },
    },
  ];

  const fetchContests = async (page = 1, search = '', status = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });
      
      if (search) params.append('search', search);
      if (status) params.append('status', status);

      const response = await apiService.getAdminContests(Object.fromEntries(params));
      setContests(response.data.data || []);
      setPagination(response.data.pagination || null);
    } catch (error) {
      console.error('Error fetching contests:', error);
      
      // Set empty data for development
      setContests([]);
      setPagination(null);
      
      if (error.response?.status === 404) {
        toast.error('API endpoint chưa được implement');
      } else {
        toast.error('Có lỗi khi tải danh sách cuộc thi');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await apiService.exportTeamsReport();
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `contests_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Xuất file thành công');
    } catch (error) {
      console.error('Error exporting contests:', error);
      toast.error('Có lỗi khi xuất file');
    }
  };

  useEffect(() => {
    fetchContests();
  }, []);

  const handleSearch = (search) => {
    setSearchTerm(search);
    fetchContests(1, search, filterStatus);
  };

  const handleFilter = (status) => {
    setFilterStatus(status);
    fetchContests(1, searchTerm, status);
  };

  const handlePageChange = (page) => {
    fetchContests(page, searchTerm, filterStatus);
  };

  const pageActions = [
    {
      label: 'Tạo cuộc thi',
      variant: 'default',
      icon: Plus,
      onClick: () => navigate('/admin/contests/create'),
    },
  ];

  const filterOptions = {
    options: [
      { value: 'upcoming', label: 'Sắp diễn ra' },
      { value: 'registration', label: 'Đang mở đăng ký' },
      { value: 'ongoing', label: 'Đang diễn ra' },
      { value: 'judging', label: 'Đang chấm' },
      { value: 'completed', label: 'Hoàn thành' },
    ],
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý cuộc thi"
        description="Quản lý thông tin cuộc thi và theo dõi tiến độ tham gia"
        actions={pageActions}
      />

      <DataTable
        data={contests}
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

export default ContestsPage;