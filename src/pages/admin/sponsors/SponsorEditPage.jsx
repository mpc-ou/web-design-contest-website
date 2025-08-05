import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Building } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { apiService } from '../../../services/api';
import FormField from '../../../components/admin/ui/FormField';
import PageHeader from '../../../components/admin/ui/PageHeader';
import LoadingCard from '../../../components/admin/ui/LoadingCard';

const SponsorEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    website: '',
    logo: '',
    description: '',
    tier: 'bronze',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchSponsor();
  }, [id]);

  const fetchSponsor = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAdminSponsor(id);
      const sponsor = response.data;
      setFormData({
        name: sponsor.name || '',
        website: sponsor.website || '',
        logo: sponsor.logo || '',
        description: sponsor.description || '',
        tier: sponsor.tier || 'bronze',
      });
    } catch (error) {
      toast.error('Có lỗi khi tải thông tin nhà tài trợ');
      navigate('/admin/sponsors');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      setErrors({ name: 'Tên công ty là bắt buộc' });
      return;
    }

    try {
      setSaving(true);
      await apiService.updateAdminSponsor(id, formData);
      toast.success('Cập nhật nhà tài trợ thành công');
      navigate(`/admin/sponsors/${id}`);
    } catch (error) {
      toast.error('Có lỗi khi cập nhật nhà tài trợ');
    } finally {
      setSaving(false);
    }
  };

  const pageActions = [
    {
      label: 'Quay lại',
      variant: 'outline',
      icon: ArrowLeft,
      onClick: () => navigate(`/admin/sponsors/${id}`),
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
    return <LoadingCard showHeader={true} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chỉnh sửa nhà tài trợ"
        description={`Cập nhật thông tin nhà tài trợ #${id}`}
        actions={pageActions}
      />

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="h-5 w-5" />
              <span>Thông tin nhà tài trợ</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              label="Tên công ty"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              required
            />
            <FormField
              label="Website"
              name="website"
              type="url"
              value={formData.website}
              onChange={handleChange}
            />
            <FormField
              label="Logo URL"
              name="logo"
              type="url"
              value={formData.logo}
              onChange={handleChange}
            />
            <FormField
              label="Mô tả"
              name="description"
              type="textarea"
              value={formData.description}
              onChange={handleChange}
            />
            <FormField
              label="Cấp độ"
              name="tier"
              type="select"
              value={formData.tier}
              onChange={handleChange}
              options={[
                { value: 'platinum', label: 'Platinum' },
                { value: 'gold', label: 'Gold' },
                { value: 'silver', label: 'Silver' },
                { value: 'bronze', label: 'Bronze' },
              ]}
            />
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default SponsorEditPage;