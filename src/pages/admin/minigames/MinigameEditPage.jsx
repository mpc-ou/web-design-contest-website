import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Gamepad2, Upload, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { apiService } from '../../../services/api';
import FormField from '../../../components/admin/ui/FormField';
import PageHeader from '../../../components/admin/ui/PageHeader';
import LoadingCard from '../../../components/admin/ui/LoadingCard';

const MinigameEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    maxNumber: 100,
    contest: '',
    startTime: '',
    endTime: '',
    isActive: true,
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchMinigame();
  }, [id]);

  const fetchMinigame = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAdminMinigame(id);
      const minigame = response.data;
      
      const formatDateTime = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toISOString().slice(0, 16);
      };

      setFormData({
        name: minigame.name || '',
        description: minigame.description || '',
        maxNumber: minigame.maxNumber || 100,
        contest: minigame.contest?._id || minigame.contest || '',
        startTime: formatDateTime(minigame.startTime),
        endTime: formatDateTime(minigame.endTime),
        isActive: minigame.isActive ?? true,
      });
      
      // Set existing thumbnail preview if available
      if (minigame.thumbnail) {
        setThumbnailPreview(minigame.thumbnail);
      }
    } catch (error) {
      console.error('Error fetching minigame:', error);
      toast.error('Có lỗi khi tải thông tin minigame');
      navigate('/admin/minigames');
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

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeThumbnail = () => {
    setThumbnail(null);
    setThumbnailPreview('');
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = 'Tên minigame là bắt buộc';
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
      
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
          submitData.append(key, formData[key]);
        }
      });
      
      if (thumbnail) {
        submitData.append('thumbnail', thumbnail);
      }
      
      await apiService.updateMinigame(id, submitData);
      toast.success('Cập nhật minigame thành công');
      navigate('/admin/minigames');
    } catch (error) {
      console.error('Error updating minigame:', error);
      toast.error('Có lỗi khi cập nhật minigame: ' + (error.response?.data?.error || error.message));
    } finally {
      setSaving(false);
    }
  };

  const pageActions = [
    {
      label: 'Quay lại',
      variant: 'outline',
      icon: ArrowLeft,
      onClick: () => navigate(`/admin/minigames/${id}`),
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
        title="Chỉnh sửa minigame"
        description={`Cập nhật thông tin minigame #${id}`}
        actions={pageActions}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Gamepad2 className="h-5 w-5" />
              <span>Thông tin minigame</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                label="Tên minigame"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                placeholder="Nhập tên minigame"
                required
              />

              <FormField
                label="Contest ID"
                name="contest"
                value={formData.contest}
                onChange={handleChange}
                placeholder="ID của cuộc thi"
              />

              <FormField
                label="Số tối đa"
                name="maxNumber"
                type="number"
                value={formData.maxNumber}
                onChange={handleChange}
                min="1"
                max="1000"
                placeholder="100"
              />

              <FormField
                type="switch"
                label="Kích hoạt"
                name="isActive"
                value={formData.isActive}
                onChange={handleChange}
                description="Cho phép người dùng chơi game"
              />

              <FormField
                label="Thời gian bắt đầu"
                name="startTime"
                type="datetime-local"
                value={formData.startTime}
                onChange={handleChange}
              />

              <FormField
                label="Thời gian kết thúc"
                name="endTime"
                type="datetime-local"
                value={formData.endTime}
                onChange={handleChange}
              />
            </div>

            <FormField
              label="Mô tả"
              name="description"
              type="textarea"
              value={formData.description}
              onChange={handleChange}
              placeholder="Mô tả chi tiết về minigame"
              rows={3}
            />

            {/* Thumbnail Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Thumbnail</label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                {thumbnailPreview ? (
                  <div className="relative">
                    <img 
                      src={thumbnailPreview} 
                      alt="Thumbnail preview" 
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={removeThumbnail}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-48 cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Click để upload thumbnail mới</span>
                    <span className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 10MB</span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                    />
                  </label>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default MinigameEditPage;