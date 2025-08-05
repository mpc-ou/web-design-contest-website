import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { apiService } from '../../../services/api';
import FormField from '../../../components/admin/ui/FormField';
import PageHeader from '../../../components/admin/ui/PageHeader';
import LoadingCard from '../../../components/admin/ui/LoadingCard';

const NotificationEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'info',
    isActive: true,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchNotification();
  }, [id]);

  const fetchNotification = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAdminNotification(id);
      const notification = response.data;
      setFormData({
        title: notification.title || '',
        content: notification.content || '',
        type: notification.type || 'info',
        isActive: notification.isActive ?? true,
      });
    } catch (error) {
      toast.error('Có lỗi khi tải thông tin thông báo');
      navigate('/admin/notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      setErrors({ title: 'Tiêu đề là bắt buộc' });
      return;
    }

    try {
      setSaving(true);
      await apiService.updateAdminNotification(id, formData);
      toast.success('Cập nhật thông báo thành công');
      navigate(`/admin/notifications/${id}`);
    } catch (error) {
      toast.error('Có lỗi khi cập nhật thông báo');
    } finally {
      setSaving(false);
    }
  };

  const pageActions = [
    {
      label: 'Quay lại',
      variant: 'outline',
      icon: ArrowLeft,
      onClick: () => navigate(`/admin/notifications/${id}`),
    },
    {
      label: 'Lưu thay đổi',
      variant: 'default',
      icon: Save,
      onClick: handleSubmit,
      disabled: saving,
    },
  ];

  if (loading) {
    return <LoadingCard showHeader={true} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chỉnh sửa thông báo"
        description={`Cập nhật thông tin thông báo #${id}`}
        actions={pageActions}
      />

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Thông tin thông báo</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              label="Tiêu đề"
              name="title"
              value={formData.title}
              onChange={handleChange}
              error={errors.title}
              required
            />
            <FormField
              label="Nội dung"
              name="content"
              type="textarea"
              value={formData.content}
              onChange={handleChange}
              rows={4}
            />
            <FormField
              label="Loại thông báo"
              name="type"
              type="select"
              value={formData.type}
              onChange={handleChange}
              options={[
                { value: 'info', label: 'Thông tin' },
                { value: 'warning', label: 'Cảnh báo' },
                { value: 'success', label: 'Thành công' },
                { value: 'error', label: 'Lỗi' },
              ]}
            />
            <FormField
              type="switch"
              label="Kích hoạt"
              name="isActive"
              value={formData.isActive}
              onChange={handleChange}
            />
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default NotificationEditPage;