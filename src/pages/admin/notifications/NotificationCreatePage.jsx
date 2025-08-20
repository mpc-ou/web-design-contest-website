import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { apiService } from '../../../services/api';
import FormField from '../../../components/admin/ui/FormField';
import PageHeader from '../../../components/admin/ui/PageHeader';

const NotificationCreatePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'info',
    isActive: true,
  });
  const [errors, setErrors] = useState({});

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
      setLoading(true);
      await apiService.createAdminNotification(formData);
      toast.success('Tạo thông báo thành công');
      navigate('/admin/notifications');
    } catch (error) {
      toast.error('Có lỗi khi tạo thông báo');
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
      label: 'Tạo thông báo',
      variant: 'default',
      icon: Save,
      onClick: handleSubmit,
      disabled: loading,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tạo thông báo mới"
        description="Thêm thông báo mới vào hệ thống"
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

export default NotificationCreatePage;