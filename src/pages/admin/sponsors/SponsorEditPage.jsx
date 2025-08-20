import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Building, Upload, X } from 'lucide-react';
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
    description: '',
    tier: 'bronze',
  });
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
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
        description: sponsor.description || '',
        tier: sponsor.tier || 'bronze',
      });
      
      // Set existing logo preview if available
      if (sponsor.logo) {
        setLogoPreview(sponsor.logo);
      }
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

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogo(null);
    setLogoPreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      setErrors({ name: 'Tên công ty là bắt buộc' });
      return;
    }

    try {
      setSaving(true);
      
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
          submitData.append(key, formData[key]);
        }
      });
      
      if (logo) {
        submitData.append('logo', logo);
      }
      
      await apiService.updateAdminSponsor(id, submitData);
      toast.success('Cập nhật nhà tài trợ thành công');
      navigate('/admin/sponsors');
    } catch (error) {
      toast.error('Có lỗi khi cập nhật nhà tài trợ: ' + (error.response?.data?.error || error.message));
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
            {/* Logo Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Logo</label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                {logoPreview ? (
                  <div className="relative">
                    <img 
                      src={logoPreview} 
                      alt="Logo preview" 
                      className="w-full h-48 object-contain rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={removeLogo}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-48 cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Click để upload logo mới</span>
                    <span className="text-xs text-gray-400 mt-1">PNG, JPG, GIF với nền trong suốt (khuyến nghị)</span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleLogoChange}
                    />
                  </label>
                )}
              </div>
            </div>
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