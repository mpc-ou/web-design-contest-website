import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Gamepad2, Users, Trophy, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { apiService } from '../../../services/api';
import DetailCard from '../../../components/admin/ui/DetailCard';
import LoadingCard from '../../../components/admin/ui/LoadingCard';
import PageHeader from '../../../components/admin/ui/PageHeader';

const MinigameDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [minigame, setMinigame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [winners, setWinners] = useState([]);

  useEffect(() => {
    fetchMinigameDetail();
    fetchWinners();
  }, [id]);

  const fetchMinigameDetail = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAdminMinigame(id);
      setMinigame(response.data);
    } catch (error) {
      console.error('Error fetching minigame:', error);
      toast.error('Có lỗi khi tải thông tin minigame');
      navigate('/admin/minigames');
    } finally {
      setLoading(false);
    }
  };

  const fetchWinners = async () => {
    try {
      const response = await apiService.getAdminMinigameWinners(id);
      setWinners(response.data.data || []);
    } catch (error) {
      console.error('Error fetching winners:', error);
      setWinners([]);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa minigame này?')) {
      try {
        await apiService.deleteAdminMinigame(id);
        toast.success('Xóa minigame thành công');
        navigate('/admin/minigames');
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
      onClick: () => navigate('/admin/minigames'),
    },
    {
      label: 'Chỉnh sửa',
      variant: 'default',
      icon: Edit,
      onClick: () => navigate(`/admin/minigames/${id}/edit`),
    },
    {
      label: 'Quản lý người thắng',
      variant: 'outline',
      icon: Trophy,
      onClick: () => navigate(`/admin/minigames/${id}/winners`),
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

  if (!minigame) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Không tìm thấy minigame"
          description="Minigame bạn đang tìm kiếm không tồn tại."
          actions={[{
            label: 'Quay lại',
            variant: 'outline',
            icon: ArrowLeft,
            onClick: () => navigate('/admin/minigames'),
          }]}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={minigame.name}
        description={`Chi tiết minigame #${minigame._id}`}
        actions={pageActions}
        badge={{
          text: minigame.isActive ? 'Hoạt động' : 'Không hoạt động',
          variant: minigame.isActive ? 'default' : 'secondary',
        }}
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Thông tin minigame */}
        <DetailCard
          title="Thông tin minigame"
          icon={Gamepad2}
        >
          <div className="space-y-1">
            <DetailCard.Field label="Tên minigame" value={minigame.name} />
            <DetailCard.Field label="Mô tả" value={minigame.description} />
            <DetailCard.Field label="Loại game" value={minigame.type} type="badge" />
            <DetailCard.Field label="Trạng thái" value={minigame.isActive} type="boolean" />
            <DetailCard.Field label="Ngày tạo" value={minigame.createdAt} type="datetime" icon={Calendar} />
            <DetailCard.Field label="Cập nhật lần cuối" value={minigame.updatedAt} type="datetime" />
          </div>
        </DetailCard>

        {/* Cấu hình game */}
        <DetailCard
          title="Cấu hình game"
          icon={Gamepad2}
        >
          <div className="space-y-1">
            <DetailCard.Field label="Số lượng giải" value={minigame.prizeCount} />
            <DetailCard.Field label="Điều kiện tham gia" value={minigame.rules} />
            <DetailCard.Field label="Thời gian bắt đầu" value={minigame.startTime} type="datetime" />
            <DetailCard.Field label="Thời gian kết thúc" value={minigame.endTime} type="datetime" />
            <DetailCard.Field label="Tổng số người chơi" value={minigame.totalPlayers || 0} />
            <DetailCard.Field label="Số người thắng" value={winners.length} />
          </div>
        </DetailCard>
      </div>

      {/* Người thắng */}
      <DetailCard
        title="Người thắng"
        description={`${winners.length} người đã thắng`}
        icon={Trophy}
        actions={[
          {
            label: 'Xem tất cả',
            variant: 'outline',
            onClick: () => navigate(`/admin/minigames/${id}/winners`)
          }
        ]}
      >
        {winners.length > 0 ? (
          <div className="space-y-2">
            {winners.slice(0, 5).map((winner, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-border/40 last:border-0">
                <div className="space-y-1">
                  <div className="font-medium">{winner.user?.name || winner.userName}</div>
                  <div className="text-xs text-muted-foreground">
                    Email: {winner.user?.email} • {new Date(winner.wonAt).toLocaleString('vi-VN')}
                  </div>
                </div>
                <div className="text-xs">
                  <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-800">
                    Giải {index + 1}
                  </span>
                </div>
              </div>
            ))}
            {winners.length > 5 && (
              <div className="text-center text-sm text-muted-foreground pt-2">
                Và {winners.length - 5} người khác...
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            Chưa có người thắng nào
          </div>
        )}
      </DetailCard>
    </div>
  );
};

export default MinigameDetailPage;