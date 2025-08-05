import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { apiService } from '../../../services/api';
import FormField from '../../../components/admin/ui/FormField';
import PageHeader from '../../../components/admin/ui/PageHeader';

const FAQCreatePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'general',
    order: 1,
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
    
    if (!formData.question?.trim()) {
      newErrors.question = 'Câu hỏi là bắt buộc';
    }

    if (!formData.answer?.trim()) {
      newErrors.answer = 'Câu trả lời là bắt buộc';
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
      await apiService.createAdminFAQ(formData);
      toast.success('Tạo FAQ thành công');
      navigate('/admin/faqs');
    } catch (error) {
      console.error('Error creating FAQ:', error);
      toast.error('Có lỗi khi tạo FAQ');
    } finally {
      setLoading(false);
    }
  };

  const pageActions = [
    {
      label: 'Quay lại',
      variant: 'outline',
      icon: ArrowLeft,
      onClick: () => navigate('/admin/faqs'),
    },
    {
      label: 'Tạo FAQ',
      variant: 'default',
      icon: Save,
      onClick: handleSubmit,
      disabled: loading,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tạo FAQ mới"
        description="Thêm FAQ mới vào hệ thống"
        actions={pageActions}
      />

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <HelpCircle className="h-5 w-5" />
              <span>Thông tin FAQ</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              label="Câu hỏi"
              name="question"
              value={formData.question}
              onChange={handleChange}
              error={errors.question}
              placeholder="Nhập câu hỏi"
              required
            />

            <FormField
              label="Câu trả lời"
              name="answer"
              type="textarea"
              value={formData.answer}
              onChange={handleChange}
              error={errors.answer}
              placeholder="Nhập câu trả lời chi tiết"
              rows={5}
              required
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                label="Danh mục"
                name="category"
                type="select"
                value={formData.category}
                onChange={handleChange}
                options={[
                  { value: 'general', label: 'Chung' },
                  { value: 'registration', label: 'Đăng ký' },
                  { value: 'contest', label: 'Cuộc thi' },
                  { value: 'submission', label: 'Nộp bài' },
                  { value: 'technical', label: 'Kỹ thuật' },
                ]}
              />

              <FormField
                label="Thứ tự hiển thị"
                name="order"
                type="number"
                value={formData.order}
                onChange={handleChange}
                min="1"
              />
            </div>

            <FormField
              type="switch"
              label="Kích hoạt"
              name="isActive"
              value={formData.isActive}
              onChange={handleChange}
              description="Cho phép hiển thị FAQ này"
            />
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default FAQCreatePage;