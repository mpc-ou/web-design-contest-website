import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { apiService } from '../../../services/api';
import FormField from '../../../components/admin/ui/FormField';
import PageHeader from '../../../components/admin/ui/PageHeader';
import LoadingCard from '../../../components/admin/ui/LoadingCard';

const ExhibitionEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    demoUrl: '',
    technologies: [],
    tags: [],
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchExhibition();
  }, [id]);

  const fetchExhibition = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAdminExhibition(id);
      const exhibition = response.data;
      
      setFormData({
        title: exhibition.title || '',
        description: exhibition.description || '',
        demoUrl: exhibition.demoUrl || '',
        technologies: exhibition.technologies || [],
        tags: exhibition.tags || [],
      });
    } catch (error) {
      console.error('Error fetching exhibition:', error);
      toast.error('Có lỗi khi tải thông tin triển lãm');
      navigate('/admin/exhibitions');
    } finally {
      setLoading(false);
    }
  };

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
      setSaving(true);
      await apiService.updateAdminExhibition(id, formData);
      toast.success('Cập nhật triển lãm thành công');
      navigate(`/admin/exhibitions/${id}`);
    } catch (error) {
      console.error('Error updating exhibition:', error);
      toast.error('Có lỗi khi cập nhật triển lãm');
    } finally {
      setSaving(false);
    }
  };

  const pageActions = [
    {
      label: 'Quay lại',
      variant: 'outline',
      icon: ArrowLeft,
      onClick: () => navigate(`/admin/exhibitions/${id}`),
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
    return (
      <div className="space-y-6">
        <LoadingCard showHeader={true} />
        <LoadingCard />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chỉnh sửa triển lãm"
        description={`Cập nhật thông tin triển lãm #${id}`}
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
              label="Demo URL"
              name="demoUrl"
              type="url"
              value={formData.demoUrl}
              onChange={handleChange}
              placeholder="https://example.com"
            />

            <FormField
              label="Công nghệ sử dụng"
              name="technologies"
              type="tags"
              value={formData.technologies}
              onChange={handleChange}
              placeholder="React, Node.js, MongoDB, ..."
            />

            <FormField
              label="Thẻ"
              name="tags"
              type="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="web design, responsive, creative, ..."
            />
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default ExhibitionEditPage;