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
        contest: exhibition.contest?._id || exhibition.contest || '',
        tags: exhibition.tags || [],
        startDate: exhibition.startDate ? exhibition.startDate.slice(0, 16) : '',
        endDate: exhibition.endDate ? exhibition.endDate.slice(0, 16) : '',
        location: exhibition.location || '',
        organizer: exhibition.organizer || '',
        isPublic: !!exhibition.isPublic,
        thumbnail: exhibition.thumbnail || null,
        banner: exhibition.banner || null,
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

export default ExhibitionEditPage;