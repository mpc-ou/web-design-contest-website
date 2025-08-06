import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Trophy, Calendar, Users, Plus, Trash2, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { apiService } from '../../../services/api';
import FormField from '../../../components/admin/ui/FormField';
import PageHeader from '../../../components/admin/ui/PageHeader';

const ContestCreatePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    category: '',
    thumbnail: null,
    images: [],
    timeline: {
      registrationStart: '',
      registrationEnd: '',
      contestStart: '', // Will be auto-calculated
      contestEnd: '', // Will be auto-calculated
    },
    rounds: [
      {
        name: 'Vòng loại',
        type: 'qualifying',
        startDate: '',
        endDate: '',
        order: 1,
        description: '',
        isActive: true,
      }
    ],
    divisions: [
      {
        name: 'Bảng A',
        description: 'Không dùng framework',
        maxTeams: '',
        maxMembers: 3,
        isActive: true,
      },
      {
        name: 'Bảng B',
        description: 'Dùng framework',
        maxTeams: '',
        maxMembers: 3,
        isActive: true,
      }
    ],
    isActive: true,
  });
  const [errors, setErrors] = useState({});

  // Auto-calculate contestStart and contestEnd based on rounds
  useEffect(() => {
    if (formData.rounds && formData.rounds.length > 0) {
      const validRounds = formData.rounds.filter(round => round.startDate && round.endDate);
      
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
        
        if (earliestStart && latestEnd) {
          setFormData(prev => ({
            ...prev,
            timeline: {
              ...prev.timeline,
              contestStart: earliestStart,
              contestEnd: latestEnd
            }
          }));
        }
      }
    }
  }, [formData.rounds]);

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

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleRoundChange = (index, field, value) => {
    const newRounds = [...formData.rounds];
    newRounds[index] = {
      ...newRounds[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      rounds: newRounds
    }));
  };

  const addRound = () => {
    setFormData(prev => ({
      ...prev,
      rounds: [
        ...prev.rounds,
        {
          name: '',
          type: 'qualifying',
          startDate: '',
          endDate: '',
          order: prev.rounds.length + 1,
          description: '',
          isActive: true,
        }
      ]
    }));
  };

  const removeRound = (index) => {
    if (formData.rounds.length > 1) {
      const newRounds = formData.rounds.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        rounds: newRounds
      }));
    }
  };

  const handleDivisionChange = (index, field, value) => {
    const newDivisions = [...formData.divisions];
    newDivisions[index] = {
      ...newDivisions[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      divisions: newDivisions
    }));
  };

  const addDivision = () => {
    setFormData(prev => ({
      ...prev,
      divisions: [
        ...prev.divisions,
        {
          name: '',
          description: '',
          maxTeams: '',
          maxMembers: '',
          isActive: true,
        }
      ]
    }));
  };

  const removeDivision = (index) => {
    if (formData.divisions.length > 1) {
      const newDivisions = formData.divisions.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        divisions: newDivisions
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = 'Tên cuộc thi là bắt buộc';
    }
    
    if (!formData.code?.trim()) {
      newErrors.code = 'Mã cuộc thi là bắt buộc';
    }

    // Validate timeline fields are required
    if (!formData.timeline.registrationStart?.trim()) {
      newErrors['timeline.registrationStart'] = 'Ngày bắt đầu đăng ký là bắt buộc';
    }
    
    if (!formData.timeline.registrationEnd?.trim()) {
      newErrors['timeline.registrationEnd'] = 'Ngày kết thúc đăng ký là bắt buộc';
    }

    // Validate contest timeline is auto-calculated
    if (!formData.timeline.contestStart?.trim()) {
      newErrors['timeline.contestStart'] = 'Vui lòng thiết lập thời gian cho ít nhất một vòng thi';
    }
    
    if (!formData.timeline.contestEnd?.trim()) {
      newErrors['timeline.contestEnd'] = 'Vui lòng thiết lập thời gian cho ít nhất một vòng thi';
    }

    // Validate timeline order
    if (formData.timeline.registrationStart && formData.timeline.registrationEnd) {
      if (new Date(formData.timeline.registrationStart) >= new Date(formData.timeline.registrationEnd)) {
        newErrors['timeline.registrationEnd'] = 'Ngày kết thúc đăng ký phải sau ngày bắt đầu';
      }
    }

    if (formData.timeline.registrationEnd && formData.timeline.contestStart) {
      if (new Date(formData.timeline.registrationEnd) > new Date(formData.timeline.contestStart)) {
        newErrors['timeline.contestStart'] = 'Cuộc thi phải bắt đầu sau khi đóng đăng ký';
      }
    }

    // Validate rounds have required data
    const invalidRounds = formData.rounds.some(round => !round.name?.trim() || !round.startDate || !round.endDate);
    if (invalidRounds) {
      newErrors.rounds = 'Tất cả vòng thi phải có tên và thời gian đầy đủ';
    }

    // Validate divisions have required data
    const invalidDivisions = formData.divisions.some(div => !div.name?.trim());
    if (invalidDivisions) {
      newErrors.divisions = 'Tất cả bảng thi phải có tên';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Vui lòng kiểm tra lại thông tin nhập vào', {
        description: 'Có một số trường bắt buộc chưa được điền đầy đủ'
      });
      return;
    }

    try {
      setLoading(true);
      
      // Hiển thị toast loading
      const loadingToast = toast.loading('Đang tạo cuộc thi...', {
        description: 'Vui lòng đợi trong giây lát'
      });

      const formDataToSend = new FormData();
      
      // Add form fields
      Object.keys(formData).forEach(key => {
        if (key === 'thumbnail' && formData[key]) {
          formDataToSend.append('thumbnail', formData[key]);
        } else if (key === 'images' || key === 'timeline' || key === 'rounds' || key === 'divisions') {
          // Skip these, will be handled separately
        } else if (formData[key] !== null && formData[key] !== undefined) {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      // Add images
      if (formData.images && formData.images.length > 0) {
        formData.images.forEach((image) => {
          formDataToSend.append(`images`, image);
        });
      }
      
      formDataToSend.append('timeline', JSON.stringify(formData.timeline));
      
      const cleanRounds = formData.rounds.map(round => ({
        ...round,
        order: parseInt(round.order),
      }));
      formDataToSend.append('rounds', JSON.stringify(cleanRounds));
      
      const cleanDivisions = formData.divisions.map(div => ({
        ...div,
        maxTeams: div.maxTeams ? parseInt(div.maxTeams) : 10,
        maxMembers: div.maxMembers ? parseInt(div.maxMembers) : 3,
      }));
      formDataToSend.append('divisions', JSON.stringify(cleanDivisions));

      const response = await apiService.createAdminContest(formDataToSend);
      
      if (!response || !response.data) {
        throw new Error('Không nhận được phản hồi hợp lệ từ máy chủ');
      }

      toast.dismiss(loadingToast);
      
      // Success toast với thông tin chi tiết
      toast.success('🎉 Tạo cuộc thi thành công!', {
        description: `Cuộc thi "${formData.name}" đã được tạo với mã ${formData.code}`,
        action: {
          label: 'Xem chi tiết',
          onClick: () => navigate(`/admin/contests/${formData.code}`)
        },
        duration: 6000,
      });
      
      // Delay redirect để user có thể thấy toast
      setTimeout(() => {
        navigate('/admin/contests');
      }, 1000);
      
    } catch (error) {
      console.error('Error creating contest:', error);
      
      const errorMessage = error.response?.data?.error || 'Có lỗi khi tạo cuộc thi';
      const errorCode = error.response?.status;
      
      toast.error('❌ Không thể tạo cuộc thi', {
        description: errorCode ? `${errorMessage} (Mã lỗi: ${errorCode})` : errorMessage,
        action: {
          label: 'Thử lại',
          onClick: () => handleSubmit(e)
        },
        duration: 6000,
      });
    } finally {
      setLoading(false);
    }
  };

  const pageActions = [
    {
      label: 'Quay lại',
      variant: 'outline',
      icon: ArrowLeft,
      onClick: () => navigate('/admin/contests'),
    },
    {
      label: 'Tạo cuộc thi',
      variant: 'default',
      icon: Save,
      onClick: handleSubmit,
      disabled: loading,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tạo cuộc thi mới"
        description="Thêm cuộc thi mới vào hệ thống"
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

            <FormField
              label="Thumbnail"
              name="thumbnail"
              type="file"
              value={formData.thumbnail}
              onChange={handleChange}
              description="Chọn ảnh thumbnail cho cuộc thi (khuyến nghị: 1200x600px)"
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
                {/* File upload */}
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

                {/* Preview uploaded images */}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
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
                error={errors['timeline.registrationStart']}
                required
              />

              <FormField
                label="Đóng đăng ký"
                name="timeline.registrationEnd"
                type="datetime-local"
                value={formData.timeline.registrationEnd}
                onChange={handleChange}
                error={errors['timeline.registrationEnd']}
                required
              />
            </div>

            {/* Auto-calculated contest timeline */}
            <div className={`p-4 rounded-lg border ${errors['timeline.contestStart'] || errors['timeline.contestEnd'] ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
              <h4 className={`font-medium mb-3 ${errors['timeline.contestStart'] || errors['timeline.contestEnd'] ? 'text-red-900' : 'text-blue-900'}`}>
                Thời gian cuộc thi (tự động tính toán)
              </h4>
              
              {(errors['timeline.contestStart'] || errors['timeline.contestEnd']) && (
                <div className="text-sm text-red-600 mb-3">
                  {errors['timeline.contestStart'] || errors['timeline.contestEnd']}
                </div>
              )}
              
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

        {/* Rounds */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-5 w-5" />
                <span>Các vòng thi</span>
              </CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addRound}>
                <Plus className="h-4 w-4 mr-2" />
                Thêm vòng thi
              </Button>
            </div>
            {errors.rounds && (
              <div className="text-sm text-red-600 mt-2">
                {errors.rounds}
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.rounds.map((round, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Vòng thi {index + 1}</h4>
                  {formData.rounds.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRound(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    label="Tên vòng thi"
                    value={round.name}
                    onChange={(_, value) => handleRoundChange(index, 'name', value)}
                    placeholder="Vòng loại, Bán kết, ..."
                  />

                  <FormField
                    label="Loại vòng thi"
                    type="select"
                    value={round.type}
                    onChange={(_, value) => handleRoundChange(index, 'type', value)}
                    options={[
                      { value: 'qualifying', label: 'Vòng loại' },
                      { value: 'semifinal', label: 'Bán kết' },
                      { value: 'final', label: 'Chung kết' },
                    ]}
                  />

                  <FormField
                    label="Ngày bắt đầu"
                    type="datetime-local"
                    value={round.startDate}
                    onChange={(_, value) => handleRoundChange(index, 'startDate', value)}
                  />

                  <FormField
                    label="Ngày kết thúc"
                    type="datetime-local"
                    value={round.endDate}
                    onChange={(_, value) => handleRoundChange(index, 'endDate', value)}
                  />

                  <FormField
                    label="Thứ tự"
                    type="number"
                    value={round.order}
                    onChange={(_, value) => handleRoundChange(index, 'order', value)}
                    min="1"
                  />

                  <FormField
                    type="switch"
                    label="Kích hoạt"
                    value={round.isActive}
                    onChange={(_, value) => handleRoundChange(index, 'isActive', value)}
                  />

                  <div className="md:col-span-2">
                    <FormField
                      label="Mô tả"
                      type="textarea"
                      value={round.description}
                      onChange={(_, value) => handleRoundChange(index, 'description', value)}
                      placeholder="Mô tả về vòng thi này"
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Divisions */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Bảng thi</span>
              </CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addDivision}>
                <Plus className="h-4 w-4 mr-2" />
                Thêm bảng thi
              </Button>
            </div>
            {errors.divisions && (
              <div className="text-sm text-red-600 mt-2">
                {errors.divisions}
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.divisions.map((division, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Bảng thi {index + 1}</h4>
                  {formData.divisions.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDivision(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    label="Tên bảng thi"
                    value={division.name}
                    onChange={(_, value) => handleDivisionChange(index, 'name', value)}
                    placeholder="Sinh viên, Chuyên nghiệp, ..."
                  />

                  <FormField
                    type="switch"
                    label="Kích hoạt"
                    value={division.isActive}
                    onChange={(_, value) => handleDivisionChange(index, 'isActive', value)}
                  />

                  <FormField
                    label="Số đội tối đa"
                    type="number"
                    value={division.maxTeams}
                    onChange={(_, value) => handleDivisionChange(index, 'maxTeams', value)}
                    placeholder="Để trống nếu không giới hạn"
                    min="1"
                  />

                  <FormField
                    label="Số thành viên tối đa"
                    type="number"
                    value={division.maxMembers}
                    onChange={(_, value) => handleDivisionChange(index, 'maxMembers', value)}
                    placeholder="3"
                    min="1"
                  />

                  <div className="md:col-span-2">
                    <FormField
                      label="Mô tả"
                      type="textarea"
                      value={division.description}
                      onChange={(_, value) => handleDivisionChange(index, 'description', value)}
                      placeholder="Mô tả về bảng thi này"
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default ContestCreatePage;