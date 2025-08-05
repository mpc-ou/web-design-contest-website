import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { TicketIcon } from '@heroicons/react/24/outline';
import { apiService } from '../../services/api';

const LuckyNumberPicker = ({ minigame, ticketInfo, onTicketUpdate }) => {
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isNumberTaken = (number) => {
    return ticketInfo?.takenNumbers?.includes(number) || false;
  };

  const isMyNumber = (number) => {
    return ticketInfo?.myNumbers?.includes(number) || false;
  };

  const canSelectNumber = () => {
    const now = new Date();
    const startTime = new Date(minigame.startTime);
    const endTime = new Date(minigame.endTime);
    
    return !minigame.isClosed && 
           now >= startTime && 
           now <= endTime && 
           !ticketInfo?.stats.hasMyTicket;
  };

  const handleNumberSelect = (number) => {
    if (!canSelectNumber() || isNumberTaken(number)) return;
    setSelectedNumber(number);
  };

  const handleSubmit = async () => {
    if (!selectedNumber) return;

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      await apiService.registerLuckyTicket({
        minigameId: minigame._id,
        number: selectedNumber
      });

      setSuccess(`Đã chọn số ${selectedNumber} thành công!`);
      setSelectedNumber(null);
      onTicketUpdate();
    } catch (error) {
      setError(error.response?.data?.error || 'Có lỗi xảy ra khi chọn số');
    } finally {
      setSubmitting(false);
    }
  };

  const renderNumberGrid = () => {
    const numbers = [];
    for (let i = 1; i <= minigame.maxNumber; i++) {
      numbers.push(i);
    }

    return (
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
        {numbers.map((number) => {
          const taken = isNumberTaken(number);
          const mine = isMyNumber(number);
          const selected = selectedNumber === number;
          
          return (
            <Button
              key={number}
              variant={
                mine ? 'default' : 
                selected ? 'secondary' : 
                taken ? 'outline' : 'ghost'
              }
              className={`
                aspect-square p-0 text-sm font-medium
                ${taken && !mine ? 'opacity-50 cursor-not-allowed' : ''}
                ${mine ? 'bg-green-500 hover:bg-green-600' : ''}
                ${selected ? 'ring-2 ring-primary' : ''}
              `}
              disabled={taken || !canSelectNumber()}
              onClick={() => handleNumberSelect(number)}
            >
              {number}
            </Button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TicketIcon className="h-5 w-5" />
            Chọn số may mắn
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!canSelectNumber() ? (
            <Alert>
              <AlertDescription>
                {minigame.isClosed ? 'Minigame đã kết thúc' :
                 ticketInfo?.stats.hasMyTicket ? 'Bạn đã chọn số rồi' :
                 'Chưa đến thời gian chọn số'}
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Chọn một số từ 1 đến {minigame.maxNumber}:
                </div>
                
                {renderNumberGrid()}
                
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span>Số của bạn</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-secondary rounded"></div>
                    <span>Đã chọn</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border border-gray-300 rounded"></div>
                    <span>Đã có người chọn</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-muted rounded"></div>
                    <span>Có thể chọn</span>
                  </div>
                </div>
              </div>

              {selectedNumber && (
                <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                  <span>Số đã chọn: <strong>{selectedNumber}</strong></span>
                  <Button onClick={handleSubmit} disabled={submitting}>
                    {submitting ? 'Đang xử lý...' : 'Xác nhận'}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LuckyNumberPicker;