import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, FileText, Users, Trophy, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { apiService } from '../../../services/api';
import DetailCard from '../../../components/admin/ui/DetailCard';
import LoadingCard from '../../../components/admin/ui/LoadingCard';
import PageHeader from '../../../components/admin/ui/PageHeader';

const SubmissionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmissionDetail();
  }, [id]);

  const fetchSubmissionDetail = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAdminSubmission(id);
      setSubmission(response.data);
    } catch (error) {
      console.error('Error fetching submission:', error);
      toast.error('Có lỗi khi tải thông tin bài nộp');
      navigate('/admin/submissions');
    } finally {
      setLoading(false);
    }
  };

  const pageActions = [
    {
      label: 'Quay lại',
      variant: 'outline',
      icon: ArrowLeft,
      onClick: () => navigate('/admin/submissions'),
    },
  ];

  if (submission?.githubLink) {
    pageActions.push({
      label: 'Mở GitHub',
      variant: 'default',
      icon: ExternalLink,
      onClick: () => window.open(submission.githubLink, '_blank'),
    });
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingCard showHeader={true} />
        <div className="grid gap-6 md:grid-cols-2">
          <LoadingCard />
          <LoadingCard />
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Không tìm thấy bài nộp"
          description="Bài nộp bạn đang tìm kiếm không tồn tại."
          actions={[{
            label: 'Quay lại',
            variant: 'outline',
            icon: ArrowLeft,
            onClick: () => navigate('/admin/submissions'),
          }]}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Bài nộp - ${submission.round}`}
        description={`Chi tiết bài nộp #${submission._id}`}
        actions={pageActions}
        badge={{
          text: submission.isActive ? 'Hoạt động' : 'Không hoạt động',
          variant: submission.isActive ? 'default' : 'secondary',
        }}
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Thông tin bài nộp */}
        <DetailCard
          title="Thông tin bài nộp"
          icon={FileText}
        >
          <div className="space-y-1">
            <DetailCard.Field label="Vòng thi" value={submission.round} type="badge" />
            <DetailCard.Field label="Mô tả" value={submission.description} />
            <DetailCard.Field label="GitHub Link" value={submission.githubLink} type="url" />
            <DetailCard.Field label="Ngày nộp" value={submission.submittedAt} type="datetime" icon={Calendar} />
            <DetailCard.Field label="Trạng thái" value={submission.isActive} type="boolean" />
            <DetailCard.Field label="Cập nhật lần cuối" value={submission.updatedAt} type="datetime" />
          </div>
        </DetailCard>

        {/* Thông tin đội thi */}
        <DetailCard
          title="Thông tin đội thi"
          icon={Users}
          actions={[
            {
              label: 'Xem chi tiết',
              variant: 'outline',
              onClick: () => navigate(`/admin/teams/${submission.team?._id}`)
            }
          ]}
        >
          <div className="space-y-1">
            <DetailCard.Field label="Tên đội" value={submission.team?.teamName} />
            <DetailCard.Field label="Trưởng nhóm" value={submission.team?.leaderName} />
            <DetailCard.Field label="Email" value={submission.team?.email} type="email" />
            <DetailCard.Field label="Bảng thi" value={submission.team?.division} type="badge" />
            <DetailCard.Field label="Số thành viên" value={submission.team?.members?.length + 1 || 1} />
          </div>
        </DetailCard>
      </div>

      {/* Thông tin cuộc thi */}
      <DetailCard
        title="Thông tin cuộc thi"
        icon={Trophy}
        actions={[
          {
            label: 'Xem chi tiết',
            variant: 'outline',
            onClick: () => navigate(`/admin/contests/${submission.contest?._id}`)
          }
        ]}
      >
        <div className="space-y-1">
          <DetailCard.Field label="Tên cuộc thi" value={submission.contest?.name} />
          <DetailCard.Field label="Mã cuộc thi" value={submission.contest?.code} />
          <DetailCard.Field label="Trạng thái" value={submission.contest?.status} type="status" />
          <DetailCard.Field label="Danh mục" value={submission.contest?.category} type="badge" />
        </div>
      </DetailCard>

      {/* GitHub Repository */}
      {submission.githubLink && (
        <DetailCard
          title="GitHub Repository"
          icon={ExternalLink}
          actions={[
            {
              label: 'Mở GitHub',
              variant: 'default',
              icon: ExternalLink,
              onClick: () => window.open(submission.githubLink, '_blank')
            }
          ]}
        >
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Click vào link bên dưới để xem source code của đội thi:
            </div>
            <a 
              href={submission.githubLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline break-all"
            >
              {submission.githubLink}
            </a>
          </div>
        </DetailCard>
      )}
    </div>
  );
};

export default SubmissionDetailPage;