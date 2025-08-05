import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Users, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { apiService } from '../../../services/api';
import FormField from '../../../components/admin/ui/FormField';
import PageHeader from '../../../components/admin/ui/PageHeader';

const TeamCreatePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [contests, setContests] = useState([]);
  const [formData, setFormData] = useState({
    teamName: '',
    contestId: '',
    division: '',
    leaderName: '',
    email: '',
    phone: '',
    studentId: '',
    facebookLink: '',
    members: [
      {
        fullName: '',
        email: '',
        studentId: '',
        facebookLink: '',
      }
    ],
    status: 'approved',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    try {
      const response = await apiService.getAdminContests({ limit: 100 });
      setContests(response.data.data || []);
    } catch (error) {
      console.error('Error fetching contests:', error);
      setContests([]);
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

  const handleMemberChange = (index, field, value) => {
    const newMembers = [...formData.members];
    newMembers[index] = {
      ...newMembers[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      members: newMembers
    }));
  };

  const addMember = () => {
    if (formData.members.length < 4) { // Limit to 4 additional members
      setFormData(prev => ({
        ...prev,
        members: [
          ...prev.members,
          {
            fullName: '',
            email: '',
            studentId: '',
            facebookLink: '',
          }
        ]
      }));
    }
  };

  const removeMember = (index) => {
    if (formData.members.length > 0) {
      const newMembers = formData.members.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        members: newMembers
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.teamName?.trim()) {
      newErrors.teamName = 'Tên đội là bắt buộc';
    }
    
    if (!formData.contestId) {
      newErrors.contestId = 'Vui lòng chọn cuộc thi';
    }

    if (!formData.leaderName?.trim()) {
      newErrors.leaderName = 'Tên trưởng nhóm là bắt buộc';
    }
    
    if (!formData.email?.trim()) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
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
      
      // Filter out empty members
      const submissionData = {
        ...formData,
        members: formData.members.filter(member => member.fullName?.trim())
      };

      await apiService.createAdminTeam(submissionData);
      toast.success('Tạo đội thi thành công');
      navigate('/admin/teams');
    } catch (error) {
      console.error('Error creating team:', error);
      toast.error('Có lỗi khi tạo đội thi');
    } finally {
      setLoading(false);
    }
  };

  const pageActions = [
    {
      label: 'Quay lại',
      variant: 'outline',
      icon: ArrowLeft,
      onClick: () => navigate('/admin/teams'),
    },
    {
      label: 'Tạo đội thi',
      variant: 'default',
      icon: Save,
      onClick: handleSubmit,
      disabled: loading,
    },
  ];

  const contestOptions = contests.map(contest => ({
    value: contest._id,
    label: `${contest.name} (${contest.code})`
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tạo đội thi mới"
        description="Thêm đội thi mới vào hệ thống"
        actions={pageActions}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Thông tin đội thi */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Thông tin đội thi</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                label="Tên đội"
                name="teamName"
                value={formData.teamName}
                onChange={handleChange}
                error={errors.teamName}
                placeholder="Nhập tên đội thi"
                required
              />

              <FormField
                label="Cuộc thi"
                name="contestId"
                type="select"
                value={formData.contestId}
                onChange={handleChange}
                error={errors.contestId}
                options={contestOptions}
                placeholder="Chọn cuộc thi"
                required
              />

              <FormField
                label="Bảng thi"
                name="division"
                value={formData.division}
                onChange={handleChange}
                placeholder="Sinh viên, Chuyên nghiệp, ..."
              />

              <FormField
                label="Trạng thái"
                name="status"
                type="select"
                value={formData.status}
                onChange={handleChange}
                options={[
                  { value: 'pending', label: 'Chờ duyệt' },
                  { value: 'approved', label: 'Đã duyệt' },
                  { value: 'rejected', label: 'Từ chối' },
                ]}
              />
            </CardContent>
          </Card>

          {/* Thông tin trưởng nhóm */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin trưởng nhóm</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                label="Họ và tên"
                name="leaderName"
                value={formData.leaderName}
                onChange={handleChange}
                error={errors.leaderName}
                placeholder="Nhập họ và tên trưởng nhóm"
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
                placeholder="0123456789"
              />

              <FormField
                label="MSSV"
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                placeholder="Mã số sinh viên"
              />

              <FormField
                label="Link Facebook"
                name="facebookLink"
                type="url"
                value={formData.facebookLink}
                onChange={handleChange}
                placeholder="https://facebook.com/username"
              />
            </CardContent>
          </Card>
        </div>

        {/* Thành viên */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Thành viên</span>
              </CardTitle>
              {formData.members.length < 4 && (
                <Button type="button" variant="outline" size="sm" onClick={addMember}>
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm thành viên
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.members.map((member, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Thành viên {index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMember(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    label="Họ và tên"
                    value={member.fullName}
                    onChange={(_, value) => handleMemberChange(index, 'fullName', value)}
                    placeholder="Nhập họ và tên"
                  />

                  <FormField
                    label="MSSV"
                    value={member.studentId}
                    onChange={(_, value) => handleMemberChange(index, 'studentId', value)}
                    placeholder="Mã số sinh viên"
                  />

                  <FormField
                    label="Email"
                    type="email"
                    value={member.email}
                    onChange={(_, value) => handleMemberChange(index, 'email', value)}
                    placeholder="example@email.com"
                  />

                  <FormField
                    label="Link Facebook"
                    type="url"
                    value={member.facebookLink}
                    onChange={(_, value) => handleMemberChange(index, 'facebookLink', value)}
                    placeholder="https://facebook.com/username"
                  />
                </div>
              </div>
            ))}
            
            {formData.members.length === 0 && (
              <div className="text-center text-muted-foreground py-8 border-2 border-dashed rounded-lg">
                Chưa có thành viên nào. Click "Thêm thành viên" để thêm.
              </div>
            )}
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default TeamCreatePage;