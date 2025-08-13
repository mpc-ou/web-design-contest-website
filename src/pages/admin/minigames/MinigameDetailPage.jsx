import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Edit, Trash2, Gamepad2, Users, Trophy, Calendar, 
  Shuffle, Play, CheckCircle2, XCircle, RefreshCw, Award,
  Clock, Target, TrendingUp, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
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
  const [tickets, setTickets] = useState([]);
  const [selectedNumbers, setSelectedNumbers] = useState({ totalSelected: 0, numbers: [], maxNumber: 0 });
  const [drawing, setDrawing] = useState(false);
  const [previewWinner, setPreviewWinner] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, [id]);

  const fetchAllData = async () => {
    await Promise.all([
      fetchMinigameDetail(),
      fetchWinners(),
      fetchSelectedNumbers(),
      fetchTickets()
    ]);
  };

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
      setWinners(response.data.winners || response.data || []);
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

  const fetchTickets = async () => {
    try {
      const response = await apiService.getAdminLuckyByMinigame(id);
      setTickets(response.data.tickets || response.data || []);
    } catch (error) {
      setTickets([]);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa minigame này? Hành động này không thể hoàn tác.')) {
      try {
        await apiService.deleteAdminMinigame(id);
        toast.success('Xóa minigame thành công');
        navigate('/admin/minigames');
      } catch (error) {
        toast.error('Có lỗi xảy ra khi xóa minigame');
      }
    }
  };

  const handlePreviewDraw = async () => {
    try {
      setDrawing(true);
      const response = await apiService.drawAdminLucky(id, false);
      if (response.data.potentialWinner) {
        setPreviewWinner(response.data.potentialWinner);
        toast.success('Đã quay số thử thành công!');
      } else {
        toast.info('Không có vé nào để quay số');
      }
    } catch (error) {
      toast.error('Có lỗi khi quay số thử');
    } finally {
      setDrawing(false);
    }
  };

  const handleConfirmDraw = async () => {
    if (!previewWinner) {
      toast.error('Vui lòng quay số thử trước');
      return;
    }

    if (window.confirm(`Xác nhận quay số cho ${previewWinner.user?.firstName} ${previewWinner.user?.lastName} với số ${previewWinner.number}?`)) {
      try {
        setDrawing(true);
        await apiService.drawAdminLucky(id, true);
        toast.success('Quay số thành công!');
        setPreviewWinner(null);
        await fetchAllData();
      } catch (error) {
        toast.error('Có lỗi khi xác nhận quay số');
      } finally {
        setDrawing(false);
      }
    }
  };

  const handleResetWinners = async () => {
    if (window.confirm('Bạn có chắc chắn muốn reset tất cả kết quả? Hành động này không thể hoàn tác.')) {
      try {
        await apiService.resetAdminLuckyWinners(id);
        toast.success('Reset kết quả thành công');
        await fetchAllData();
      } catch (error) {
        toast.error('Có lỗi khi reset kết quả');
      }
    }
  };

  const getMinigameStatus = () => {
    if (!minigame) return { text: 'Unknown', variant: 'secondary' };
    
    const now = new Date();
    const startTime = new Date(minigame.startTime);
    const endTime = new Date(minigame.endTime);

    if (minigame.isClosed) {
      return { text: 'Đã đóng', variant: 'destructive' };
    }
    if (!minigame.isActive) {
      return { text: 'Không hoạt động', variant: 'secondary' };
    }
    if (now < startTime) {
      return { text: 'Sắp diễn ra', variant: 'outline' };
    }
    if (now > endTime) {
      return { text: 'Đã kết thúc', variant: 'secondary' };
    }
    return { text: 'Đang diễn ra', variant: 'default' };
  };

  const getParticipationRate = () => {
    if (!minigame?.maxNumber) return 0;
    return Math.round((selectedNumbers.totalSelected / minigame.maxNumber) * 100);
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

  const renderNumberGrid = () => {
    const max = selectedNumbers.maxNumber || minigame?.maxNumber || 0;
    const showCount = Math.min(max, 100);
    const numbers = Array.from({ length: showCount }, (_, i) => i + 1);
    const takenSet = new Set(selectedNumbers.numbers || []);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Đã chọn: <span className="font-medium text-primary">{selectedNumbers.totalSelected}</span>/{max}
          </div>
          <Button variant="outline" size="sm" onClick={fetchSelectedNumbers} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Tải lại
          </Button>
        </div>
        
        <Progress value={getParticipationRate()} className="h-2" />
        
        <div className="grid grid-cols-10 gap-1 max-h-64 overflow-y-auto p-2 border rounded-lg bg-muted/20">
          {numbers.map((n) => (
            <div
              key={n}
              className={`aspect-square text-xs flex items-center justify-center rounded border font-medium transition-colors ${
                takenSet.has(n)
                  ? 'bg-red-500 text-white border-red-600 shadow-sm'
                  : 'bg-background text-muted-foreground border-border hover:bg-muted/50'
              }`}
              title={takenSet.has(n) ? `Số ${n} đã được chọn` : `Số ${n} còn trống`}
            >
              {n}
            </div>
          ))}
        </div>
        
        {max > showCount && (
          <div className="text-xs text-muted-foreground text-center">
            Hiển thị {showCount} số đầu tiên trên tổng {max} số
          </div>
        )}

        <div className="flex gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Đã chọn</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-background border rounded"></div>
            <span>Còn trống</span>
          </div>
        </div>
      </div>
    );
  };

  const renderPrizes = () => {
    if (!minigame?.prizes || minigame.prizes.length === 0) {
      return <div className="text-sm text-muted-foreground">Chưa cấu hình giải thưởng</div>;
    }

    return (
      <div className="space-y-2">
        {minigame.prizes.map((prize, index) => (
          <div key={index} className="flex items-center justify-between p-2 border rounded-lg">
            <div className="flex-1">
              <div className="font-medium text-sm">{prize.name}</div>
              {prize.description && (
                <div className="text-xs text-muted-foreground">{prize.description}</div>
              )}
            </div>
            <div className="text-right">
              <Badge variant="outline" className="text-xs">
                {prize.amount} giải
              </Badge>
              <div className="text-xs text-muted-foreground capitalize">{prize.type}</div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingCard showHeader={true} />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <LoadingCard />
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
          description="Minigame bạn đang tìm kiếm không tồn tại hoặc đã bị xóa."
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

  const status = getMinigameStatus();

  return (
    <div className="space-y-6">
      <PageHeader
        title={minigame.name}
        description={`Chi tiết minigame • ${minigame.description || 'Không có mô tả'}`}
        actions={pageActions}
        badge={{
          text: status.text,
          variant: status.variant,
        }}
      />

      {/* Thống kê tổng quan */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng số vé</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{minigame.maxNumber}</div>
            <p className="text-xs text-muted-foreground">Số vé tối đa</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã tham gia</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{selectedNumbers.totalSelected}</div>
            <p className="text-xs text-muted-foreground">
              {getParticipationRate()}% tỷ lệ tham gia
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Người thắng</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{winners.length}</div>
            <p className="text-xs text-muted-foreground">
              / {minigame.maxWinners} tối đa
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Thời gian còn lại</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">
              {status.text === 'Đang diễn ra' ? (
                <div className="text-green-600">Đang hoạt động</div>
              ) : status.text === 'Sắp diễn ra' ? (
                <div className="text-blue-600">Chưa bắt đầu</div>
              ) : (
                <div className="text-gray-600">Đã kết thúc</div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date(minigame.endTime).toLocaleDateString('vi-VN')}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Thông tin cơ bản */}
        <div className="lg:col-span-2 space-y-6">
          <DetailCard title="Thông tin cơ bản" icon={Gamepad2}>
            <div className="space-y-3">
              <DetailCard.Field label="Tên minigame" value={minigame.name} />
              <DetailCard.Field label="Mô tả" value={minigame.description || 'Không có mô tả'} />
              <DetailCard.Field 
                label="Cuộc thi" 
                value={minigame.contest?.name || 'Không xác định'} 
              />
              <DetailCard.Field 
                label="Thời gian bắt đầu" 
                value={minigame.startTime} 
                type="datetime" 
              />
              <DetailCard.Field 
                label="Thời gian kết thúc" 
                value={minigame.endTime} 
                type="datetime" 
              />
              <DetailCard.Field 
                label="Trạng thái hoạt động" 
                value={minigame.isActive} 
                type="boolean" 
              />
              <DetailCard.Field 
                label="Đã đóng sớm" 
                value={minigame.isClosed} 
                type="boolean" 
              />
            </div>
          </DetailCard>

          {/* Bảng số */}
          <DetailCard title="Bảng số" icon={TrendingUp}>
            {renderNumberGrid()}
          </DetailCard>

          {/* Giải thưởng */}
          <DetailCard title="Giải thưởng" icon={Award}>
            {renderPrizes()}
          </DetailCard>
        </div>

        {/* Quay số và kết quả */}
        <div className="space-y-6">
          <DetailCard
            title="Quay số"
            icon={Shuffle}
            actions={[
              { 
                label: 'Quay thử', 
                variant: 'outline', 
                onClick: handlePreviewDraw, 
                icon: Shuffle, 
                disabled: drawing || status.text === 'Sắp diễn ra'
              },
              { 
                label: 'Reset kết quả', 
                variant: 'destructive', 
                onClick: handleResetWinners,
                disabled: winners.length === 0
              }
            ]}
          >
            <div className="space-y-4">
              {status.text === 'Sắp diễn ra' && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Minigame chưa bắt đầu. Không thể quay số.
                  </AlertDescription>
                </Alert>
              )}

              <div className="text-sm">
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Người thắng hiện tại:</span>
                  <span className="font-medium">{winners.length} / {minigame.maxWinners}</span>
                </div>
                <Progress 
                  value={(winners.length / minigame.maxWinners) * 100} 
                  className="h-2"
                />
              </div>

              {previewWinner && (
                <div className="p-3 rounded-lg border bg-green-50 dark:bg-green-950/20">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-green-800 dark:text-green-200">
                      🎉 Kết quả quay thử
                    </div>
                    <div className="text-sm">
                      <div><strong>Người thắng:</strong> {previewWinner.user?.firstName} {previewWinner.user?.lastName}</div>
                      <div><strong>Email:</strong> {previewWinner.user?.email}</div>
                      <div><strong>Số may mắn:</strong> <Badge variant="default">{previewWinner.number}</Badge></div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" onClick={handleConfirmDraw} disabled={drawing}>
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Xác nhận
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => setPreviewWinner(null)} 
                        disabled={drawing}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Hủy
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </DetailCard>

          {/* Danh sách người thắng */}
          <DetailCard 
            title="Người thắng gần đây" 
            icon={Trophy}
            actions={winners.length > 0 ? [{
              label: 'Xem tất cả',
              variant: 'outline',
              onClick: () => navigate(`/admin/minigames/${id}/winners`)
            }] : []}
          >
            {winners.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {winners.slice(0, 5).map((winner, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-border/40 last:border-0">
                    <div className="space-y-1">
                      <div className="font-medium text-sm">
                        {winner.user?.firstName} {winner.user?.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {winner.user?.email}
                      </div>
                      {winner.drawnAt && (
                        <div className="text-xs text-muted-foreground">
                          {new Date(winner.drawnAt).toLocaleString('vi-VN')}
                        </div>
                      )}
                    </div>
                    <Badge variant="secondary">#{winner.number}</Badge>
                  </div>
                ))}
                {winners.length > 5 && (
                  <div className="text-center text-sm text-muted-foreground pt-2">
                    Và {winners.length - 5} người khác...
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-6">
                <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <div className="text-sm">Chưa có người thắng nào</div>
              </div>
            )}
          </DetailCard>
        </div>
      </div>
    </div>
  );
};

export default MinigameDetailPage;