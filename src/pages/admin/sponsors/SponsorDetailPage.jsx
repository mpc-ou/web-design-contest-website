import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Building, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '../../../services/api';
import DetailCard from '../../../components/admin/ui/DetailCard';
import LoadingCard from '../../../components/admin/ui/LoadingCard';
import PageHeader from '../../../components/admin/ui/PageHeader';

const SponsorDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sponsor, setSponsor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSponsorDetail();
  }, [id]);

  const fetchSponsorDetail = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAdminSponsor(id);
      setSponsor(response.data);
    } catch (error) {
      console.error('Error fetching sponsor:', error);
      toast.error('Có lỗi khi tải thông tin nhà tài trợ');
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
      onClick: () => navigate('/admin/sponsors'),
    },
    {
      label: 'Chỉnh sửa',
      variant: 'default',
      icon: Edit,
      onClick: () => navigate(`/admin/sponsors/${id}/edit`),
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingCard showHeader={true} />
        <LoadingCard />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={sponsor?.name || 'Nhà tài trợ'}
        description={`Chi tiết nhà tài trợ #${id}`}
        actions={pageActions}
      />

      <DetailCard
        title="Thông tin nhà tài trợ"
        icon={Building}
      >
        <div className="space-y-1">
          <DetailCard.Field label="Tên công ty" value={sponsor?.name} />
          <DetailCard.Field label="Website" value={sponsor?.website} type="url" />
          <DetailCard.Field label="Logo" value={sponsor?.logo} type="url" />
          <DetailCard.Field label="Mô tả" value={sponsor?.description} />
          <DetailCard.Field label="Cấp độ" value={sponsor?.tier} type="badge" />
          <DetailCard.Field label="Ngày tạo" value={sponsor?.createdAt} type="datetime" />
        </div>
      </DetailCard>
    </div>
  );
};

export default SponsorDetailPage;