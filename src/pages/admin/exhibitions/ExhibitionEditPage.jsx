import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Image, Upload, X } from 'lucide-react';
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
    demoUrl: '',
    githubUrl: '',
    videoUrl: '',
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [images, setImages] = useState([]);
  const [imagesPreview, setImagesPreview] = useState([]);
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
        demoUrl: exhibition.demoUrl || '',
        githubUrl: exhibition.githubUrl || '',
        videoUrl: exhibition.videoUrl || '',
      });
      
      // Set existing thumbnail preview if available
      if (exhibition.thumbnail) {
        setThumbnailPreview(exhibition.thumbnail);
      }
      
      // Set existing images preview if available
      if (exhibition.images && exhibition.images.length > 0) {
        setImagesPreview(exhibition.images);
      }
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

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    
    const previews = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push(reader.result);
        if (previews.length === files.length) {
          setImagesPreview(previews);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagesPreview(prev => prev.filter((_, i) => i !== index));
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
      
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          if (key === 'tags' && Array.isArray(formData[key])) {
            formData[key].forEach(tag => submitData.append('tags[]', tag));
          } else if (formData[key] !== '') {
            submitData.append(key, formData[key]);
          }
        }
      });
      
      if (thumbnail) {
        submitData.append('thumbnail', thumbnail);
      }
      
      if (images.length > 0) {
        images.forEach(image => {
          submitData.append('images[]', image);
        });
      }
      
      await apiService.updateExhibition(id, submitData);
      toast.success('Cập nhật triển lãm thành công');
      navigate('/admin/exhibitions');
    } catch (error) {
      console.error('Error updating exhibition:', error);
      toast.error('Có lỗi khi cập nhật triển lãm: ' + (error.response?.data?.error || error.message));
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

            <FormField
              label="Demo URL"
              name="demoUrl"
              value={formData.demoUrl}
              onChange={handleChange}
              placeholder="https://example.com/demo"
            />

            <FormField
              label="GitHub URL"
              name="githubUrl"
              value={formData.githubUrl}
              onChange={handleChange}
              placeholder="https://github.com/username/repo"
            />

            <FormField
              label="Video URL"
              name="videoUrl"
              value={formData.videoUrl}
              onChange={handleChange}
              placeholder="https://youtube.com/watch?v=..."
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

            {/* Images Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Hình ảnh</label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                {imagesPreview.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {imagesPreview.map((preview, index) => (
                        <div key={index} className="relative">
                          <img 
                            src={preview} 
                            alt={`Preview ${index + 1}`} 
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <label className="flex items-center justify-center p-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                      <Upload className="w-5 h-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-500">Thêm hình ảnh khác</span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        multiple
                        onChange={handleImagesChange}
                      />
                    </label>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-32 cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Click để upload hình ảnh mới</span>
                    <span className="text-xs text-gray-400 mt-1">Có thể chọn nhiều hình</span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      multiple
                      onChange={handleImagesChange}
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

export default ExhibitionEditPage;