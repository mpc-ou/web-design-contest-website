import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

const ProfileEditPage = () => {
  const navigate = useNavigate();
  const { currentUser, userInfo } = useAuth();
  const [loading, setLoading] = useState(false);

  useDocumentMeta({
    title: "Chỉnh sửa hồ sơ - Cuộc thi thiết kế web",
    description: "Cập nhật thông tin cá nhân của bạn"
  });
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    studentId: '',
    facebookLink: '',
    school: '',
    department: '',
    class: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (userInfo) {
      setFormData({
        name: userInfo.name || userInfo.displayName || '',
        phone: userInfo.phone || '',
        studentId: userInfo.studentId || '',
        facebookLink: userInfo.facebookLink || '',
        school: userInfo.school || '',
        department: userInfo.department || '',
        class: userInfo.class || '',
      });
    }
  }, [userInfo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
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
      setLoading(true);
      await apiService.updateProfile(formData);
      toast.success('Cập nhật thông tin thành công');
      navigate('/profile');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Có lỗi khi cập nhật thông tin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/profile')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Chỉnh sửa thông tin</h1>
            <p className="text-muted-foreground">Cập nhật thông tin cá nhân của bạn</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Thông tin cơ bản */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Thông tin cơ bản</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Họ và tên <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                    errors.name ? 'border-destructive' : ''
                  }`}
                  placeholder="Nhập họ và tên"
                />
                {errors.name && (
                  <div className="text-sm text-destructive">{errors.name}</div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={currentUser?.email || ''}
                  disabled
                  className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
                />
                <div className="text-xs text-muted-foreground">
                  Email không thể thay đổi
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Số điện thoại</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                    errors.phone ? 'border-destructive' : ''
                  }`}
                  placeholder="0123456789"
                />
                {errors.phone && (
                  <div className="text-sm text-destructive">{errors.phone}</div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">MSSV</label>
                <input
                  type="text"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Mã số sinh viên"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Link Facebook</label>
                <input
                  type="url"
                  name="facebookLink"
                  value={formData.facebookLink}
                  onChange={handleChange}
                  className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                    errors.facebookLink ? 'border-destructive' : ''
                  }`}
                  placeholder="https://facebook.com/username"
                />
                {errors.facebookLink && (
                  <div className="text-sm text-destructive">{errors.facebookLink}</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Thông tin học tập */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin học tập</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Trường học</label>
                <input
                  type="text"
                  name="school"
                  value={formData.school}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Tên trường đại học"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Khoa</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Tên khoa"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Lớp</label>
                <input
                  type="text"
                  name="class"
                  value={formData.class}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Tên lớp"
                />
              </div>
            </CardContent>
          </Card>

          {/* Buttons */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/profile')}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Lưu thay đổi
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditPage;