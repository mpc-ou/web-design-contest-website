import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Building } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { apiService } from '../../../services/api';
import FormField from '../../../components/admin/ui/FormField';
import PageHeader from '../../../components/admin/ui/PageHeader';

const SponsorCreatePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    website: '',
    logo: null,
    description: '',
    tier: 'bronze',
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
    if (!formData.name?.trim()) {
      setErrors({ name: 'Tên công ty là bắt buộc' });
      return;
    }

    try {
      setLoading(true);
      
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('website', formData.website);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('tier', formData.tier);
      
      if (formData.logo && typeof formData.logo === 'object') {
        formDataToSend.append('logo', formData.logo);
      }
      
      await apiService.createAdminSponsor(formDataToSend);
      toast.success('Tạo nhà tài trợ thành công');
      navigate('/admin/sponsors');
    } catch (error) {
      toast.error('Có lỗi khi tạo nhà tài trợ');
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
      label: 'Tạo nhà tài trợ',
      variant: 'default',
      icon: Save,
      onClick: handleSubmit,
      disabled: loading,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tạo nhà tài trợ mới"
        description="Thêm nhà tài trợ mới vào hệ thống"
        actions={pageActions}
      />

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="h-5 w-5" />
              <span>Thông tin nhà tài trợ</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              label="Tên công ty"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              required
            />
            <FormField
              label="Website"
              name="website"
              type="url"
              value={formData.website}
              onChange={handleChange}
            />
                          <FormField
                label="Logo"
                name="logo"
                type="file"
                value={formData.logo}
                onChange={handleChange}
                description="Chọn logo của nhà tài trợ (khuyến nghị: PNG với nền trong suốt)"
              />
            <FormField
              label="Mô tả"
              name="description"
              type="textarea"
              value={formData.description}
              onChange={handleChange}
            />
            <FormField
              label="Cấp độ"
              name="tier"
              type="select"
              value={formData.tier}
              onChange={handleChange}
              options={[
                { value: 'platinum', label: 'Platinum' },
                { value: 'gold', label: 'Gold' },
                { value: 'silver', label: 'Silver' },
                { value: 'bronze', label: 'Bronze' },
              ]}
            />
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default SponsorCreatePage;