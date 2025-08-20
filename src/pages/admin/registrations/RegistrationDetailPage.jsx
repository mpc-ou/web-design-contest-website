import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, User, Mail, Phone, Users, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { apiService } from '../../../services/api';
import DetailCard from '../../../components/admin/ui/DetailCard';
import LoadingCard from '../../../components/admin/ui/LoadingCard';
import PageHeader from '../../../components/admin/ui/PageHeader';

const RegistrationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFormDetail();
  }, [id]);

  const fetchFormDetail = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAdminForm(id);
      setForm(response.data);
    } catch (error) {
      console.error('Error fetching form:', error);
      toast.error('Có lỗi khi tải thông tin form đăng ký');
      navigate('/admin/registrations');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (window.confirm('Bạn có chắc chắn muốn duyệt form đăng ký này?')) {
      try {
        await apiService.approveAdminForm(id, { 
          adminNote: 'Form hợp lệ, tạo team thành công' 
        });
        toast.success('Duyệt form đăng ký thành công');
        fetchFormDetail();
      } catch (error) {
        toast.error('Có lỗi xảy ra');
      }
    }
  };

  const handleReject = async () => {
    const reason = prompt('Lý do từ chối:');
    if (reason) {
      try {
        await apiService.rejectAdminForm(id, { 
          adminNote: reason 
        });
        toast.success('Từ chối form đăng ký thành công');
        fetchFormDetail();
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
      onClick: () => navigate('/admin/registrations'),
    },
  ];

  if (form?.status === 'pending') {
    pageActions.push(
      {
        label: 'Duyệt form',
        variant: 'default',
        icon: CheckCircle,
        onClick: handleApprove,
      },
      {
        label: 'Từ chối',
        variant: 'destructive',
        icon: XCircle,
        onClick: handleReject,
      }
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingCard showHeader={true} />
        <div className="grid gap-6 md:grid-cols-2">
          <LoadingCard />
          <LoadingCard />
        </div>
        <LoadingCard />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Không tìm thấy form đăng ký"
          description="Form đăng ký bạn đang tìm kiếm không tồn tại."
          actions={[{
            label: 'Quay lại',
            variant: 'outline',
            icon: ArrowLeft,
            onClick: () => navigate('/admin/registrations'),
          }]}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Form đăng ký - ${form.teamName}`}
        description={`Chi tiết form đăng ký #${form._id}`}
        actions={pageActions}
        badge={{
          text: form.status === 'pending' ? 'Chờ duyệt' : 
                form.status === 'approved' ? 'Đã duyệt' : 'Từ chối',
          variant: form.status === 'pending' ? 'secondary' : 
                   form.status === 'approved' ? 'default' : 'destructive',
        }}
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Thông tin trưởng nhóm */}
        <DetailCard
          title="Thông tin trưởng nhóm"
          icon={User}
        >
          <div className="space-y-1">
            <DetailCard.Field label="Họ và tên" value={form.leaderName} icon={User} />
            <DetailCard.Field label="Email" value={form.email} type="email" />
            <DetailCard.Field label="Số điện thoại" value={form.phone} type="phone" />
            <DetailCard.Field label="MSSV" value={form.studentId} />
            <DetailCard.Field label="Facebook" value={form.facebookLink} type="url" />
          </div>
        </DetailCard>

        {/* Thông tin đội thi */}
        <DetailCard
          title="Thông tin đội thi"
          icon={Users}
        >
          <div className="space-y-1">
            <DetailCard.Field label="Tên đội" value={form.teamName} />
            <DetailCard.Field label="Cuộc thi" value={form.contestId?.name} />
            <DetailCard.Field label="Mã cuộc thi" value={form.contestId?.code} />
            <DetailCard.Field label="Bảng thi" value={form.division} type="badge" />
            <DetailCard.Field label="Số thành viên" value={form.members?.length + 1 || 1} />
            <DetailCard.Field label="Ngày đăng ký" value={form.createdAt} type="datetime" />
          </div>
        </DetailCard>
      </div>

      {/* Thành viên */}
      {form.members && form.members.length > 0 && (
        <DetailCard
          title="Thành viên"
          description={`${form.members.length} thành viên trong đội`}
          icon={Users}
        >
          <div className="space-y-3">
            {form.members.map((member, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-2">
                <h4 className="font-medium">Thành viên {index + 1}</h4>
                <div className="grid gap-2 md:grid-cols-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Họ và tên: </span>
                    <span className="font-medium">{member.fullName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">MSSV: </span>
                    <span className="font-medium">{member.studentId}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email: </span>
                    <a href={`mailto:${member.email}`} className="text-primary hover:underline">
                      {member.email}
                    </a>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Facebook: </span>
                    {member.facebookLink ? (
                      <a 
                        href={member.facebookLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Xem profile
                      </a>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DetailCard>
      )}

      {/* Thông tin xử lý */}
      <DetailCard
        title="Thông tin xử lý"
        icon={FileText}
      >
        <div className="space-y-1">
          <DetailCard.Field label="Trạng thái" value={form.status} type="status" />
          <DetailCard.Field label="Ghi chú admin" value={form.adminNote} />
          <DetailCard.Field label="Ngày xử lý" value={form.processedAt} type="datetime" />
          <DetailCard.Field label="Người xử lý" value={form.processedBy?.name || form.processedBy} />
          <DetailCard.Field label="Ngày tạo" value={form.createdAt} type="datetime" />
          <DetailCard.Field label="Cập nhật lần cuối" value={form.updatedAt} type="datetime" />
        </div>
      </DetailCard>
    </div>
  );
};

export default RegistrationDetailPage;