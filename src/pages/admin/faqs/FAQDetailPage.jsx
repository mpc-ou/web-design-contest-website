import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '../../../services/api';
import DetailCard from '../../../components/admin/ui/DetailCard';
import LoadingCard from '../../../components/admin/ui/LoadingCard';
import PageHeader from '../../../components/admin/ui/PageHeader';

const FAQDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [faq, setFaq] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFAQDetail();
  }, [id]);

  const fetchFAQDetail = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAdminFAQ(id);
      setFaq(response.data);
    } catch (error) {
      console.error('Error fetching FAQ:', error);
      toast.error('Có lỗi khi tải thông tin FAQ');
      navigate('/admin/faqs');
    } finally {
      setLoading(false);
    }
  };

  const pageActions = [
    {
      label: 'Quay lại',
      variant: 'outline',
      icon: ArrowLeft,
      onClick: () => navigate('/admin/faqs'),
    },
    {
      label: 'Chỉnh sửa',
      variant: 'default',
      icon: Edit,
      onClick: () => navigate(`/admin/faqs/${id}/edit`),
    },
  ];

  if (loading) {
    return <LoadingCard showHeader={true} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={faq?.question || 'FAQ'}
        description={`Chi tiết FAQ #${id}`}
        actions={pageActions}
      />

      <DetailCard
        title="Thông tin FAQ"
        icon={HelpCircle}
      >
        <div className="space-y-1">
          <DetailCard.Field label="Câu hỏi" value={faq?.question} />
          <DetailCard.Field label="Câu trả lời" value={faq?.answer} />
          <DetailCard.Field label="Danh mục" value={faq?.category} type="badge" />
          <DetailCard.Field label="Thứ tự" value={faq?.order} />
          <DetailCard.Field label="Trạng thái" value={faq?.isActive} type="boolean" />
          <DetailCard.Field label="Ngày tạo" value={faq?.createdAt} type="datetime" />
        </div>
      </DetailCard>
    </div>
  );
};

export default FAQDetailPage;