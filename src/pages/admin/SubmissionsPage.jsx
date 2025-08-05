import { useEffect, useState } from 'react';
import { Download, Eye, Trash2, ExternalLink, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/admin/ui/PageHeader';
import DataTable from '../../components/admin/ui/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { apiService } from '../../services/api';

const SubmissionsPage = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRound, setFilterRound] = useState('all');

  const columns = [
    {
      key: 'teamInfo',
      title: 'Đội thi',
      type: 'custom',
      render: (value, item) => (
        <div className="space-y-1">
          <div className="font-medium">{item.team?.teamName}</div>
          <div className="text-xs text-muted-foreground">{item.team?.division}</div>
        </div>
      ),
      className: 'min-w-[150px]',
    },
    {
      key: 'contestInfo',
      title: 'Cuộc thi',
      type: 'custom',
      render: (value, item) => (
        <div className="space-y-1">
          <div className="font-medium">{item.contest?.name}</div>
          <div className="text-xs text-muted-foreground">{item.contest?.code}</div>
        </div>
      ),
      className: 'min-w-[150px]',
    },
    {
      key: 'round',
      title: 'Vòng thi',
      type: 'badge',
      badgeVariant: () => 'outline',
    },
    {
      key: 'githubLink',
      title: 'GitHub',
      type: 'custom',
      render: (value) => value ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.open(value, '_blank')}
          className="h-8 px-2"
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
      ) : '-',
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
      key: 'submittedAt',
      title: 'Ngày nộp',
      type: 'datetime',
    },
    {
      key: 'isActive',
      title: 'Trạng thái',
      type: 'badge',
      badgeVariant: (value) => value ? 'default' : 'secondary',
      badgeText: (value) => value ? 'Hoạt động' : 'Không hoạt động',
    },
  ];

  const rowActions = [
    {
      key: 'view',
      label: 'Xem chi tiết',
      icon: Eye,
      handler: (submission) => {
        navigate(`/admin/submissions/${submission._id}`);
      },
    },
    {
      key: 'github',
      label: 'Mở GitHub',
      icon: ExternalLink,
      handler: (submission) => {
        if (submission.githubLink) {
          window.open(submission.githubLink, '_blank');
        } else {
          toast.error('Không có link GitHub');
        }
      },
      condition: (submission) => !!submission.githubLink,
    },
    {
      key: 'team-submissions',
      label: 'Bài nộp của đội',
      icon: Calendar,
      handler: (submission) => {
        navigate(`/admin/submissions?teamId=${submission.team._id}`);
      },
    },
    {
      key: 'delete',
      label: 'Xóa',
      icon: Trash2,
      destructive: true,
      handler: async (submission) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa bài nộp này?')) {
          try {
            await apiService.deleteAdminSubmission(submission._id);
            toast.success('Xóa bài nộp thành công');
            fetchSubmissions();
          } catch (error) {
            toast.error('Có lỗi xảy ra');
          }
        }
      },
    },
  ];

  const fetchSubmissions = async (page = 1, search = '', round = '') => {
    try {
      setLoading(true);
      const params = {
        page: page.toString(),
        limit: '20',
      };
      
      if (search) params.search = search;
      if (round) params.round = round;

      const response = await apiService.getAdminSubmissions(params);
      setSubmissions(response.data.data || []);
      setPagination(response.data.pagination || null);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      
      setSubmissions([]);
      setPagination(null);
      
      if (error.response?.status === 404) {
        toast.error('API endpoint chưa được implement');
      } else {
        toast.error('Có lỗi khi tải danh sách bài nộp');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const params = {};
      if (filterRound) params.round = filterRound;

      const response = await apiService.exportSubmissionsReport(params);
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `submissions_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Xuất file thành công');
    } catch (error) {
      console.error('Error exporting submissions:', error);
      toast.error('Có lỗi khi xuất file');
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleSearch = (search) => {
    setSearchTerm(search);
    fetchSubmissions(1, search, filterRound);
  };

  const handleFilter = (round) => {
    setFilterRound(round);
    fetchSubmissions(1, searchTerm, round);
  };

  const handlePageChange = (page) => {
    fetchSubmissions(page, searchTerm, filterRound);
  };

  const filterOptions = {
    options: [
      { value: 'Vòng loại', label: 'Vòng loại' },
      { value: 'Vòng chung kết', label: 'Vòng chung kết' },
      { value: 'Vòng thi tài năng', label: 'Vòng thi tài năng' },
    ],
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý bài nộp"
        description="Quản lý và theo dõi các bài nộp của các đội thi"
      />

      <DataTable
        data={submissions}
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

export default SubmissionsPage;