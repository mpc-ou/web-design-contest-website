import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, History } from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '../../../services/api';
import DetailCard from '../../../components/admin/ui/DetailCard';
import LoadingCard from '../../../components/admin/ui/LoadingCard';
import PageHeader from '../../../components/admin/ui/PageHeader';

const SponsorHistoryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sponsor, setSponsor] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSponsorHistory();
  }, [id]);

  const fetchSponsorHistory = async () => {
    try {
      setLoading(true);
      const [sponsorResponse, historyResponse] = await Promise.all([
        apiService.getAdminSponsor(id),
        apiService.getAdminSponsorHistory(id)
      ]);
      setSponsor(sponsorResponse.data);
      setHistory(historyResponse.data.data || []);
    } catch (error) {
      console.error('Error fetching sponsor history:', error);
      toast.error('Có lỗi khi tải lịch sử nhà tài trợ');
      navigate('/admin/sponsors');
    } finally {
      setLoading(false);
    }
  };

  const pageActions = [
    {
      label: 'Quay lại',
      variant: 'outline',
      icon: ArrowLeft,
      onClick: () => navigate(`/admin/sponsors/${id}`),
    },
  ];

  if (loading) {
    return <LoadingCard showHeader={true} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Lịch sử - ${sponsor?.name}`}
        description={`Lịch sử hoạt động của nhà tài trợ #${id}`}
        actions={pageActions}
      />

      <DetailCard
        title="Lịch sử hoạt động"
        icon={History}
      >
        {history.length > 0 ? (
          <div className="space-y-2">
            {history.map((item, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-border/40 last:border-0">
                <div className="space-y-1">
                  <div className="text-sm font-medium">{item.action}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(item.timestamp).toLocaleString('vi-VN')}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {item.user || 'System'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            Chưa có lịch sử hoạt động
          </div>
        )}
      </DetailCard>
    </div>
  );
};

export default SponsorHistoryPage;