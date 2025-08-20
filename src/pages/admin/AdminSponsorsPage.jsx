import { useEffect, useState } from 'react';
import { Plus, Download, Eye, Edit, Trash2, ExternalLink, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/admin/ui/PageHeader';
import DataTable from '../../components/admin/ui/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { apiService } from '../../services/api';

const AdminSponsorsPage = () => {
  const navigate = useNavigate();
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState('all');

  const columns = [
    {
      key: 'name',
      title: 'Tên nhà tài trợ',
      className: 'font-medium min-w-[200px]',
    },
    {
      key: 'displayName',
      title: 'Tên hiển thị',
      className: 'min-w-[150px]',
    },
    {
      key: 'currentTier',
      title: 'Cấp độ tài trợ',
      type: 'badge',
      badgeVariant: (value) => {
        switch (value) {
          case 'Diamond':
            return 'destructive';
          case 'Platinum':
            return 'default';
          case 'Gold':
            return 'secondary';
          case 'Silver':
            return 'outline';
          default:
            return 'secondary';
        }
      },
    },
    {
      key: 'website',
      title: 'Website',
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
      key: 'sponsorshipCount',
      title: 'Số lần tài trợ',
      type: 'custom',
      render: (value, item) => (
        <span className="font-medium">
          {item.sponsorshipHistory?.length || 0}
        </span>
      ),
    },
    {
      key: 'isActive',
      title: 'Trạng thái',
      type: 'badge',
      badgeVariant: (value) => value ? 'default' : 'secondary',
      badgeText: (value) => value ? 'Hoạt động' : 'Không hoạt động',
    },
    {
      key: 'isPublic',
      title: 'Hiển thị',
      type: 'badge',
      badgeVariant: (value) => value ? 'default' : 'outline',
      badgeText: (value) => value ? 'Công khai' : 'Riêng tư',
    },
    {
      key: 'priority',
      title: 'Ưu tiên',
      type: 'custom',
      render: (value) => (
        <span className="font-mono text-sm">{value}</span>
      ),
    },
  ];

  const rowActions = [
    {
      key: 'view',
      label: 'Xem chi tiết',
      icon: Eye,
      handler: (sponsor) => {
        navigate(`/admin/sponsors/${sponsor._id}`);
      },
    },
    {
      key: 'edit',
      label: 'Chỉnh sửa',
      icon: Edit,
      handler: (sponsor) => {
        navigate(`/admin/sponsors/${sponsor._id}/edit`);
      },
    },
    {
      key: 'history',
      label: 'Lịch sử tài trợ',
      icon: History,
      handler: (sponsor) => {
        navigate(`/admin/sponsors/${sponsor._id}/history`);
      },
    },
    {
      key: 'website',
      label: 'Mở Website',
      icon: ExternalLink,
      handler: (sponsor) => {
        if (sponsor.website) {
          window.open(sponsor.website, '_blank');
        } else {
          toast.error('Không có website');
        }
      },
      condition: (sponsor) => !!sponsor.website,
    },
    {
      key: 'delete',
      label: 'Xóa',
      icon: Trash2,
      destructive: true,
      handler: async (sponsor) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa nhà tài trợ này?')) {
          try {
            await apiService.deleteAdminSponsor(sponsor._id);
            toast.success('Xóa nhà tài trợ thành công');
            fetchSponsors();
          } catch (error) {
            toast.error('Có lỗi xảy ra');
          }
        }
      },
    },
  ];

  const fetchSponsors = async (page = 1, search = '', tier = '') => {
    try {
      setLoading(true);
      const params = {
        page: page.toString(),
        limit: '20',
      };
      
      if (search) params.search = search;
      if (tier) params.tier = tier;

      const response = await apiService.getAdminSponsors(params);
      setSponsors(response.data.data || []);
      setPagination(response.data.pagination || null);
    } catch (error) {
      console.error('Error fetching sponsors:', error);
      
      setSponsors([]);
      setPagination(null);
      
      if (error.response?.status === 404) {
        toast.error('API endpoint chưa được implement');
      } else {
        toast.error('Có lỗi khi tải danh sách nhà tài trợ');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const params = {};
      if (filterTier) params.tier = filterTier;

      const response = await apiService.exportSponsorsReport(params);
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sponsors_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Xuất file thành công');
    } catch (error) {
      console.error('Error exporting sponsors:', error);
      toast.error('Có lỗi khi xuất file');
    }
  };

  useEffect(() => {
    fetchSponsors();
  }, []);

  const handleSearch = (search) => {
    setSearchTerm(search);
    fetchSponsors(1, search, filterTier);
  };

  const handleFilter = (tier) => {
    setFilterTier(tier);
    fetchSponsors(1, searchTerm, tier);
  };

  const handlePageChange = (page) => {
    fetchSponsors(page, searchTerm, filterTier);
  };

  const pageActions = [
    {
      label: 'Thêm nhà tài trợ',
      variant: 'default',
      icon: Plus,
      onClick: () => navigate('/admin/sponsors/create'),
    },
  ];

  const filterOptions = {
    options: [
      { value: 'Diamond', label: 'Diamond' },
      { value: 'Platinum', label: 'Platinum' },
      { value: 'Gold', label: 'Gold' },
      { value: 'Silver', label: 'Silver' },
      { value: 'Bronze', label: 'Bronze' },
      { value: 'Supporter', label: 'Supporter' },
    ],
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý nhà tài trợ"
        description="Quản lý thông tin nhà tài trợ và lịch sử hợp tác"
        actions={pageActions}
      />

      <DataTable
        data={sponsors}
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

export default AdminSponsorsPage;