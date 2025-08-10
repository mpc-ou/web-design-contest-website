import { useEffect, useState } from 'react';
import { Plus, Download, Eye, Edit, Trash2, UserCheck, UserX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/admin/ui/PageHeader';
import DataTable from '../../components/admin/ui/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { apiService } from '../../services/api';

const UsersPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  const columns = [
    {
      key: 'fullName',
      title: 'Họ và tên',
      type: 'custom',
      render: (value, row) => {
        return (
          <p className='font-medium'>{row.fullName}</p>
        );
      },
    },
    {
      key: 'email',
      title: 'Email',
    },
    {
      key: 'phone',
      title: 'Số điện thoại',
    },
    {
      key: 'studentId',
      title: 'MSSV',
    },
    {
      key: 'role',
      title: 'Vai trò',
      type: 'badge',
      badgeVariant: (value) => {
        switch (value) {
          case 'admin':
            return 'destructive';
          case 'user':
            return 'default';
          default:
            return 'secondary';
        }
      },
      badgeText: (value) => {
        switch (value) {
          case 'admin':
            return 'Quản trị viên';
          case 'user':
            return 'Người dùng';
          default:
            return value;
        }
      },
    },
    {
      key: 'createdAt',
      title: 'Ngày tạo',
      type: 'date',
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
      handler: (user) => {
        // Navigate to user detail page
        navigate(`/admin/users/${user._id}`);
      },
    },
    {
      key: 'edit',
      label: 'Chỉnh sửa',
      icon: Edit,
      handler: (user) => {
        // Navigate to edit user page
        navigate(`/admin/users/${user._id}/edit`);
      },
    },
    {
      key: 'toggle-status',
      label: (user) => user.isActive ? 'Vô hiệu hóa' : 'Kích hoạt',
      icon: (user) => user.isActive ? UserX : UserCheck,
      handler: async (user) => {
        try {
          await apiService.patch(`/api/admin/users/${user._id}`, { isActive: !user.isActive });
          toast.success(`${user.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'} người dùng thành công`);
          fetchUsers();
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
      handler: async (user) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
          try {
            await apiService.deleteAdminUser(user._id);
            toast.success('Xóa người dùng thành công');
            fetchUsers();
          } catch (error) {
            toast.error('Có lỗi xảy ra');
          }
        }
      },
    },
  ];

  const fetchUsers = async (page = 1, search = '', role = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });
      
      if (search) params.append('search', search);
      if (role) params.append('role', role);

      const response = await apiService.getAdminUsers(Object.fromEntries(params));
      setUsers(response.data.data || []);
      setPagination(response.data.pagination || null);
    } catch (error) {
      console.error('Error fetching users:', error);
      
      // Set empty data for development
      setUsers([]);
      setPagination(null);
      
      if (error.response?.status === 404) {
        toast.error('API endpoint chưa được implement');
      } else {
        toast.error('Có lỗi khi tải danh sách người dùng');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await apiService.exportUsersReport();
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `users_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Xuất file thành công');
    } catch (error) {
      console.error('Error exporting users:', error);
      toast.error('Có lỗi khi xuất file');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = (search) => {
    setSearchTerm(search);
    fetchUsers(1, search, filterRole);
  };

  const handleFilter = (role) => {
    setFilterRole(role);
    fetchUsers(1, searchTerm, role);
  };

  const handlePageChange = (page) => {
    fetchUsers(page, searchTerm, filterRole);
  };

  const pageActions = [];

  const filterOptions = {
    options: [
      { value: 'admin', label: 'Quản trị viên' },
      { value: 'user', label: 'Người dùng' },
    ],
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý người dùng"
        description="Quản lý thông tin và quyền hạn người dùng trong hệ thống"
        actions={pageActions}
      />

      <DataTable
        data={users}
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

export default UsersPage;