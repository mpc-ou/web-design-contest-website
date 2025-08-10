import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Image, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { apiService } from '../../../services/api';
import DetailCard from '../../../components/admin/ui/DetailCard';
import LoadingCard from '../../../components/admin/ui/LoadingCard';
import PageHeader from '../../../components/admin/ui/PageHeader';

const ExhibitionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exhibition, setExhibition] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExhibitionDetail();
  }, [id]);

  const fetchExhibitionDetail = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAdminExhibition(id);
      setExhibition(response.data);
    } catch (error) {
      console.error('Error fetching exhibition:', error);
      toast.error('Có lỗi khi tải thông tin triển lãm');
      navigate('/admin/exhibitions');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa triển lãm này?')) {
      try {
        await apiService.deleteAdminExhibition(id);
        toast.success('Xóa triển lãm thành công');
        navigate('/admin/exhibitions');
      } catch (error) {
        toast.error('Có lỗi xảy ra');
      }
    }
  };

  const pageActions = [
    {
      label: 'Quay lại',
      variant: 'outline',
      icon: ArrowLeft,
      onClick: () => navigate('/admin/exhibitions'),
    },
    {
      label: 'Chỉnh sửa',
      variant: 'default',
      icon: Edit,
      onClick: () => navigate(`/admin/exhibitions/${id}/edit`),
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
        <LoadingCard />
      </div>
    );
  }

  if (!exhibition) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Không tìm thấy triển lãm"
          description="Triển lãm bạn đang tìm kiếm không tồn tại."
          actions={[{
            label: 'Quay lại',
            variant: 'outline',
            icon: ArrowLeft,
            onClick: () => navigate('/admin/exhibitions'),
          }]}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={exhibition.title}
        description={`Chi tiết triển lãm #${exhibition._id}`}
        actions={pageActions}
      />

      <DetailCard title="Thông tin triển lãm" icon={Image}>
        <div className="space-y-1">
          <DetailCard.Field label="Tiêu đề" value={exhibition.title} />
          <DetailCard.Field label="Mô tả" value={exhibition.description} />
          <DetailCard.Field label="Công khai" value={exhibition.isPublic ? 'Có' : 'Không'} />
          <DetailCard.Field label="Cuộc thi" value={exhibition.contest?.name || exhibition.contest?.code} />
          <DetailCard.Field label="Đơn vị tổ chức" value={exhibition.organizer} />
          <DetailCard.Field label="Địa điểm" value={exhibition.location} />
          <DetailCard.Field label="Ngày bắt đầu" value={exhibition.startDate} type="datetime" />
          <DetailCard.Field label="Ngày kết thúc" value={exhibition.endDate} type="datetime" />
          <DetailCard.Field label="Thẻ" value={exhibition.tags} type="tags" />
          <DetailCard.Field label="Thumbnail" value={exhibition.thumbnail} type="url" />
          <DetailCard.Field label="Banner" value={exhibition.banner} type="url" />
          <DetailCard.Field label="Ngày tạo" value={exhibition.createdAt} type="datetime" />
          <DetailCard.Field label="Cập nhật lúc" value={exhibition.updatedAt} type="datetime" />
        </div>
      </DetailCard>
    </div>
  );
};

export default ExhibitionDetailPage;