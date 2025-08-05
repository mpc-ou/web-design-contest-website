/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { TrophyIcon, UsersIcon } from '@heroicons/react/24/outline';
import { apiService } from '../../services/api';

const MinigameResults = ({ minigame }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResults();
  }, [minigame._id]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await apiService.getLuckyTicketsByMinigame(minigame._id);
      setTickets(response.data.tickets || []);
    } catch (error) {
      setError('Không thể tải kết quả');
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  const winners = tickets.filter(ticket => ticket.isWinner);
  const participants = tickets.filter(ticket => !ticket.isWinner);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Winners */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrophyIcon className="h-5 w-5 text-yellow-500" />
            Người thắng cuộc
          </CardTitle>
        </CardHeader>
        <CardContent>
          {winners.length > 0 ? (
            <div className="space-y-3">
              {winners.map((ticket, index) => (
                <div
                  key={ticket._id}
                  className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="default" className="bg-yellow-500">
                      #{index + 1}
                    </Badge>
                    <div>
                      <div className="font-medium">
                        {ticket.user?.firstName} {ticket.user?.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {ticket.user?.email}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">
                      Số {ticket.number}
                    </div>
                    {ticket.drawnAt && (
                      <div className="text-xs text-muted-foreground">
                        {new Date(ticket.drawnAt).toLocaleString('vi-VN')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {minigame.isClosed ? 
                'Chưa có người thắng cuộc' : 
                'Chưa quay số. Kết quả sẽ được công bố sau khi kết thúc.'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Participants */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UsersIcon className="h-5 w-5" />
            Tất cả người tham gia ({tickets.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tickets.length > 0 ? (
            <div className="grid gap-2 max-h-96 overflow-y-auto">
              {tickets
                .sort((a, b) => a.number - b.number)
                .map((ticket) => (
                  <div
                    key={ticket._id}
                    className={`
                      flex items-center justify-between p-2 rounded
                      ${ticket.isWinner ? 
                        'bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800' : 
                        'bg-muted/50'}
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={ticket.isWinner ? 'default' : 'outline'}
                        className={ticket.isWinner ? 'bg-yellow-500' : ''}
                      >
                        {ticket.number}
                      </Badge>
                      <span className="text-sm">
                        {ticket.user?.firstName} {ticket.user?.lastName}
                      </span>
                    </div>
                    {ticket.isWinner && (
                      <TrophyIcon className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Chưa có người tham gia
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MinigameResults;