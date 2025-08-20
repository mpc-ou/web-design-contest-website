import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Users, Trophy, Calendar, CheckCircle, XCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { apiService } from '../../../services/api';
import DetailCard from '../../../components/admin/ui/DetailCard';
import LoadingCard from '../../../components/admin/ui/LoadingCard';
import PageHeader from '../../../components/admin/ui/PageHeader';

const TeamDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    fetchTeamDetail();
    fetchSubmissions();
  }, [id]);

  const fetchTeamDetail = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAdminTeam(id);
      setTeam(response.data);
    } catch (error) {
      console.error('Error fetching team:', error);
      if (error.response?.status === 404) {
        toast.error('Không tìm thấy đội thi');
      } else {
        toast.error('Có lỗi khi tải thông tin đội thi');
      }
      // Don't navigate away immediately, let user see the error
      setTimeout(() => navigate('/admin/teams'), 2000);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const response = await apiService.getAdminSubmissionsByTeam(id);
      setSubmissions(response.data.data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setSubmissions([]);
    }
  };

  const handleApprove = async () => {
    if (window.confirm('Bạn có chắc chắn muốn duyệt đội thi này?')) {
      try {
        await apiService.approveAdminForm(team.formRegisterId || id);
        toast.success('Duyệt đội thi thành công');
        fetchTeamDetail();
      } catch (error) {
        toast.error('Có lỗi xảy ra');
      }
    }
  };

  const handleReject = async () => {
    const reason = prompt('Lý do từ chối:');
    if (reason) {
      try {
        await apiService.rejectAdminForm(team.formRegisterId || id, { adminNote: reason });
        toast.success('Từ chối đội thi thành công');
        fetchTeamDetail();
      } catch (error) {
        toast.error('Có lỗi xảy ra');
      }
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đội thi này?')) {
      try {
        await apiService.deleteAdminTeam(id);
        toast.success('Xóa đội thi thành công');
        navigate('/admin/teams');
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
      onClick: () => navigate('/admin/teams'),
    },
    {
      label: 'Chỉnh sửa',
      variant: 'default',
      icon: Edit,
      onClick: () => navigate(`/admin/teams/${id}/edit`),
    },
  ];

  if (team?.status === 'pending' || team?.status === 'registered') {
    pageActions.push(
      {
        label: 'Duyệt đội',
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

  pageActions.push({
    label: 'Xóa',
    variant: 'destructive',
    icon: Trash2,
    onClick: handleDelete,
  });

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

  if (!team) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Không tìm thấy đội thi"
          description="Đội thi bạn đang tìm kiếm không tồn tại."
          actions={[{
            label: 'Quay lại',
            variant: 'outline',
            icon: ArrowLeft,
            onClick: () => navigate('/admin/teams'),
          }]}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={team.teamName}
        description={`Thông tin chi tiết đội thi #${team._id}`}
        actions={pageActions}
        badge={{
          text: team.status === 'pending' ? 'Chờ duyệt' : 
                team.status === 'approved' ? 'Đã duyệt' : 
                team.status === 'registered' ? 'Đã đăng ký' :
                team.status === 'rejected' ? 'Từ chối' : team.status,
          variant: team.status === 'pending' ? 'secondary' : 
                   team.status === 'approved' || team.status === 'registered' ? 'default' : 'destructive',
        }}
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Thông tin đội thi */}
        <DetailCard
          title="Thông tin đội thi"
          icon={Users}
        >
          <div className="space-y-1">
            <DetailCard.Field label="Tên đội" value={team.teamName} />
            <DetailCard.Field label="Cuộc thi" value={team.contest?.name} />
            <DetailCard.Field label="Mã cuộc thi" value={team.contest?.code} />
            <DetailCard.Field label="Bảng thi" value={team.division} type="badge" />
            <DetailCard.Field label="Số thành viên" value={team.members?.length || 0} />
            <DetailCard.Field label="Trạng thái" value={team.status} type="status" />
            <DetailCard.Field label="Giải thưởng" value={team.prize || 'Chưa có'} />
            <DetailCard.Field label="Ngày đăng ký" value={team.registeredAt} type="datetime" icon={Calendar} />
            <DetailCard.Field label="Form ID" value={team.formRegisterId} />
          </div>
        </DetailCard>

        {/* Thông tin trưởng nhóm */}
        <DetailCard
          title="Thông tin trưởng nhóm"
          icon={Users}
        >
          {(() => {
            const leader = team.members?.find(member => member.uid === team.registeredBy);
            return (
              <div className="space-y-1">
                <DetailCard.Field 
                  label="Họ và tên" 
                  value={leader ? `${leader.firstName} ${leader.lastName}` : 'Không xác định'} 
                />
                <DetailCard.Field 
                  label="Email" 
                  value={leader?.email || 'Không có'} 
                  type="email" 
                />
                <DetailCard.Field 
                  label="Số điện thoại" 
                  value={leader?.phone !== 'No phone' ? leader?.phone : 'Không có'} 
                  type="phone" 
                />
                <DetailCard.Field 
                  label="UID" 
                  value={leader?.uid || team.registeredBy} 
                />
                <DetailCard.Field 
                  label="Facebook" 
                  value={team.facebookLink || 'Không có'} 
                  type="url" 
                />
              </div>
            );
          })()}
        </DetailCard>
      </div>

      {/* Thành viên */}
      {team.members && team.members.length > 0 && (
        <DetailCard
          title="Tất cả thành viên"
          description={`${team.members.length} thành viên trong đội`}
          icon={Users}
        >
          <div className="space-y-3">
            {team.members.map((member, index) => {
              const isLeader = member.uid === team.registeredBy;
              return (
                <div key={member.uid || index} className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">
                      {member.firstName} {member.lastName}
                      {isLeader && (
                        <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                          Trưởng nhóm
                        </span>
                      )}
                    </h4>
                    <span className="text-xs text-muted-foreground">
                      Thành viên {index + 1}
                    </span>
                  </div>
                  <div className="grid gap-2 md:grid-cols-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Email: </span>
                      <a href={`mailto:${member.email}`} className="text-primary hover:underline">
                        {member.email}
                      </a>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Điện thoại: </span>
                      <span className="font-medium">
                        {member.phone !== 'No phone' ? member.phone : 'Không có'}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">UID: </span>
                      <span className="font-medium font-mono text-xs">{member.uid}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Loại tài khoản: </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        member.uid.startsWith('temp_') 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {member.uid.startsWith('temp_') ? 'Tạm thời' : 'Chính thức'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </DetailCard>
      )}

      {/* Bài nộp */}
      <DetailCard
        title="Bài nộp"
        description={`${submissions.length} bài đã nộp`}
        icon={FileText}
        actions={[
          {
            label: 'Xem tất cả',
            variant: 'outline',
            onClick: () => navigate(`/admin/submissions?teamId=${id}`)
          }
        ]}
      >
        {submissions.length > 0 ? (
          <div className="space-y-3">
            {submissions.map((submission, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{submission.round}</h4>
                    <p className="text-sm text-muted-foreground">{submission.description}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(submission.submittedAt).toLocaleString('vi-VN')}
                  </div>
                </div>
                {submission.githubLink && (
                  <div className="text-sm">
                    <a 
                      href={submission.githubLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center"
                    >
                      <Trophy className="h-4 w-4 mr-1" />
                      Xem GitHub
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            Chưa có bài nộp nào
          </div>
        )}
      </DetailCard>

      {/* Thông tin xử lý */}
      <DetailCard
        title="Thông tin hệ thống"
        icon={FileText}
      >
        <div className="space-y-1">
          <DetailCard.Field label="ID đội" value={team._id} />
          <DetailCard.Field label="Trạng thái" value={team.status} type="status" />
          <DetailCard.Field label="Hoạt động" value={team.isActive ? 'Có' : 'Không'} type="badge" />
          <DetailCard.Field label="Form đăng ký" value={team.formRegisterId} />
          <DetailCard.Field label="Người đăng ký" value={team.registeredBy} />
          <DetailCard.Field label="Ngày đăng ký" value={team.registeredAt} type="datetime" />
          <DetailCard.Field label="Cập nhật lần cuối" value={team.updatedAt} type="datetime" />
          <DetailCard.Field label="Version" value={team.__v} />
        </div>
      </DetailCard>
    </div>
  );
};

export default TeamDetailPage;