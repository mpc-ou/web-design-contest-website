import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { CalendarIcon, TrophyIcon, TicketIcon, PlayIcon, ClockIcon } from '@heroicons/react/24/outline';
import { apiService } from '../services/api';
import MinigameDetail from '../components/minigame/MinigameDetail';

const MinigamesPage = () => {
  const [minigames, setMinigames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMinigame, setSelectedMinigame] = useState(null);

  useEffect(() => {
    fetchMinigames();
  }, []);

  const fetchMinigames = async () => {
    try {
      setLoading(true);
      const response = await apiService.getMinigames({
        sortBy: 'startTime',
        order: 'desc',
        limit: 20
      });
      setMinigames(response.data.minigames || []);
    } catch (error) {
      setError('Không thể tải danh sách minigame');
      console.error('Error fetching minigames:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (minigame) => {
    const now = new Date();
    const startTime = new Date(minigame.startTime);
    const endTime = new Date(minigame.endTime);

    if (minigame.isClosed) {
      return <Badge variant="secondary">Đã kết thúc</Badge>;
    } else if (now < startTime) {
      return <Badge variant="outline">Sắp diễn ra</Badge>;
    } else if (now <= endTime) {
      return <Badge variant="default">Đang diễn ra</Badge>;
    } else {
      return <Badge variant="secondary">Hết hạn</Badge>;
    }
  };

  const handleOpenDetail = (minigame) => {
    setSelectedMinigame(minigame);
  };

  const isRunning = (minigame) => {
    const now = new Date();
    return !minigame.isClosed && now >= new Date(minigame.startTime) && now <= new Date(minigame.endTime);
  };

  if (selectedMinigame) {
    return (
      <MinigameDetail
        minigame={selectedMinigame}
        onBack={() => setSelectedMinigame(null)}
        onRefresh={fetchMinigames}
      />
    );
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Minigames</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Tham gia các minigame thú vị để có cơ hội nhận giải thưởng hấp dẫn.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {minigames.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {minigames.map((minigame) => (
            <Card key={minigame._id} className="group overflow-hidden hover:shadow-lg transition-all duration-300">
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={minigame.thumbnail || '/img/wd.jpg'}
                  alt={minigame.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute top-2 right-2">
                  {getStatusBadge(minigame)}
                </div>
              </div>

              <CardHeader>
                <CardTitle className="text-lg line-clamp-2">{minigame.name}</CardTitle>
                <CardDescription className="line-clamp-3">{minigame.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <TicketIcon className="h-4 w-4" />
                    <span>Tối đa: {minigame.maxNumber} vé</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <TrophyIcon className="h-4 w-4" />
                    <span>{minigame.maxWinners} người thắng</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <ClockIcon className="h-4 w-4" />
                    <span>Bắt đầu: {formatDate(minigame.startTime)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <ClockIcon className="h-4 w-4" />
                    <span>Kết thúc: {formatDate(minigame.endTime)}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {isRunning(minigame) && (
                    <Button className="flex-1" onClick={() => handleOpenDetail(minigame)}>
                      Tham gia
                    </Button>
                  )}
                  <Button variant="outline" className="flex-1" onClick={() => handleOpenDetail(minigame)}>
                    Xem chi tiết
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <TrophyIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Chưa có minigame nào</h3>
          <p className="text-muted-foreground">Các minigame sẽ được cập nhật sớm nhất</p>
        </div>
      )}
    </div>
  );
};

export default MinigamesPage;