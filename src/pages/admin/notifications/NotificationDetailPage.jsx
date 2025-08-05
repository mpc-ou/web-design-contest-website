import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Bell } from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '../../../services/api';
import DetailCard from '../../../components/admin/ui/DetailCard';
import LoadingCard from '../../../components/admin/ui/LoadingCard';
import PageHeader from '../../../components/admin/ui/PageHeader';

const NotificationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotificationDetail();
  }, [id]);

  const fetchNotificationDetail = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAdminNotification(id);
      setNotification(response.data);
    } catch (error) {
      console.error('Error fetching notification:', error);
      toast.error('Có lỗi khi tải thông tin thông báo');
      navigate('/admin/notifications');
    } finally {
      setLoading(false);
    }
  };

  const pageActions = [
    {
      label: 'Quay lại',
      variant: 'outline',
      icon: ArrowLeft,
      onClick: () => navigate('/admin/notifications'),
    },
    {
      label: 'Chỉnh sửa',
      variant: 'default',
      icon: Edit,
      onClick: () => navigate(`/admin/notifications/${id}/edit`),
    },
  ];

  if (loading) {
    return <LoadingCard showHeader={true} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={notification?.title || 'Thông báo'}
        description={`Chi tiết thông báo #${id}`}
        actions={pageActions}
      />

      <DetailCard
        title="Thông tin thông báo"
        icon={Bell}
      >
        <div className="space-y-1">
          <DetailCard.Field label="Tiêu đề" value={notification?.title} />
          <DetailCard.Field label="Nội dung" value={notification?.content} />
          <DetailCard.Field label="Loại" value={notification?.type} type="badge" />
          <DetailCard.Field label="Trạng thái" value={notification?.isActive} type="boolean" />
          <DetailCard.Field label="Ngày tạo" value={notification?.createdAt} type="datetime" />
        </div>
      </DetailCard>
    </div>
  );
};

export default NotificationDetailPage;