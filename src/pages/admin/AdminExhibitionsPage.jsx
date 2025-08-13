import { useEffect, useState } from 'react';
import { Plus, Download, Eye, Edit, Trash2, ExternalLink, Image } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/admin/ui/PageHeader';
import DataTable from '../../components/admin/ui/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { apiService } from '../../services/api';

const AdminExhibitionsPage = () => {
  const navigate = useNavigate();
  const [exhibitions, setExhibitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const columns = [
    {
      key: 'title',
      title: 'Tiêu đề',
      className: 'font-medium min-w-[200px]',
    },
    {
      key: 'isPublic',
      title: 'Công khai',
      type: 'custom',
      render: (value) => (
        <Badge variant={value ? 'default' : 'outline'} className="text-xs">
          {value ? 'Có' : 'Không'}
        </Badge>
      ),
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
    },
    {
      key: 'tags',
      title: 'Thẻ',
      type: 'custom',
      render: (value) => (
        <div className="flex flex-wrap gap-1">
          {value?.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {value?.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{value.length - 3}
            </Badge>
          )}
        </div>
      ),
    },
    // keep only one tags column; removed technologies
    {
      key: 'demoUrl',
      title: 'Demo',
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
      handler: (exhibition) => {
        navigate(`/admin/exhibitions/${exhibition._id}`);
      },
    },
    {
      key: 'edit',
      label: 'Chỉnh sửa',
      icon: Edit,
      handler: (exhibition) => {
        navigate(`/admin/exhibitions/${exhibition._id}/edit`);
      },
    },
    {
      key: 'demo',
      label: 'Xem Demo',
      icon: ExternalLink,
      handler: (exhibition) => {
        if (exhibition.demoUrl) {
          window.open(exhibition.demoUrl, '_blank');
        } else {
          toast.error('Không có link demo');
        }
      },
      condition: (exhibition) => !!exhibition.demoUrl,
    },
    {
      key: 'delete',
      label: 'Xóa',
      icon: Trash2,
      destructive: true,
      handler: async (exhibition) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa triển lãm này?')) {
          try {
            await apiService.deleteAdminExhibition(exhibition._id);
            toast.success('Xóa triển lãm thành công');
            fetchExhibitions();
          } catch (error) {
            toast.error('Có lỗi xảy ra');
          }
        }
      },
    },
  ];

  const fetchExhibitions = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const params = {
        page: page.toString(),
        limit: '20',
      };
      
      if (search) params.search = search;

      const response = await apiService.getAdminExhibitions(params);
      setExhibitions(response.data.exhibitions || []);
      setPagination(response.data.pagination || null);
    } catch (error) {
      console.error('Error fetching exhibitions:', error);
      
      setExhibitions([]);
      setPagination(null);
      
      if (error.response?.status === 404) {
        toast.error('API endpoint chưa được implement');
      } else {
        toast.error('Có lỗi khi tải danh sách triển lãm');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExhibitions();
  }, []);

  const handleSearch = (search) => {
    setSearchTerm(search);
    fetchExhibitions(1, search);
  };

  const handlePageChange = (page) => {
    fetchExhibitions(page, searchTerm);
  };

  const pageActions = [
    {
      label: 'Tạo triển lãm',
      variant: 'default',
      icon: Plus,
      onClick: () => navigate('/admin/exhibitions/create'),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý triển lãm"
        description="Quản lý các triển lãm dự án và sản phẩm của các đội thi"
        actions={pageActions}
      />

      <DataTable
        data={exhibitions}
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

export default AdminExhibitionsPage;