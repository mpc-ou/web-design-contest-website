import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Image, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { apiService } from '../../../../services/api';
import PageHeader from '../../../../components/admin/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import FormField from '../../../../components/admin/ui/FormField';
import LoadingCard from '../../../../components/admin/ui/LoadingCard';

const ItemEditPage = () => {
  const { id: exhibitionId, itemId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    teamName: '',
    teamId: '',
    videoUrl: '',
    githubUrl: '',
    websiteUrl: '',
    technologies: [],
    awards: []
  });
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToAdd, setImagesToAdd] = useState([]);
  const [imagesPreview, setImagesPreview] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchItemDetail();
  }, [itemId]);

  const fetchItemDetail = async () => {
    try {
      setLoading(true);
      const response = await apiService.getExhibitionItem(itemId);
      const item = response.data;
      
      setFormData({
        title: item.title || '',
        description: item.description || '',
        teamName: item.teamName || '',
        teamId: item.teamId || '',
        videoUrl: item.videoUrl || '',
        githubUrl: item.githubUrl || '',
        websiteUrl: item.websiteUrl || '',
        technologies: item.technologies || [],
        awards: item.awards || []
      });
      
      setExistingImages(item.images || []);
    } catch (error) {
      console.error('Error fetching item:', error);
      toast.error('Có lỗi khi tải thông tin tác phẩm');
      navigate(`/admin/exhibitions/${exhibitionId}`);
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

  const handleTagsChange = (type, value) => {
    if (type === 'technologies' || type === 'awards') {
      const tags = value.split(',')
        .map(tag => tag.trim())
        .filter(Boolean);
      handleChange(type, tags);
    }
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setImagesToAdd(files);
    
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

  const removeNewImage = (index) => {
    setImagesToAdd(prev => prev.filter((_, i) => i !== index));
    setImagesPreview(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title?.trim()) {
      newErrors.title = 'Tiêu đề là bắt buộc';
    }
    
    if (!formData.description?.trim()) {
      newErrors.description = 'Mô tả là bắt buộc';
    }
    
    if (!formData.teamName?.trim()) {
      newErrors.teamName = 'Tên team là bắt buộc';
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
          if ((key === 'technologies' || key === 'awards') && Array.isArray(formData[key])) {
            formData[key].forEach(tag => submitData.append(`${key}[]`, tag));
          } else if (formData[key] !== '') {
            submitData.append(key, formData[key]);
          }
        }
      });
      
      // Add existing images
      if (existingImages.length > 0) {
        submitData.append('existingImages', JSON.stringify(existingImages));
      }
      
      // Add new images
      if (imagesToAdd.length > 0) {
        imagesToAdd.forEach(image => {
          submitData.append('images', image);
        });
      }
      
      await apiService.updateExhibitionItem(exhibitionId, itemId, submitData);
      toast.success('Cập nhật tác phẩm thành công');
      navigate(`/admin/exhibitions/${exhibitionId}/items/${itemId}`);
    } catch (error) {
      console.error('Error updating exhibition item:', error);
      toast.error('Có lỗi khi cập nhật tác phẩm: ' + (error.response?.data?.error || error.message));
    } finally {
      setSaving(false);
    }
  };

  const pageActions = [
    {
      label: 'Quay lại',
      variant: 'outline',
      icon: ArrowLeft,
      onClick: () => navigate(`/admin/exhibitions/${exhibitionId}/items/${itemId}`),
    },
    {
      label: 'Lưu',
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
        title={`Chỉnh sửa: ${formData.title}`}
        description="Cập nhật thông tin tác phẩm"
        actions={pageActions}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Image className="h-5 w-5" />
              <span>Thông tin tác phẩm</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              label="Tiêu đề"
              name="title"
              value={formData.title}
              onChange={handleChange}
              error={errors.title}
              placeholder="Nhập tiêu đề tác phẩm"
              required
            />
            
            <FormField
              label="Mô tả"
              name="description"
              value={formData.description}
              onChange={handleChange}
              error={errors.description}
              placeholder="Nhập mô tả tác phẩm"
              type="textarea"
              required
            />
            
            <FormField
              label="Tên team"
              name="teamName"
              value={formData.teamName}
              onChange={handleChange}
              error={errors.teamName}
              placeholder="Nhập tên team"
              required
            />
            
            <FormField
              label="Công nghệ sử dụng"
              name="technologies"
              value={formData.technologies.join(', ')}
              onChange={(name, value) => handleTagsChange('technologies', value)}
              placeholder="React, Vue, Angular, etc."
              help="Nhập các công nghệ, phân cách bằng dấu phẩy"
            />
            
            <FormField
              label="Giải thưởng"
              name="awards"
              value={formData.awards.join(', ')}
              onChange={(name, value) => handleTagsChange('awards', value)}
              placeholder="Giải nhất, Giải sáng tạo, etc."
              help="Nhập các giải thưởng, phân cách bằng dấu phẩy"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <LinkIcon className="h-5 w-5" />
              <span>Liên kết</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              label="URL Video demo"
              name="videoUrl"
              value={formData.videoUrl}
              onChange={handleChange}
              placeholder="https://youtube.com/watch?v=..."
              help="URL YouTube hoặc Vimeo"
            />
            
            <FormField
              label="URL GitHub"
              name="githubUrl"
              value={formData.githubUrl}
              onChange={handleChange}
              placeholder="https://github.com/username/repo"
            />
            
            <FormField
              label="URL Website"
              name="websiteUrl"
              value={formData.websiteUrl}
              onChange={handleChange}
              placeholder="https://example.com"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Image className="h-5 w-5" />
              <span>Hình ảnh</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <h3 className="mb-2 text-sm font-medium">Hình ảnh hiện tại</h3>
              {existingImages.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                  {existingImages.map((image, index) => (
                    <div key={index} className="relative h-32 bg-muted rounded-md overflow-hidden group">
                      <img 
                        src={image} 
                        alt={`Current ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeExistingImage(index)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground mb-4">Không có hình ảnh</div>
              )}

              <h3 className="mb-2 text-sm font-medium">Thêm hình ảnh mới</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
                {imagesPreview.length > 0 ? (
                  <>
                    {imagesPreview.map((preview, index) => (
                      <div key={index} className="relative h-32 bg-muted rounded-md overflow-hidden group">
                        <img 
                          src={preview} 
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeNewImage(index)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </div>
                    ))}
                    <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-muted-foreground/20 rounded-md cursor-pointer hover:border-muted-foreground/40 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground mb-2">
                        <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path>
                        <path d="M12 12v9"></path>
                        <path d="m16 16-4-4-4 4"></path>
                      </svg>
                      <span className="text-sm text-gray-500">Thêm hình ảnh khác</span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        multiple
                        onChange={handleImagesChange}
                      />
                    </label>
                  </>
                ) : (
                  <label className="flex flex-col items-center justify-center h-32 col-span-full border-2 border-dashed border-muted-foreground/20 rounded-md cursor-pointer hover:border-muted-foreground/40 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground mb-2">
                      <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path>
                      <path d="M12 12v9"></path>
                      <path d="m16 16-4-4-4 4"></path>
                    </svg>
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

export default ItemEditPage;