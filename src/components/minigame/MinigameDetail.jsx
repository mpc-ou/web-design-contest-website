/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { ArrowLeftIcon, TicketIcon, TrophyIcon, UsersIcon } from '@heroicons/react/24/outline';
import { apiService } from '../../services/api';
import LuckyNumberPicker from './LuckyNumberPicker';
import MinigameResults from './MinigameResults';

const MinigameDetail = ({ minigame, onBack, onRefresh }) => {
  const [ticketInfo, setTicketInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('pick'); 

  useEffect(() => {
    fetchTicketInfo();
  }, [minigame._id]);

  const fetchTicketInfo = async () => {
    try {
      setLoading(true);
      const response = await apiService.getMinigameTicketInfo(minigame._id);
      setTicketInfo(response.data);
    } catch (error) {
      setError('Không thể tải thông tin vé');
      console.error('Error fetching ticket info:', error);
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

  const getStatusBadge = () => {
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
      <div className="mb-6">
        <Button variant="ghost" onClick={onBack} className="gap-2 mb-4">
          <ArrowLeftIcon className="h-4 w-4" />
          Quay lại
        </Button>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{minigame.name}</h1>
            <p className="text-muted-foreground">{minigame.description}</p>
          </div>
          {getStatusBadge()}
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Minigame Info */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TicketIcon className="h-5 w-5" />
              Thông tin vé
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Tổng số vé:</span>
              <span className="font-medium">{ticketInfo?.stats.total || minigame.maxNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Đã chọn:</span>
              <span className="font-medium text-orange-600">
                {ticketInfo?.stats.taken || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Còn lại:</span>
              <span className="font-medium text-green-600">
                {ticketInfo?.stats.available || minigame.maxNumber}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrophyIcon className="h-5 w-5" />
              Giải thưởng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Số người thắng:</span>
                <span className="font-medium">{minigame.maxWinners}</span>
              </div>
              {minigame.prizes && minigame.prizes.length > 0 && (
                <div className="space-y-1">
                  {minigame.prizes.map((prize, index) => (
                    <div key={index} className="text-sm">
                      • {prize.name} ({prize.amount} giải)
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <UsersIcon className="h-5 w-5" />
              Vé của bạn
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ticketInfo?.stats.hasMyTicket ? (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Số vé đã chọn:</div>
                {ticketInfo.myNumbers?.map((number) => (
                  <Badge key={number} variant="default" className="mr-1">
                    {number}
                  </Badge>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                Bạn chưa chọn số nào
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeTab === 'pick' ? 'default' : 'outline'}
          onClick={() => setActiveTab('pick')}
        >
          Chọn số
        </Button>
        <Button
          variant={activeTab === 'results' ? 'default' : 'outline'}
          onClick={() => setActiveTab('results')}
        >
          Kết quả
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === 'pick' && (
        <LuckyNumberPicker
          minigame={minigame}
          ticketInfo={ticketInfo}
          onTicketUpdate={fetchTicketInfo}
        />
      )}

      {activeTab === 'results' && (
        <MinigameResults
          minigame={minigame}
        />
      )}
    </div>
  );
};

export default MinigameDetail;