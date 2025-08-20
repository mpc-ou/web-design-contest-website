import { useEffect, useState } from 'react';
import { Download, Eye, CheckCircle, XCircle, Trash2, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/admin/ui/PageHeader';
import DataTable from '../../components/admin/ui/DataTable';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { apiService } from '../../services/api';

const RegistrationsPage = () => {
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const columns = [
    {
      key: 'leaderName',
      title: 'Trưởng nhóm',
      className: 'font-medium min-w-[150px]',
    },
    {
      key: 'email',
      title: 'Email',
      className: 'min-w-[200px]',
    },
    {
      key: 'teamName',
      title: 'Tên đội',
      className: 'font-medium min-w-[150px]',
    },
    {
      key: 'contestInfo',
      title: 'Cuộc thi',
      type: 'custom',
      render: (value, item) => (
        <div className="space-y-1">
          <div className="font-medium">{item.contestId?.name}</div>
          <div className="text-xs text-muted-foreground">{item.contestId?.code}</div>
        </div>
      ),
    },
    {
      key: 'division',
      title: 'Bảng thi',
      type: 'badge',
      badgeVariant: () => 'outline',
    },
    {
      key: 'memberCount',
      title: 'Số thành viên',
      type: 'custom',
      render: (value, item) => (
        <div className="flex items-center space-x-1">
          <User className="h-4 w-4 text-muted-foreground" />
          <span>{item.members?.length + 1 || 1}</span>
        </div>
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
          default:
            return value;
        }
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
      handler: (form) => {
        navigate(`/admin/registrations/${form._id}`);
      },
    },
    {
      key: 'approve',
      label: 'Duyệt form',
      icon: CheckCircle,
      handler: async (form) => {
        try {
          await apiService.approveAdminForm(form._id, { 
            adminNote: 'Form hợp lệ, tạo team thành công' 
          });
          toast.success('Duyệt form đăng ký thành công');
          fetchForms();
        } catch (error) {
          toast.error('Có lỗi xảy ra');
        }
      },
      condition: (form) => form.status === 'pending',
    },
    {
      key: 'reject',
      label: 'Từ chối',
      icon: XCircle,
      destructive: true,
      handler: async (form) => {
        const reason = prompt('Lý do từ chối:');
        if (reason) {
          try {
            await apiService.rejectAdminForm(form._id, { 
              adminNote: reason 
            });
            toast.success('Từ chối form đăng ký thành công');
            fetchForms();
          } catch (error) {
            toast.error('Có lỗi xảy ra');
          }
        }
      },
      condition: (form) => form.status === 'pending',
    },
    {
      key: 'delete',
      label: 'Xóa',
      icon: Trash2,
      destructive: true,
      handler: async (form) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa form đăng ký này?')) {
          try {
            await apiService.deleteAdminForm(form._id);
            toast.success('Xóa form đăng ký thành công');
            fetchForms();
          } catch (error) {
            toast.error('Có lỗi xảy ra');
          }
        }
      },
    },
  ];

  const fetchForms = async (page = 1, search = '', status = '') => {
    try {
      setLoading(true);
      const params = {
        page: page.toString(),
        limit: '20',
      };
      
      if (search) params.search = search;
      if (status) params.status = status;

      const response = await apiService.getAdminForms(params);
      setForms(response.data.data || []);
      setPagination(response.data.pagination || null);
    } catch (error) {
      console.error('Error fetching forms:', error);
      
      setForms([]);
      setPagination(null);
      
      if (error.response?.status === 404) {
        toast.error('API endpoint chưa được implement');
      } else {
        toast.error('Có lỗi khi tải danh sách form đăng ký');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;

      const response = await apiService.exportRegistrationFormsReport(params);
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `registration_forms_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Xuất file thành công');
    } catch (error) {
      console.error('Error exporting forms:', error);
      toast.error('Có lỗi khi xuất file');
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const handleSearch = (search) => {
    setSearchTerm(search);
    fetchForms(1, search, filterStatus);
  };

  const handleFilter = (status) => {
    setFilterStatus(status);
    fetchForms(1, searchTerm, status);
  };

  const handlePageChange = (page) => {
    fetchForms(page, searchTerm, filterStatus);
  };

  const filterOptions = {
    options: [
      { value: 'pending', label: 'Chờ duyệt' },
      { value: 'approved', label: 'Đã duyệt' },
      { value: 'rejected', label: 'Từ chối' },
    ],
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý form đăng ký"
        description="Duyệt và quản lý các form đăng ký tham gia cuộc thi"
      />

      <DataTable
        data={forms}
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

export default RegistrationsPage;