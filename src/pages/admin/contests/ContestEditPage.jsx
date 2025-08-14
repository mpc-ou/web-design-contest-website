import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Trophy, Calendar, Users, Plus, Trash2, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { apiService } from '../../../services/api';
import FormField from '../../../components/admin/ui/FormField';
import PageHeader from '../../../components/admin/ui/PageHeader';
import LoadingCard from '../../../components/admin/ui/LoadingCard';
import { Link } from 'react-router-dom';

const ContestEditPage = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    category: '',
    thumbnail: '',
    formLink: '', // New field for external registration form
    images: [], // New images to upload
    existingImages: [], // Existing images from server
    timeline: {
      registrationStart: '',
      registrationEnd: '',
      contestStart: '', // Will be read-only, calculated from rounds
      contestEnd: '', // Will be read-only, calculated from rounds
    },
    rounds: [],
    divisions: [],
    status: 'draft',
    isActive: true,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchContest();
  }, [code]);

  const fetchContest = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAdminContest(code);
      const contest = response.data;
      
      // Format dates for datetime-local input
      const formatDateTime = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toISOString().slice(0, 16);
      };

      // Auto-calculate contestStart and contestEnd from rounds
      const rounds = contest.rounds || [];
      const validRounds = rounds.filter(round => round.startDate && round.endDate);
      
      let calculatedContestStart = '';
      let calculatedContestEnd = '';
      
      if (validRounds.length > 0) {
        const earliestStart = validRounds.reduce((earliest, round) => {
          return !earliest || new Date(round.startDate) < new Date(earliest) 
            ? round.startDate 
            : earliest;
        }, null);
        
        const latestEnd = validRounds.reduce((latest, round) => {
          return !latest || new Date(round.endDate) > new Date(latest) 
            ? round.endDate 
            : latest;
        }, null);
        
        calculatedContestStart = formatDateTime(earliestStart);
        calculatedContestEnd = formatDateTime(latestEnd);
      }

      setFormData({
        name: contest.name || '',
        code: contest.code || '',
        description: contest.description || '',
        category: contest.category || '',
        thumbnail: contest.thumbnail || null,
        images: [], // New images to be uploaded
        existingImages: contest.images || [], // Existing images from server
        timeline: {
          registrationStart: formatDateTime(contest.timeline?.registrationStart),
          registrationEnd: formatDateTime(contest.timeline?.registrationEnd),
          contestStart: calculatedContestStart,
          contestEnd: calculatedContestEnd,
        },
        rounds: contest.rounds || [],
        divisions: contest.divisions || [],
        status: contest.status || 'draft',
        isActive: contest.isActive ?? true,
      });
    } catch (error) {
      console.error('Error fetching contest:', error);
      toast.error('Có lỗi khi tải thông tin cuộc thi');
      navigate('/admin/contests');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (name, value) => {
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImagesChange = (files) => {
    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...imageFiles]
    }));
  };

  const removeNewImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const removeExistingImage = (index) => {
    setFormData(prev => ({
      ...prev,
      existingImages: prev.existingImages.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = 'Tên cuộc thi là bắt buộc';
    }
    
    if (!formData.code?.trim()) {
      newErrors.code = 'Mã cuộc thi là bắt buộc';
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
      
      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Add basic fields
      formDataToSend.append('name', formData.name);
      formDataToSend.append('code', formData.code);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('status', formData.status);
      formDataToSend.append('isActive', formData.isActive);
      
      // Add thumbnail file if new file selected
      if (formData.thumbnail && typeof formData.thumbnail === 'object') {
        formDataToSend.append('thumbnail', formData.thumbnail);
      }
      
      // Add new images files if exist
      if (formData.images && formData.images.length > 0) {
        formData.images.forEach((image) => {
          formDataToSend.append(`images`, image);
        });
      }
      
      // Add existing images (as URLs to keep)
      formDataToSend.append('existingImages', JSON.stringify(formData.existingImages));
      
      // Add timeline as JSON
      formDataToSend.append('timeline', JSON.stringify(formData.timeline));
      
      await apiService.updateAdminContest(code, formDataToSend);
      toast.success('Cập nhật cuộc thi thành công');
      navigate(`/admin/contests/${code}`);
    } catch (error) {
      console.error('Error updating contest:', error);
      toast.error('Có lỗi khi cập nhật cuộc thi');
    } finally {
      setSaving(false);
    }
  };

  const pageActions = [
    {
      label: 'Quay lại',
      variant: 'outline',
      icon: ArrowLeft,
      onClick: () => navigate(`/admin/contests/${code}`),
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
        <LoadingCard />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chỉnh sửa cuộc thi"
        description={`Cập nhật thông tin cuộc thi ${formData.code}`}
        actions={pageActions}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Thông tin cơ bản */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5" />
              <span>Thông tin cơ bản</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField
              label="Tên cuộc thi"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              placeholder="Nhập tên cuộc thi"
              required
            />

            <FormField
              label="Mã cuộc thi"
              name="code"
              value={formData.code}
              onChange={handleChange}
              error={errors.code}
              placeholder="WDC2025"
              required
            />

            <FormField
              label="Danh mục"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="Web Design, Mobile App, ..."
            />

            <div className="md:col-span-2">
              <FormField
                label="Mô tả"
                name="description"
                type="textarea"
                value={formData.description}
                onChange={handleChange}
                placeholder="Mô tả chi tiết về cuộc thi"
                rows={4}
              />
            </div>

            <div className="md:col-span-2">
              <FormField
                label="Form bên thứ 3?"
                name="formLink"
                type="text"
                value={formData.formLink}
                onChange={handleChange}
                placeholder="Link đăng ký bên thứ 3 nếu có"
                rows={4}
                required={false}
              />
            </div>

            <FormField
              label="Thumbnail"
              name="thumbnail"
              type="file"
              value={formData.thumbnail}
              onChange={handleChange}
              description="Chọn ảnh mới hoặc giữ nguyên ảnh hiện tại"
            />

            <FormField
              type="switch"
              label="Kích hoạt cuộc thi"
              name="isActive"
              value={formData.isActive}
              onChange={handleChange}
              description="Cho phép hiển thị cuộc thi"
            />

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Hình ảnh cuộc thi
              </label>
              <div className="space-y-4">
                {/* Existing images */}
                {formData.existingImages.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Ảnh hiện tại</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {formData.existingImages.map((imageUrl, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={imageUrl}
                            alt={`Existing ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* File upload for new images */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Thêm ảnh mới</h4>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <ImageIcon className="w-8 h-8 mb-2 text-gray-500" />
                        <p className="text-sm text-gray-500">
                          <span className="font-semibold">Nhấp để tải lên</span> hoặc kéo thả nhiều ảnh
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF tối đa 10MB mỗi ảnh</p>
                      </div>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImagesChange(e.target.files)}
                      />
                    </label>
                  </div>
                </div>

                {/* Preview new images */}
                {formData.images.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Ảnh mới sẽ được thêm</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`New ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeNewImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                          <p className="text-xs text-gray-500 mt-1 truncate">
                            {image.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Timeline</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                label="Mở đăng ký"
                name="timeline.registrationStart"
                type="datetime-local"
                value={formData.timeline.registrationStart}
                onChange={handleChange}
              />

              <FormField
                label="Đóng đăng ký"
                name="timeline.registrationEnd"
                type="datetime-local"
                value={formData.timeline.registrationEnd}
                onChange={handleChange}
              />
            </div>

            {/* Auto-calculated contest timeline */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-3">Thời gian cuộc thi (tự động tính toán từ các vòng thi)</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bắt đầu cuộc thi
                  </label>
                  <div className="bg-white p-3 rounded border text-sm text-gray-600">
                    {formData.timeline.contestStart 
                      ? new Date(formData.timeline.contestStart).toLocaleString('vi-VN')
                      : 'Chưa có dữ liệu vòng thi'
                    }
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Được tính từ vòng thi có thời gian bắt đầu sớm nhất
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kết thúc cuộc thi
                  </label>
                  <div className="bg-white p-3 rounded border text-sm text-gray-600">
                    {formData.timeline.contestEnd 
                      ? new Date(formData.timeline.contestEnd).toLocaleString('vi-VN')
                      : 'Chưa có dữ liệu vòng thi'
                    }
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Được tính từ vòng thi có thời gian kết thúc muộn nhất
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Note about rounds and divisions */}
        <Card>
          <CardHeader>
            <CardTitle>Lưu ý</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>• Để chỉnh sửa các vòng thi và bảng thi chi tiết, vui lòng sử dụng giao diện riêng biệt.</p>
              <p>• Các thay đổi về timeline có thể ảnh hưởng đến lịch trình các vòng thi.</p>
              <p>• Thay đổi trạng thái cuộc thi sẽ ảnh hưởng đến khả năng đăng ký của người dùng.</p>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default ContestEditPage;