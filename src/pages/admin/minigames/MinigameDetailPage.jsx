import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Gamepad2, Users, Trophy, Calendar, Shuffle, Play, CheckCircle2, XCircle } from 'lucide-react';
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
  const [selectedNumbers, setSelectedNumbers] = useState({ totalSelected: 0, numbers: [], maxNumber: 0 });
  const [drawing, setDrawing] = useState(false);
  const [previewWinner, setPreviewWinner] = useState(null);

  useEffect(() => {
    fetchMinigameDetail();
    fetchWinners();
    fetchSelectedNumbers();
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
      const response = await apiService.getAdminLuckyWinners(id);
      setWinners(response.data.winners || response.data.data || []);
    } catch (error) {
      console.error('Error fetching winners:', error);
      setWinners([]);
    }
  };

  const fetchSelectedNumbers = async () => {
    try {
      const response = await apiService.getSelectedNumbers(id);
      setSelectedNumbers(response.data || { totalSelected: 0, numbers: [], maxNumber: 0 });
    } catch (error) {
      setSelectedNumbers({ totalSelected: 0, numbers: [], maxNumber: 0 });
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

  const handlePreviewDraw = async () => {
    try {
      setDrawing(true);
      const res = await apiService.drawAdminLucky(id, false);
      setPreviewWinner(res.data.potentialWinner || null);
      if (!res.data.potentialWinner) {
        toast.error(res.data.error || 'Không thể chọn người thắng');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Không thể quay thử');
    } finally {
      setDrawing(false);
    }
  };

  const handleConfirmDraw = async () => {
    try {
      setDrawing(true);
      const res = await apiService.drawAdminLucky(id, true);
      const winner = res.data.winner || null;
      if (winner) {
        toast.success('Đã xác nhận người thắng');
        setPreviewWinner(null);
        fetchWinners();
      } else {
        toast.error(res.data.error || 'Không thể xác nhận');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Không thể xác nhận');
    } finally {
      setDrawing(false);
    }
  };

  const handleResetWinners = async () => {
    if (!window.confirm('Xóa toàn bộ kết quả trúng thưởng?')) return;
    try {
      await apiService.resetAdminLuckyWinners(id);
      toast.success('Đã reset kết quả');
      setPreviewWinner(null);
      fetchWinners();
    } catch (error) {
      toast.error('Không thể reset');
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

  const renderNumberGrid = () => {
    const max = selectedNumbers.maxNumber || minigame.maxNumber || 0;
    const showCount = Math.min(max, 100);
    const numbers = Array.from({ length: showCount }, (_, i) => i + 1);
    const takenSet = new Set(selectedNumbers.numbers || []);

    return (
      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">
          Đã chọn: {selectedNumbers.totalSelected}/{max}
        </div>
        <div className="grid grid-cols-10 gap-1 max-h-56 overflow-y-auto">
          {numbers.map((n) => (
            <div
              key={n}
              className={`w-6 h-6 text-xs flex items-center justify-center rounded border ${
                takenSet.has(n)
                  ? 'bg-red-500 text-white border-red-600'
                  : 'bg-gray-50 text-gray-700 border-gray-300'
              }`}
              title={takenSet.has(n) ? `Số ${n} đã được chọn` : `Số ${n} còn trống`}
            >
              {n}
            </div>
          ))}
        </div>
        {max > showCount && (
          <div className="text-xs text-muted-foreground">Hiển thị {showCount} số đầu tiên / {max}</div>
        )}
        <div className="pt-2">
          <Button variant="outline" size="sm" onClick={fetchSelectedNumbers}>
            Tải lại bảng số
          </Button>
        </div>
      </div>
    );
  };

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

        {/* Cấu hình & quay số */}
        <DetailCard
          title="Quay số & Kết quả"
          icon={Trophy}
          actions={[
            { label: 'Quay thử', variant: 'outline', onClick: handlePreviewDraw, icon: Shuffle, disabled: drawing },
            { label: 'Xác nhận', variant: 'default', onClick: handleConfirmDraw, icon: Play, disabled: drawing },
            { label: 'Reset kết quả', variant: 'destructive', onClick: handleResetWinners }
          ]}
        >
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">Số người thắng hiện tại: {winners.length} / {minigame.maxWinners}</div>
            {previewWinner ? (
              <div className="p-3 rounded-lg border bg-green-50">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">Người thắng (dự kiến)</div>
                    <div className="font-medium">{previewWinner.user?.firstName} {previewWinner.user?.lastName}</div>
                    <div className="text-xs text-muted-foreground">Số may mắn: <b>{previewWinner.number}</b></div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="default" onClick={handleConfirmDraw} disabled={drawing}>
                      <CheckCircle2 className="h-4 w-4 mr-1" /> Xác nhận
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setPreviewWinner(null)} disabled={drawing}>
                      <XCircle className="h-4 w-4 mr-1" /> Bỏ
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Nhấn "Quay thử" để chọn ngẫu nhiên 1 người thắng.</div>
            )}
          </div>
        </DetailCard>
      </div>

      {/* Bảng số đã chọn */}
      <DetailCard
        title="Bảng số đã được chọn"
        description="Hiển thị nhanh các số đã có người chọn"
        icon={Users}
      >
        {renderNumberGrid()}
      </DetailCard>

      {/* Người thắng */}
      <DetailCard
        title="Người thắng"
        description={`${winners.length} người đã thắng`}
        icon={Trophy}
      >
        {winners.length > 0 ? (
          <div className="space-y-2">
            {winners.slice(0, 8).map((winner, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-border/40 last:border-0">
                <div className="space-y-1">
                  <div className="font-medium">{winner.user?.firstName} {winner.user?.lastName}</div>
                  <div className="text-xs text-muted-foreground">
                    Email: {winner.user?.email} • {winner.drawnAt ? new Date(winner.drawnAt).toLocaleString('vi-VN') : ''}
                  </div>
                </div>
                <div className="text-xs">
                  <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-800">
                    Số: {winner.number}
                  </span>
                </div>
              </div>
            ))}
            {winners.length > 8 && (
              <div className="text-center text-sm text-muted-foreground pt-2">
                Và {winners.length - 8} người khác...
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