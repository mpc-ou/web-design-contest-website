import { useEffect, useState } from 'react';
import { Plus, Download, Eye, Edit, Trash2, Building2, ExternalLink, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/admin/ui/PageHeader';
import DataTable from '../../components/admin/ui/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { apiService } from '../../services/api';

const SponsorsPage = () => {
  const navigate = useNavigate();
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState('all');

  const columns = [
    {
      key: 'logo',
      title: 'Logo',
      type: 'custom',
      render: (value, item) => {
        return item.logo ? (
          <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden p-2">
            <img 
              src={item.logo} 
              alt={item.name}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="w-full h-full items-center justify-center hidden">
              <Building2 className="h-6 w-6 text-muted-foreground" />
            </div>
          </div>
        ) : (
          <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
            <Building2 className="h-6 w-6 text-muted-foreground" />
          </div>
        );
      },
    },
    {
      key: 'name',
      title: 'Tên nhà tài trợ',
      className: 'font-medium min-w-[200px]',
    },
    {
      key: 'displayName',
      title: 'Tên hiển thị',
      type: 'custom',
      render: (value, item) => item.displayName || item.name,
    },
    {
      key: 'currentTier',
      title: 'Cấp độ hiện tại',
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
          case 'Bronze':
            return 'secondary';
          case 'Supporter':
            return 'outline';
          default:
            return 'outline';
        }
      },
    },
    {
      key: 'website',
      title: 'Website',
      type: 'custom',
      render: (value, item) => {
        if (!item.website) return '-';
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(item.website, '_blank')}
            className="h-8 px-2"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Website
          </Button>
        );
      },
    },
    {
      key: 'email',
      title: 'Email liên hệ',
    },
    {
      key: 'phone',
      title: 'Số điện thoại',
    },
    {
      key: 'socialMedia',
      title: 'Mạng xã hội',
      type: 'custom',
      render: (value, item) => {
        if (!item.socialMedia) return '-';
        const socials = [];
        if (item.socialMedia.facebook) socials.push('Facebook');
        if (item.socialMedia.linkedin) socials.push('LinkedIn');
        if (item.socialMedia.twitter) socials.push('Twitter');
        
        return socials.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {socials.slice(0, 2).map((social, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {social}
              </Badge>
            ))}
            {socials.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{socials.length - 2}
              </Badge>
            )}
          </div>
        ) : '-';
      },
    },
    {
      key: 'sponsorshipHistory',
      title: 'Lịch sử tài trợ',
      type: 'custom',
      render: (value, item) => {
        const historyCount = item.sponsorshipHistory?.length || 0;
        return (
          <div className="flex items-center space-x-1">
            <History className="h-4 w-4 text-muted-foreground" />
            <span>{historyCount}</span>
          </div>
        );
      },
    },
    {
      key: 'priority',
      title: 'Ưu tiên',
      type: 'custom',
      render: (value, item) => (
        <Badge variant="outline">
          {item.priority || 0}
        </Badge>
      ),
    },
    {
      key: 'isActive',
      title: 'Hoạt động',
      type: 'badge',
      badgeVariant: (value) => value ? 'default' : 'secondary',
      badgeText: (value) => value ? 'Có' : 'Không',
    },
    {
      key: 'isPublic',
      title: 'Công khai',
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
      key: 'view-history',
      label: 'Xem lịch sử',
      icon: History,
      handler: (sponsor) => {
        navigate(`/admin/sponsors/${sponsor._id}/history`);
      },
    },
    {
      key: 'add-history',
      label: 'Thêm lịch sử',
      icon: Plus,
      handler: async (sponsor) => {
        // Simple prompt for demo - in real app, you'd use a modal
        const year = prompt('Năm tài trợ:');
        const contestCode = prompt('Mã cuộc thi:');
        const contestName = prompt('Tên cuộc thi:');
        const tier = prompt('Cấp độ (Diamond/Platinum/Gold/Silver/Bronze/Supporter):');
        const amount = prompt('Số tiền (VNĐ):');
        
        if (year && contestCode && tier) {
          try {
            await apiService.post(`/admin/sponsors/${sponsor._id}/history`, {
              year: parseInt(year),
              contestCode,
              contestName: contestName || contestCode,
              tier,
              amount: amount ? parseInt(amount) : 0,
              benefits: [],
              notes: ''
            });
            toast.success('Thêm lịch sử tài trợ thành công');
            fetchSponsors();
          } catch (error) {
            toast.error('Có lỗi xảy ra: ' + (error.response?.data?.error || error.message));
          }
        }
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
      key: 'toggle-status',
      label: (sponsor) => sponsor.isActive ? 'Vô hiệu hóa' : 'Kích hoạt',
      icon: Eye,
      handler: async (sponsor) => {
        try {
          await apiService.put(`/admin/sponsors/${sponsor._id}`, {
            ...sponsor,
            isActive: !sponsor.isActive
          });
          toast.success(`${sponsor.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'} nhà tài trợ thành công`);
          fetchSponsors();
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
      handler: async (sponsor) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa nhà tài trợ này?')) {
          try {
            await apiService.delete(`/admin/sponsors/${sponsor._id}`);
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
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });
      
      if (search) params.append('search', search);
      if (tier) params.append('tier', tier);

      const response = await apiService.get(`/admin/sponsors?${params}`);
      setSponsors(response.data.data || []);
      setPagination(response.data.pagination || null);
    } catch (error) {
      console.error('Error fetching sponsors:', error);
      
      // Set empty data for development
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
      const params = new URLSearchParams();
      if (filterTier) params.append('tier', filterTier);

      const response = await apiService.get(`/admin/reports/sponsors?${params}`, {
        responseType: 'blob',
      });
      
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
      { value: 'Diamond', label: 'Kim cương' },
      { value: 'Platinum', label: 'Bạch kim' },
      { value: 'Gold', label: 'Vàng' },
      { value: 'Silver', label: 'Bạc' },
      { value: 'Bronze', label: 'Đồng' },
      { value: 'Supporter', label: 'Ủng hộ' },
    ],
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý nhà tài trợ"
        description="Quản lý thông tin nhà tài trợ và lịch sử hợp tác"
        actions={pageActions}
        badge={{
          text: `${sponsors.length} nhà tài trợ`,
          variant: 'outline',
        }}
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

export default SponsorsPage;