import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '../services/api';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

const MyRegistrationsPage = () => {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useDocumentMeta({
    title: "Form đăng ký của tôi - Cuộc thi thiết kế web",
    description: "Theo dõi trạng thái các form đăng ký tham gia cuộc thi"
  });
  
  useEffect(() => {
    fetchMyRegistrations();
  }, []);

  const fetchMyRegistrations = async () => {
    try {
      setLoading(true);
      const response = await apiService.getMyRegistrationForms();
      setRegistrations(response.data || []);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      toast.error('Có lỗi khi tải danh sách đăng ký');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Chờ duyệt';
      case 'approved':
        return 'Đã duyệt';
      case 'rejected':
        return 'Bị từ chối';
      default:
        return 'Không xác định';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/profile')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Form đăng ký của tôi</h1>
            <p className="text-muted-foreground">Theo dõi trạng thái các form đăng ký tham gia cuộc thi</p>
          </div>
        </div>

        {/* Registrations List */}
        {registrations.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-4">Bạn chưa có form đăng ký nào</p>
              <Button onClick={() => navigate('/contests')}>
                Xem các cuộc thi
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {registrations.map((registration) => (
              <Card key={registration._id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <span>{registration.teamName}</span>
                        <Badge variant={getStatusColor(registration.status)}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(registration.status)}
                            <span>{getStatusText(registration.status)}</span>
                          </div>
                        </Badge>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Cuộc thi: {registration.contestId?.name || registration.contestId}
                      </p>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <p>Ngày gửi: {new Date(registration.createdAt).toLocaleDateString('vi-VN')}</p>
                      {registration.reviewedAt && (
                        <p>Ngày duyệt: {new Date(registration.reviewedAt).toLocaleDateString('vi-VN')}</p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Thông tin đội</p>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Bảng: {registration.division}</p>
                        <p>Trưởng nhóm: {registration.leaderName}</p>
                        <p>Email: {registration.email}</p>
                        <p>SĐT: {registration.phone}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Thành viên ({registration.members.length})</p>
                      <div className="text-sm text-muted-foreground space-y-1">
                        {registration.members.slice(0, 3).map((member, index) => (
                          <p key={index}>{member.fullName}</p>
                        ))}
                        {registration.members.length > 3 && (
                          <p>... và {registration.members.length - 3} thành viên khác</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {registration.adminNote && (
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium">Ghi chú từ admin:</p>
                      <p className="text-sm text-muted-foreground">{registration.adminNote}</p>
                    </div>
                  )}

                  {registration.status === 'approved' && registration.teamId && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm font-medium text-green-800">
                        ✅ Đội đã được tạo thành công! ID: {registration.teamId}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRegistrationsPage;