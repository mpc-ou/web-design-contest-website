import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { CalendarIcon, TrophyIcon, TicketIcon, PlayIcon } from '@heroicons/react/24/outline';
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

  const handlePlayMinigame = (minigame) => {
    setSelectedMinigame(minigame);
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
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Minigames</h1>
        <p className="text-muted-foreground">Tham gia các minigame để có cơ hội nhận giải thưởng</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {minigames.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {minigames.map((minigame) => (
            <Card key={minigame._id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {minigame.thumbnail && (
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={minigame.thumbnail}
                    alt={minigame.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    {getStatusBadge(minigame)}
                  </div>
                </div>
              )}
              
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">{minigame.name}</CardTitle>
                    <CardDescription>{minigame.description}</CardDescription>
                  </div>
                  {!minigame.thumbnail && (
                    <div className="ml-2">
                      {getStatusBadge(minigame)}
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <TicketIcon className="h-4 w-4 text-muted-foreground" />
                    <span>Tối đa: {minigame.maxNumber} vé</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <TrophyIcon className="h-4 w-4 text-muted-foreground" />
                    <span>{minigame.maxWinners} người thắng</span>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CalendarIcon className="h-4 w-4" />
                    <span>Bắt đầu: {formatDate(minigame.startTime)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CalendarIcon className="h-4 w-4" />
                    <span>Kết thúc: {formatDate(minigame.endTime)}</span>
                  </div>
                </div>

                {minigame.prizes && minigame.prizes.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Giải thưởng:</h4>
                    <div className="space-y-1">
                      {minigame.prizes.slice(0, 2).map((prize, index) => (
                        <div key={index} className="text-sm text-muted-foreground">
                          • {prize.name} ({prize.amount} giải)
                        </div>
                      ))}
                      {minigame.prizes.length > 2 && (
                        <div className="text-sm text-muted-foreground">
                          và {minigame.prizes.length - 2} giải khác...
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <Button
                  className="w-full gap-2"
                  onClick={() => handlePlayMinigame(minigame)}
                  disabled={minigame.isClosed || !minigame.isRunning}
                >
                  <PlayIcon className="h-4 w-4" />
                  {minigame.isClosed ? 'Đã kết thúc' : 
                   !minigame.isRunning ? 'Chưa bắt đầu' : 'Tham gia'}
                </Button>
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