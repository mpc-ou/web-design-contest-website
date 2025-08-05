import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Gamepad2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { apiService } from '../../../services/api';
import FormField from '../../../components/admin/ui/FormField';
import PageHeader from '../../../components/admin/ui/PageHeader';

const MinigameCreatePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'lucky_number',
    prizeCount: 1,
    rules: '',
    startTime: '',
    endTime: '',
    isActive: true,
  });
  const [errors, setErrors] = useState({});

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = 'Tên minigame là bắt buộc';
    }

    if (formData.prizeCount < 1) {
      newErrors.prizeCount = 'Số lượng giải phải lớn hơn 0';
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
      await apiService.createAdminMinigame(formData);
      toast.success('Tạo minigame thành công');
      navigate('/admin/minigames');
    } catch (error) {
      console.error('Error creating minigame:', error);
      toast.error('Có lỗi khi tạo minigame');
    } finally {
      setLoading(false);
    }
  };

  const pageActions = [
    {
      label: 'Quay lại',
      variant: 'outline',
      icon: ArrowLeft,
      onClick: () => navigate('/admin/minigames'),
    },
    {
      label: 'Tạo minigame',
      variant: 'default',
      icon: Save,
      onClick: handleSubmit,
      disabled: loading,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tạo minigame mới"
        description="Thêm minigame mới vào hệ thống"
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
                label="Loại game"
                name="type"
                type="select"
                value={formData.type}
                onChange={handleChange}
                options={[
                  { value: 'lucky_number', label: 'Lucky Number' },
                  { value: 'quiz', label: 'Quiz' },
                  { value: 'spin_wheel', label: 'Spin Wheel' },
                  { value: 'scratch_card', label: 'Scratch Card' },
                ]}
              />

              <FormField
                label="Số lượng giải"
                name="prizeCount"
                type="number"
                value={formData.prizeCount}
                onChange={handleChange}
                error={errors.prizeCount}
                min="1"
                required
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

            <FormField
              label="Điều kiện tham gia"
              name="rules"
              type="textarea"
              value={formData.rules}
              onChange={handleChange}
              placeholder="Quy tắc và điều kiện để tham gia minigame"
              rows={4}
            />
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default MinigameCreatePage;