import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { apiService } from '../../../services/api';
import FormField from '../../../components/admin/ui/FormField';
import PageHeader from '../../../components/admin/ui/PageHeader';

const ExhibitionCreatePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    contest: '',
    tags: [],
    startDate: '',
    endDate: '',
    location: '',
    organizer: '',
    isPublic: false,
    thumbnail: null,
    banner: null,
  });
  const [errors, setErrors] = useState({});

  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title?.trim()) {
      newErrors.title = 'Tiêu đề là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Vui lòng kiểm tra lại thông tin');
      return;
    }

    try {
      setLoading(true);
      await apiService.createAdminExhibition(formData);
      toast.success('Tạo triển lãm thành công');
      navigate('/admin/exhibitions');
    } catch (error) {
      console.error('Error creating exhibition:', error);
      toast.error('Có lỗi khi tạo triển lãm');
    } finally {
      setLoading(false);
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
      label: 'Tạo triển lãm',
      variant: 'default',
      icon: Save,
      onClick: handleSubmit,
      disabled: loading,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tạo triển lãm mới"
        description="Thêm triển lãm mới vào hệ thống"
        actions={pageActions}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Image className="h-5 w-5" />
              <span>Thông tin triển lãm</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              label="Tiêu đề"
              name="title"
              value={formData.title}
              onChange={handleChange}
              error={errors.title}
              placeholder="Nhập tiêu đề triển lãm"
              required
            />

            <FormField
              label="Mô tả"
              name="description"
              type="textarea"
              value={formData.description}
              onChange={handleChange}
              placeholder="Mô tả chi tiết về triển lãm"
              rows={4}
            />

            <FormField
              label="Thuộc cuộc thi (ID)"
              name="contest"
              value={formData.contest}
              onChange={handleChange}
              placeholder="contest-id (tùy chọn)"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="Ngày bắt đầu"
                name="startDate"
                type="datetime-local"
                value={formData.startDate}
                onChange={handleChange}
              />
              <FormField
                label="Ngày kết thúc"
                name="endDate"
                type="datetime-local"
                value={formData.endDate}
                onChange={handleChange}
              />
            </div>

            <FormField
              label="Địa điểm"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Địa điểm tổ chức"
            />

            <FormField
              label="Đơn vị tổ chức"
              name="organizer"
              value={formData.organizer}
              onChange={handleChange}
              placeholder="Tên đơn vị tổ chức"
            />

            <FormField
              label="Thẻ"
              name="tags"
              type="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="web design, responsive, creative, ..."
            />

            <FormField
              label="Công khai"
              name="isPublic"
              type="switch"
              value={formData.isPublic}
              onChange={handleChange}
              description="Bật để công khai triển lãm"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="Thumbnail"
                name="thumbnail"
                type="file"
                value={formData.thumbnail}
                onChange={handleChange}
                accept="image/*"
              />
              <FormField
                label="Banner"
                name="banner"
                type="file"
                value={formData.banner}
                onChange={handleChange}
                accept="image/*"
              />
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default ExhibitionCreatePage;