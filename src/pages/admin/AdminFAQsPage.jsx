import { useEffect, useState } from 'react';
import { Plus, Download, Eye, Edit, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/admin/ui/PageHeader';
import DataTable from '../../components/admin/ui/DataTable';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { apiService } from '../../services/api';

const AdminFAQsPage = () => {
  const navigate = useNavigate();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const columns = [
    {
      key: 'order',
      title: 'STT',
      type: 'custom',
      render: (value) => (
        <span className="font-mono text-sm">{value}</span>
      ),
    },
    {
      key: 'question',
      title: 'Câu hỏi',
      className: 'font-medium min-w-[250px]',
    },
    {
      key: 'answer',
      title: 'Câu trả lời',
      type: 'custom',
      render: (value) => (
        <div className="max-w-sm truncate" title={value}>
          {value || '-'}
        </div>
      ),
    },
    {
      key: 'category',
      title: 'Danh mục',
      type: 'badge',
      badgeVariant: (value) => {
        switch (value) {
          case 'general':
            return 'default';
          case 'contest':
            return 'secondary';
          case 'registration':
            return 'outline';
          case 'technical':
            return 'destructive';
          default:
            return 'secondary';
        }
      },
      badgeText: (value) => {
        switch (value) {
          case 'general':
            return 'Chung';
          case 'contest':
            return 'Cuộc thi';
          case 'registration':
            return 'Đăng ký';
          case 'technical':
            return 'Kỹ thuật';
          default:
            return value;
        }
      },
    },
    {
      key: 'tags',
      title: 'Thẻ',
      type: 'custom',
      render: (value) => (
        <div className="flex flex-wrap gap-1">
          {value?.slice(0, 2).map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {value?.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{value.length - 2}
            </Badge>
          )}
        </div>
      ),
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
      handler: (faq) => {
        navigate(`/admin/faqs/${faq._id}`);
      },
    },
    {
      key: 'edit',
      label: 'Chỉnh sửa',
      icon: Edit,
      handler: (faq) => {
        navigate(`/admin/faqs/${faq._id}/edit`);
      },
    },
    {
      key: 'move-up',
      label: 'Di chuyển lên',
      icon: ArrowUp,
      handler: async (faq) => {
        try {
          await apiService.updateAdminFAQ(faq._id, { 
            order: Math.max(1, faq.order - 1) 
          });
          toast.success('Di chuyển FAQ lên thành công');
          fetchFAQs();
        } catch (error) {
          toast.error('Có lỗi xảy ra');
        }
      },
      condition: (faq) => faq.order > 1,
    },
    {
      key: 'move-down',
      label: 'Di chuyển xuống',
      icon: ArrowDown,
      handler: async (faq) => {
        try {
          await apiService.updateAdminFAQ(faq._id, { 
            order: faq.order + 1 
          });
          toast.success('Di chuyển FAQ xuống thành công');
          fetchFAQs();
        } catch (error) {
          toast.error('Có lỗi xảy ra');
        }
      },
    },
    {
      key: 'toggle-status',
      label: (faq) => faq.isActive ? 'Vô hiệu hóa' : 'Kích hoạt',
      icon: Edit,
      handler: async (faq) => {
        try {
          await apiService.updateAdminFAQ(faq._id, { 
            isActive: !faq.isActive 
          });
          toast.success(`${faq.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'} FAQ thành công`);
          fetchFAQs();
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
      handler: async (faq) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa FAQ này?')) {
          try {
            await apiService.deleteAdminFAQ(faq._id);
            toast.success('Xóa FAQ thành công');
            fetchFAQs();
          } catch (error) {
            toast.error('Có lỗi xảy ra');
          }
        }
      },
    },
  ];

  const fetchFAQs = async (page = 1, search = '', category = '') => {
    try {
      setLoading(true);
      const params = {
        page: page.toString(),
        limit: '20',
        sortBy: 'order',
        order: 'asc',
      };
      
      if (search) params.search = search;
      if (category) params.category = category;

      const response = await apiService.getAdminFAQs(params);
      setFaqs(response.data.data || []);
      setPagination(response.data.pagination || null);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      
      setFaqs([]);
      setPagination(null);
      
      if (error.response?.status === 404) {
        toast.error('API endpoint chưa được implement');
      } else {
        toast.error('Có lỗi khi tải danh sách FAQ');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFAQs();
  }, []);

  const handleSearch = (search) => {
    setSearchTerm(search);
    fetchFAQs(1, search, filterCategory);
  };

  const handleFilter = (category) => {
    setFilterCategory(category);
    fetchFAQs(1, searchTerm, category);
  };

  const handlePageChange = (page) => {
    fetchFAQs(page, searchTerm, filterCategory);
  };

  const pageActions = [
    {
      label: 'Tạo FAQ',
      variant: 'default',
      icon: Plus,
      onClick: () => navigate('/admin/faqs/create'),
    },
  ];

  const filterOptions = {
    options: [
      { value: 'general', label: 'Chung' },
      { value: 'contest', label: 'Cuộc thi' },
      { value: 'registration', label: 'Đăng ký' },
      { value: 'technical', label: 'Kỹ thuật' },
    ],
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý FAQ"
        description="Quản lý các câu hỏi thường gặp và câu trả lời"
        actions={pageActions}
      />

      <DataTable
        data={faqs}
        columns={columns}
        searchable={true}
        filterable={filterOptions}
        onRowAction={rowActions}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        onFilter={handleFilter}
      />
    </div>
  );
};

export default AdminFAQsPage;