import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Trophy, Calendar, Users, Play, Pause, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { apiService } from '../../../services/api';
import DetailCard from '../../../components/admin/ui/DetailCard';
import LoadingCard from '../../../components/admin/ui/LoadingCard';
import PageHeader from '../../../components/admin/ui/PageHeader';
import ImageGallery from '../../../components/common/ImageGallery';

const ContestDetailPage = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    fetchContestDetail();
    fetchParticipants();
  }, [code]);

  const fetchContestDetail = async () => {
    try {
      setLoading(true);
      console.log('Fetching contest with Code:', code);
      const response = await apiService.getAdminContest(code);
      console.log('Contest response:', response);
      setContest(response.data);
    } catch (error) {
      console.error('Error fetching contest:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      if (error.response?.status === 404) {
        toast.error('Không tìm thấy cuộc thi');
      } else if (error.response?.status === 500) {
        toast.error('Lỗi server khi tải cuộc thi');
      } else {
        toast.error('Có lỗi khi tải thông tin cuộc thi');
      }
      // Don't navigate away immediately, let user see the error
      setTimeout(() => navigate('/admin/contests'), 2000);
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipants = async () => {
    try {
      const response = await apiService.getAdminTeams({ contestCode: code, limit: 50 });
      setParticipants(response.data.data || []);
    } catch (error) {
      console.error('Error fetching participants:', error);
      setParticipants([]);
    }
  };

  const handleToggleStatus = async () => {
    try {
      await apiService.updateAdminContest(code, { isActive: !contest.isActive });
      toast.success(`${contest.isActive ? 'Tạm dừng' : 'Kích hoạt'} cuộc thi thành công`);
      fetchContestDetail();
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa cuộc thi này?')) {
      try {
        await apiService.deleteAdminContest(code);
        toast.success('Xóa cuộc thi thành công');
        navigate('/admin/contests');
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
      onClick: () => navigate('/admin/contests'),
    },
    {
      label: 'Chỉnh sửa',
      variant: 'default',
      icon: Edit,
      onClick: () => navigate(`/admin/contests/${code}/edit`),
    },
    {
      label: contest?.isActive ? 'Tạm dừng' : 'Kích hoạt',
      variant: contest?.isActive ? 'destructive' : 'default',
      icon: contest?.isActive ? Pause : Play,
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
        <div className="grid gap-6 md:grid-cols-2">
          <LoadingCard />
          <LoadingCard />
        </div>
        <LoadingCard />
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Không tìm thấy cuộc thi"
          description="Cuộc thi bạn đang tìm kiếm không tồn tại."
          actions={[{
            label: 'Quay lại',
            variant: 'outline',
            icon: ArrowLeft,
            onClick: () => navigate('/admin/contests'),
          }]}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={contest.name}
        description={`Thông tin chi tiết cuộc thi ${contest.code}`}
        actions={pageActions}
        badge={{
          text: contest.status,
          variant: contest.status === 'active' ? 'default' : 'secondary',
        }}
      />

      {/* Thông tin cơ bản - Full width để xử lý text dài */}
      <DetailCard
        title="Thông tin cơ bản"
        icon={Trophy}
        badge={{
          text: contest.isActive ? 'Hoạt động' : 'Không hoạt động',
          variant: contest.isActive ? 'default' : 'secondary'
        }}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <DetailCard.Field label="Tên cuộc thi" value={contest.name} />
            <DetailCard.Field label="Mã cuộc thi" value={contest.code} />
            <DetailCard.Field label="Danh mục" value={contest.category} type="badge" />
            <DetailCard.Field label="Trạng thái" value={contest.status} type="status" />
            <DetailCard.Field label="Ngày tạo" value={contest.createdAt} type="datetime" icon={Calendar} />
          </div>
          <div className="space-y-3">
            <DetailCard.Field 
              label="Mở đăng ký" 
              value={contest.timeline?.registrationStart} 
              type="datetime" 
            />
            <DetailCard.Field 
              label="Đóng đăng ký" 
              value={contest.timeline?.registrationEnd} 
              type="datetime" 
            />
            <DetailCard.Field 
              label="Bắt đầu cuộc thi" 
              value={contest.timeline?.contestStart} 
              type="datetime" 
            />
            <DetailCard.Field 
              label="Kết thúc cuộc thi" 
              value={contest.timeline?.contestEnd} 
              type="datetime" 
            />
          </div>
        </div>
        
        {/* Mô tả riêng biệt với giới hạn chiều ngang */}
        <div className="mt-6 pt-6 border-t">
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Mô tả</h4>
          <div className="max-w-4xl mx-auto">
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words text-center md:text-left">
              {contest.description || 'Không có mô tả'}
            </p>
          </div>
        </div>
      </DetailCard>

      {/* Rounds */}
      {contest.rounds && contest.rounds.length > 0 && (
        <DetailCard
          title="Các vòng thi"
          description={`${contest.rounds.length} vòng thi`}
          icon={Trophy}
        >
          <div className="space-y-4">
            {contest.rounds.map((round, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-base">{round.name}</h4>
                    {/* Mô tả vòng thi với giới hạn chiều ngang */}
                    <div className="mt-2 max-w-3xl">
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap break-words">
                        {round.description || 'Không có mô tả'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                    <span className="text-xs bg-muted px-2 py-1 rounded">
                      {round.type}
                    </span>
                    <span className="text-xs bg-muted px-2 py-1 rounded">
                      Thứ tự: {round.order}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Bắt đầu: </span>
                    <span className="font-medium">{new Date(round.startDate).toLocaleString('vi-VN')}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Kết thúc: </span>
                    <span className="font-medium">{new Date(round.endDate).toLocaleString('vi-VN')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DetailCard>
      )}

      {/* Divisions */}
      {contest.divisions && contest.divisions.length > 0 && (
        <DetailCard
          title="Bảng thi"
          description={`${contest.divisions.length} bảng thi`}
          icon={Users}
        >
          <div className="space-y-4">
            {contest.divisions.map((division, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-base">{division.name}</h4>
                    {/* Mô tả bảng thi với giới hạn chiều ngang */}
                    <div className="mt-2 max-w-3xl">
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap break-words">
                        {division.description || 'Không có mô tả'}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full flex-shrink-0 ${
                    division.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {division.isActive ? 'Hoạt động' : 'Không hoạt động'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Số đội tối đa: </span>
                    <span className="font-medium">{division.maxTeams || 'Không giới hạn'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Số thành viên tối đa: </span>
                    <span className="font-medium">{division.maxMembers || 'Không giới hạn'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DetailCard>
      )}

      {/* Image Gallery */}
      {contest.images && contest.images.length > 0 && (
        <DetailCard
          title="Hình ảnh cuộc thi"
          description={`${contest.images.length} hình ảnh`}
          icon={ImageIcon}
        >
          <ImageGallery 
            images={contest.images} 
            title={`Hình ảnh ${contest.name}`}
          />
        </DetailCard>
      )}

      {/* Thumbnail Preview */}
      {contest.thumbnail && (
        <DetailCard
          title="Thumbnail"
          description="Ảnh đại diện của cuộc thi"
          icon={ImageIcon}
        >
          <div className="aspect-video w-full max-w-md">
            <img
              src={contest.thumbnail}
              alt={`${contest.name} thumbnail`}
              className="w-full h-full object-cover rounded-lg border"
              onError={(e) => {
                e.target.src = '/img/placeholder-image.jpg';
              }}
            />
          </div>
        </DetailCard>
      )}

      {/* Participants */}
      <DetailCard
        title="Đội tham gia"
        description={`${participants.length} đội đã đăng ký`}
        icon={Users}
        actions={[
          {
            label: 'Xem tất cả',
            variant: 'outline',
            onClick: () => navigate(`/admin/teams?contestCode=${code}`)
          }
        ]}
      >
        {participants.length > 0 ? (
          <div className="space-y-2">
            {participants.slice(0, 5).map((team, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-border/40 last:border-0">
                <div className="space-y-1">
                  <div className="font-medium">{team.teamName}</div>
                  <div className="text-xs text-muted-foreground">
                    Trưởng nhóm: {team.leaderName} • {team.members?.length + 1 || 1} thành viên
                  </div>
                </div>
                <div className="text-xs">
                  <span className={`px-2 py-1 rounded ${
                    team.status === 'approved' ? 'bg-green-100 text-green-800' :
                    team.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {team.status}
                  </span>
                </div>
              </div>
            ))}
            {participants.length > 5 && (
              <div className="text-center text-sm text-muted-foreground pt-2">
                Và {participants.length - 5} đội khác...
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            Chưa có đội nào đăng ký
          </div>
        )}
      </DetailCard>
    </div>
  );
};

export default ContestDetailPage;