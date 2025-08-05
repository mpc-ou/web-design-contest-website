import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { apiService } from '../../../services/api';
import FormField from '../../../components/admin/ui/FormField';
import PageHeader from '../../../components/admin/ui/PageHeader';
import LoadingCard from '../../../components/admin/ui/LoadingCard';

const UserEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    studentId: '',
    facebookLink: '',
    school: '',
    department: '',
    class: '',
    role: 'user',
    isActive: true,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAdminUser(id);
      const user = response.data;
      
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        studentId: user.studentId || '',
        facebookLink: user.facebookLink || '',
        school: user.school || '',
        department: user.department || '',
        class: user.class || '',
        role: user.role || 'user',
        isActive: user.isActive ?? true,
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      toast.error('Có lỗi khi tải thông tin người dùng');
      navigate('/admin/users');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = 'Họ và tên là bắt buộc';
    }
    
    if (!formData.email?.trim()) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (formData.phone && !/^[0-9+\-\s()]+$/.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    if (formData.facebookLink && !formData.facebookLink.startsWith('http')) {
      newErrors.facebookLink = 'Link Facebook phải bắt đầu bằng http:// hoặc https://';
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
      await apiService.updateAdminUser(id, formData);
      toast.success('Cập nhật người dùng thành công');
      navigate(`/admin/users/${id}`);
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Có lỗi khi cập nhật người dùng');
    } finally {
      setSaving(false);
    }
  };

  const pageActions = [
    {
      label: 'Quay lại',
      variant: 'outline',
      icon: ArrowLeft,
      onClick: () => navigate(`/admin/users/${id}`),
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
        <div className="grid gap-6 md:grid-cols-2">
          <LoadingCard />
          <LoadingCard />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chỉnh sửa người dùng"
        description={`Cập nhật thông tin người dùng #${id}`}
        actions={pageActions}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Thông tin cơ bản */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Thông tin cơ bản</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                label="Họ và tên"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                placeholder="Nhập họ và tên"
                required
              />

              <FormField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="example@email.com"
                required
              />

              <FormField
                label="Số điện thoại"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                placeholder="0123456789"
              />

              <FormField
                label="MSSV"
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                error={errors.studentId}
                placeholder="Mã số sinh viên"
              />

              <FormField
                label="Link Facebook"
                name="facebookLink"
                type="url"
                value={formData.facebookLink}
                onChange={handleChange}
                error={errors.facebookLink}
                placeholder="https://facebook.com/username"
              />
            </CardContent>
          </Card>

          {/* Thông tin học tập & Cài đặt */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin học tập</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  label="Trường học"
                  name="school"
                  value={formData.school}
                  onChange={handleChange}
                  placeholder="Tên trường đại học"
                />

                <FormField
                  label="Khoa"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="Tên khoa"
                />

                <FormField
                  label="Lớp"
                  name="class"
                  value={formData.class}
                  onChange={handleChange}
                  placeholder="Tên lớp"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cài đặt tài khoản</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  label="Vai trò"
                  name="role"
                  type="select"
                  value={formData.role}
                  onChange={handleChange}
                  options={[
                    { value: 'user', label: 'Người dùng' },
                    { value: 'admin', label: 'Quản trị viên' },
                  ]}
                />

                <FormField
                  type="switch"
                  label="Kích hoạt tài khoản"
                  name="isActive"
                  value={formData.isActive}
                  onChange={handleChange}
                  description="Cho phép người dùng đăng nhập vào hệ thống"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UserEditPage;