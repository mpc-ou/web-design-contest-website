import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, UserCheck, UserX, Clock, Mail, Phone, User, Calendar, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { apiService } from '../../../services/api';
import DetailCard from '../../../components/admin/ui/DetailCard';
import LoadingCard from '../../../components/admin/ui/LoadingCard';
import PageHeader from '../../../components/admin/ui/PageHeader';

const UserDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginHistory, setLoginHistory] = useState([]);

  useEffect(() => {
    fetchUserDetail();
    fetchLoginHistory();
  }, [id]);

  const fetchUserDetail = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAdminUser(id);
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user:', error);
      if (error.response?.status === 404) {
        toast.error('Không tìm thấy người dùng');
      } else {
        toast.error('Có lỗi khi tải thông tin người dùng');
      }
      // Don't navigate away immediately, let user see the error
      setTimeout(() => navigate('/admin/users'), 2000);
    } finally {
      setLoading(false);
    }
  };

  const fetchLoginHistory = async () => {
    try {
      const response = await apiService.getAdminUserLoginHistory(id);
      setLoginHistory(response.data.data || []);
    } catch (error) {
      console.error('Error fetching login history:', error);
      setLoginHistory([]);
    }
  };

  const handleToggleStatus = async () => {
    try {
      await apiService.updateAdminUser(id, { isActive: !user.isActive });
      toast.success(`${user.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'} người dùng thành công`);
      fetchUserDetail();
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      try {
        await apiService.deleteAdminUser(id);
        toast.success('Xóa người dùng thành công');
        navigate('/admin/users');
      } catch (error) {
        toast.error('Có lỗi xảy ra');
      }
    }
  };

  const pageActions = [
    {
      label: 'Quay lại',
      variant: 'outline',
      icon: ArrowLeft,
      onClick: () => navigate('/admin/users'),
    },
    {
      label: 'Chỉnh sửa',
      variant: 'default',
      icon: Edit,
      onClick: () => navigate(`/admin/users/${id}/edit`),
    },
    {
      label: user?.isActive ? 'Vô hiệu hóa' : 'Kích hoạt',
      variant: user?.isActive ? 'destructive' : 'default',
      icon: user?.isActive ? UserX : UserCheck,
      onClick: handleToggleStatus,
    },
    {
      label: 'Xóa',
      variant: 'destructive',
      icon: Trash2,
      onClick: handleDelete,
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingCard showHeader={true} />
        <LoadingCard />
        <LoadingCard />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Không tìm thấy người dùng"
          description="Người dùng bạn đang tìm kiếm không tồn tại."
          actions={[{
            label: 'Quay lại',
            variant: 'outline',
            icon: ArrowLeft,
            onClick: () => navigate('/admin/users'),
          }]}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={user.name || user.displayName || 'Người dùng'}
        description={`Thông tin chi tiết người dùng #${user._id}`}
        actions={pageActions}
        badge={{
          text: user.role === 'admin' ? 'Quản trị viên' : 'Người dùng',
          variant: user.role === 'admin' ? 'destructive' : 'default',
        }}
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Thông tin cơ bản */}
        <DetailCard
          title="Thông tin cơ bản"
          icon={User}
          badge={{
            text: user.isActive ? 'Hoạt động' : 'Không hoạt động',
            variant: user.isActive ? 'default' : 'secondary'
          }}
        >
          <div className="space-y-1">
            <DetailCard.Field label="Họ và tên" value={user.name || user.displayName} icon={User} />
            <DetailCard.Field label="Email" value={user.email} type="email" />
            <DetailCard.Field label="Số điện thoại" value={user.phone} type="phone" />
            <DetailCard.Field label="MSSV" value={user.studentId} />
            <DetailCard.Field label="Vai trò" value={user.role} type="badge" icon={Shield} />
            <DetailCard.Field label="Ngày tạo" value={user.createdAt} type="datetime" icon={Calendar} />
          </div>
        </DetailCard>

        {/* Thông tin bổ sung */}
        <DetailCard
          title="Thông tin bổ sung"
          icon={User}
        >
          <div className="space-y-1">
            <DetailCard.Field label="Facebook" value={user.facebookLink} type="url" />
            <DetailCard.Field label="Trường học" value={user.school} />
            <DetailCard.Field label="Khoa" value={user.department} />
            <DetailCard.Field label="Lớp" value={user.class} />
            <DetailCard.Field label="Trạng thái" value={user.isActive} type="boolean" />
            <DetailCard.Field label="Cập nhật lần cuối" value={user.updatedAt} type="datetime" />
          </div>
        </DetailCard>
      </div>

      {/* Lịch sử đăng nhập */}
      <DetailCard
        title="Lịch sử đăng nhập"
        description="10 lần đăng nhập gần nhất"
        icon={Clock}
      >
        {loginHistory.length > 0 ? (
          <div className="space-y-2">
            {loginHistory.slice(0, 10).map((login, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-border/40 last:border-0">
                <div className="space-y-1">
                  <div className="text-sm font-medium">
                    {new Date(login.loginTime).toLocaleString('vi-VN')}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    IP: {login.ipAddress} • {login.userAgent}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {login.success ? 'Thành công' : 'Thất bại'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            Chưa có lịch sử đăng nhập
          </div>
        )}
      </DetailCard>
    </div>
  );
};

export default UserDetailPage;