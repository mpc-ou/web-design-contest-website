import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Image, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { apiService } from '../../../../services/api';
import DetailCard from '../../../../components/admin/ui/DetailCard';
import LoadingCard from '../../../../components/admin/ui/LoadingCard';
import PageHeader from '../../../../components/admin/ui/PageHeader';

const ItemDetailPage = () => {
  const { id: exhibitionId, itemId } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItemDetail();
  }, [itemId]);

  const fetchItemDetail = async () => {
    try {
      setLoading(true);

      const response = await apiService.getExhibitionItem(itemId);
      setItem(response.data);
    } catch (error) {
      console.error('Error fetching item:', error);
      toast.error(`Có lỗi khi tải thông tin tác phẩm: ${error.message || 'Unknown error'}`);
      navigate(`/admin/exhibitions/${exhibitionId}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tác phẩm này?')) {
      try {
        // Kiểm tra xem hàm có tồn tại không trước khi gọi
        if (typeof apiService.deleteAdminExhibitionItem !== 'function') {
          throw new Error("API function deleteAdminExhibitionItem is not defined");
        }
        
        await apiService.deleteAdminExhibitionItem(exhibitionId, itemId);
        toast.success('Xóa tác phẩm thành công');
        navigate(`/admin/exhibitions/${exhibitionId}`);
      } catch (error) {
        toast.error(`Có lỗi xảy ra: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const pageActions = [
    {
      label: 'Quay lại',
      variant: 'outline',
      icon: ArrowLeft,
      onClick: () => navigate(`/admin/exhibitions/${exhibitionId}`),
    },
    {
      label: 'Chỉnh sửa',
      variant: 'default',
      icon: Edit,
      onClick: () => navigate(`/admin/exhibitions/${exhibitionId}/items/${itemId}/edit`),
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

  if (!item) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Không tìm thấy tác phẩm"
          description="Tác phẩm bạn đang tìm kiếm không tồn tại."
          actions={[{
            label: 'Quay lại',
            variant: 'outline',
            icon: ArrowLeft,
            onClick: () => navigate(`/admin/exhibitions/${exhibitionId}`),
          }]}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={item.title}
        description={`Chi tiết tác phẩm từ ${item.teamName}`}
        actions={pageActions}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <DetailCard title="Thông tin tác phẩm" icon={Image}>
          <div className="space-y-1">
            <DetailCard.Field label="Tiêu đề" value={item.title} />
            <DetailCard.Field label="Mô tả" value={item.description} />
            <DetailCard.Field label="Team" value={item.teamName} />
            <DetailCard.Field label="Công nghệ" value={item.technologies} type="tags" />
            <DetailCard.Field label="Giải thưởng" value={item.awards} type="tags" />
            <DetailCard.Field label="Ngày tạo" value={item.createdAt} type="datetime" />
            <DetailCard.Field label="Cập nhật lúc" value={item.updatedAt} type="datetime" />
          </div>
        </DetailCard>

        <DetailCard title="Liên kết" icon={ExternalLink}>
          <div className="space-y-1">
            <DetailCard.Field label="Video URL" value={item.videoUrl} type="url" />
            <DetailCard.Field label="GitHub URL" value={item.githubUrl} type="url" />
            <DetailCard.Field label="Website URL" value={item.websiteUrl} type="url" />
          </div>
        </DetailCard>
      </div>

      <DetailCard title="Hình ảnh" icon={Image}>
        {item.images && item.images.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {item.images.map((image, index) => (
              <a 
                href={image} 
                key={index}
                target="_blank"
                rel="noopener noreferrer"
                className="block h-40 bg-muted rounded-md overflow-hidden hover:opacity-90 transition-opacity"
              >
                <img 
                  src={image} 
                  alt={`${item.title} - Hình ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </a>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Image className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p>Không có hình ảnh nào</p>
          </div>
        )}
      </DetailCard>
    </div>
  );
};

export default ItemDetailPage;