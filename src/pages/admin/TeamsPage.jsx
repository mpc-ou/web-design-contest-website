import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download, Eye, Edit, Trash2, CheckCircle, XCircle, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/admin/ui/PageHeader';
import DataTable from '../../components/admin/ui/DataTable';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { apiService } from '../../services/api';

const TeamsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const contestId = searchParams.get('contestId');
  
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const columns = [
    {
      key: 'teamName',
      title: 'Tên đội',
      className: 'font-medium min-w-[200px]',
    },
    {
      key: 'contestInfo',
      title: 'Cuộc thi',
      type: 'custom',
      render: (value, item) => (
        <div className="space-y-1">
          <div className="font-medium">{item.contestName}</div>
          <div className="text-xs text-muted-foreground">{item.contestCode}</div>
        </div>
      ),
    },
    {
      key: 'category',
      title: 'Bảng thi',
      type: 'badge',
      badgeVariant: () => 'outline',
    },
    {
      key: 'leader',
      title: 'Trưởng nhóm',
      type: 'custom',
      render: (value, item) => (
        <div className="space-y-1">
          <div className="font-medium">{item.leader?.name}</div>
          <div className="text-xs text-muted-foreground">{item.leader?.email}</div>
        </div>
      ),
    },
    {
      key: 'memberCount',
      title: 'Số thành viên',
      type: 'custom',
      render: (value, item) => (
        <span className="font-medium">{item.members?.length || 0}</span>
      ),
    },
    {
      key: 'status',
      title: 'Trạng thái',
      type: 'badge',
      badgeVariant: (value) => {
        switch (value) {
          case 'pending':
            return 'secondary';
          case 'approved':
            return 'default';
          case 'rejected':
            return 'destructive';
          case 'submitted':
            return 'outline';
          default:
            return 'secondary';
        }
      },
      badgeText: (value) => {
        switch (value) {
          case 'pending':
            return 'Chờ duyệt';
          case 'approved':
            return 'Đã duyệt';
          case 'rejected':
            return 'Từ chối';
          case 'submitted':
            return 'Đã nộp bài';
          default:
            return value;
        }
      },
    },
    {
      key: 'award',
      title: 'Giải thưởng',
      type: 'custom',
      render: (value, item) => {
        if (!item.award) return '-';
        return (
          <Badge variant="default" className="bg-yellow-500 text-white">
            <Trophy className="h-3 w-3 mr-1" />
            {item.award}
          </Badge>
        );
      },
    },
    {
      key: 'createdAt',
      title: 'Ngày đăng ký',
      type: 'date',
    },
  ];

  const rowActions = [
    {
      key: 'view',
      label: 'Xem chi tiết',
      icon: Eye,
      handler: (team) => {
        navigate(`/admin/teams/${team._id}`);
      },
    },
    {
      key: 'edit',
      label: 'Chỉnh sửa',
      icon: Edit,
      handler: (team) => {
        navigate(`/admin/teams/${team._id}/edit`);
      },
    },
    {
      key: 'approve',
      label: 'Duyệt đội',
      icon: CheckCircle,
      handler: async (team) => {
        try {
          await apiService.approveAdminForm(team.formRegisterId || team._id);
          toast.success('Duyệt đội thi thành công');
          fetchTeams();
        } catch (error) {
          toast.error('Có lỗi xảy ra');
        }
      },
      condition: (team) => team.status === 'pending',
    },
    {
      key: 'reject',
      label: 'Từ chối',
      icon: XCircle,
      destructive: true,
      handler: async (team) => {
        const reason = prompt('Lý do từ chối:');
        if (reason) {
          try {
            await apiService.rejectAdminForm(team.formRegisterId || team._id, { adminNote: reason });
            toast.success('Từ chối đội thi thành công');
            fetchTeams();
          } catch (error) {
            toast.error('Có lỗi xảy ra');
          }
        }
      },
      condition: (team) => team.status === 'pending',
    },
    {
      key: 'delete',
      label: 'Xóa',
      icon: Trash2,
      destructive: true,
      handler: async (team) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa đội thi này?')) {
          try {
            await apiService.deleteAdminTeam(team._id);
            toast.success('Xóa đội thi thành công');
            fetchTeams();
          } catch (error) {
            toast.error('Có lỗi xảy ra');
          }
        }
      },
    },
  ];

  const fetchTeams = async (page = 1, search = '', status = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });
      
      if (search) params.append('search', search);
      if (status) params.append('status', status);
      if (contestId) params.append('contestId', contestId);

      const response = await apiService.getAdminTeams(Object.fromEntries(params));
      setTeams(response.data.data || []);
      setPagination(response.data.pagination || null);
    } catch (error) {
      console.error('Error fetching teams:', error);
      
      // Set empty data for development
      setTeams([]);
      setPagination(null);
      
      if (error.response?.status === 404) {
        toast.error('API endpoint chưa được implement');
      } else {
        toast.error('Có lỗi khi tải danh sách đội thi');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (contestId) params.append('contestId', contestId);
      if (filterStatus) params.append('status', filterStatus);

      const response = await apiService.exportTeamsReport(Object.fromEntries(params));
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `teams_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Xuất file thành công');
    } catch (error) {
      console.error('Error exporting teams:', error);
      toast.error('Có lỗi khi xuất file');
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [contestId]);

  const handleSearch = (search) => {
    setSearchTerm(search);
    fetchTeams(1, search, filterStatus);
  };

  const handleFilter = (status) => {
    setFilterStatus(status);
    fetchTeams(1, searchTerm, status);
  };

  const handlePageChange = (page) => {
    fetchTeams(page, searchTerm, filterStatus);
  };

  const filterOptions = {
    options: [
      { value: 'pending', label: 'Chờ duyệt' },
      { value: 'approved', label: 'Đã duyệt' },
      { value: 'rejected', label: 'Từ chối' },
      { value: 'submitted', label: 'Đã nộp bài' },
    ],
  };

  const title = contestId ? 'Đội thi theo cuộc thi' : 'Quản lý đội thi';
  const description = contestId 
    ? 'Danh sách đội thi tham gia cuộc thi được chọn'
    : 'Quản lý thông tin đội thi và trạng thái tham gia các cuộc thi';

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={description}
      />

      <DataTable
        data={teams}
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

export default TeamsPage;