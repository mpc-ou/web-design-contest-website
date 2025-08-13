import { useState, useEffect } from 'react';
import { Save, Palette, Globe, Image, Eye, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { toast } from 'sonner';
import { apiService } from '../../services/api';
import PageHeader from '../../components/admin/ui/PageHeader';

const SettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    home: {
      title: '',
      subtitle: '',
      description: '',
      logo: '',
      banner: ''
    },
    colors: {
      primary: '#3b82f6',
      secondary: '#64748b',
      accent: '#f59e0b',
      background: '#ffffff',
      text: '#1f2937'
    },
    seo: {
      title: '',
      description: '',
      keywords: '',
      favicon: ''
    },
    contact: {
      email: '',
      phone: '',
      address: '',
      social: {
        facebook: '',
        twitter: '',
        instagram: '',
        linkedin: ''
      }
    }
  });
  const [logoFile, setLogoFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [faviconFile, setFaviconFile] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCommonData();
      if (response.data) {
        setSettings(response.data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Không thể tải cài đặt');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const formData = new FormData();
      formData.append('code', 'main');
      
      // Append JSON data
      formData.append('home', JSON.stringify(settings.home));
      formData.append('colors', JSON.stringify(settings.colors));
      formData.append('seo', JSON.stringify(settings.seo));
      formData.append('contact', JSON.stringify(settings.contact));
      
      // Append files
      if (logoFile) formData.append('logo', logoFile);
      if (bannerFile) formData.append('banner', bannerFile);
      if (faviconFile) formData.append('favicon', faviconFile);
      
      await apiService.updateCommonData('main', formData);
      toast.success('Lưu cài đặt thành công');
      
      // Reset file states
      setLogoFile(null);
      setBannerFile(null);
      setFaviconFile(null);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Không thể lưu cài đặt');
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (field, file) => {
    if (field === 'logo') setLogoFile(file);
    else if (field === 'banner') setBannerFile(file);
    else if (field === 'favicon') setFaviconFile(file);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Cài đặt hệ thống"
          description="Quản lý cài đặt chung của website"
        />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cài đặt hệ thống"
        description="Quản lý cài đặt chung của website"
        actions={[
          {
            label: 'Lưu cài đặt',
            variant: 'default',
            icon: Save,
            onClick: handleSave,
            disabled: saving,
          },
        ]}
      />

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">Chung</TabsTrigger>
          <TabsTrigger value="appearance">Giao diện</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="contact">Liên hệ</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>Thông tin chung</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="homeTitle">Tiêu đề trang chủ</Label>
                  <Input
                    id="homeTitle"
                    value={settings.home.title}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      home: { ...prev.home, title: e.target.value }
                    }))}
                    placeholder="Web Design Contest"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="homeSubtitle">Phụ đề</Label>
                  <Input
                    id="homeSubtitle"
                    value={settings.home.subtitle}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      home: { ...prev.home, subtitle: e.target.value }
                    }))}
                    placeholder="Cuộc thi thiết kế web"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="homeDescription">Mô tả</Label>
                <Textarea
                  id="homeDescription"
                  value={settings.home.description}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    home: { ...prev.home, description: e.target.value }
                  }))}
                  placeholder="Mô tả về website..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Logo</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange('logo', e.target.files[0])}
                      className="w-full"
                    />
                    {settings.home.logo && (
                      <div className="mt-2">
                        <img src={settings.home.logo} alt="Current logo" className="h-16 object-contain" />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Banner</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange('banner', e.target.files[0])}
                      className="w-full"
                    />
                    {settings.home.banner && (
                      <div className="mt-2">
                        <img src={settings.home.banner} alt="Current banner" className="h-16 object-contain" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="h-5 w-5" />
                <span>Màu sắc</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Màu chính</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={settings.colors.primary}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        colors: { ...prev.colors, primary: e.target.value }
                      }))}
                      className="w-20 h-10"
                    />
                    <Input
                      value={settings.colors.primary}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        colors: { ...prev.colors, primary: e.target.value }
                      }))}
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Màu phụ</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={settings.colors.secondary}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        colors: { ...prev.colors, secondary: e.target.value }
                      }))}
                      className="w-20 h-10"
                    />
                    <Input
                      value={settings.colors.secondary}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        colors: { ...prev.colors, secondary: e.target.value }
                      }))}
                      placeholder="#64748b"
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="accentColor">Màu nhấn</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="accentColor"
                      type="color"
                      value={settings.colors.accent}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        colors: { ...prev.colors, accent: e.target.value }
                      }))}
                      className="w-20 h-10"
                    />
                    <Input
                      value={settings.colors.accent}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        colors: { ...prev.colors, accent: e.target.value }
                      }))}
                      placeholder="#f59e0b"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="backgroundColor">Màu nền</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="backgroundColor"
                      type="color"
                      value={settings.colors.background}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        colors: { ...prev.colors, background: e.target.value }
                      }))}
                      className="w-20 h-10"
                    />
                    <Input
                      value={settings.colors.background}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        colors: { ...prev.colors, background: e.target.value }
                      }))}
                      placeholder="#ffffff"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Settings */}
        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5" />
                <span>SEO & Meta</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seoTitle">Meta Title</Label>
                <Input
                  id="seoTitle"
                  value={settings.seo.title}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    seo: { ...prev.seo, title: e.target.value }
                  }))}
                  placeholder="Web Design Contest - Cuộc thi thiết kế web"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="seoDescription">Meta Description</Label>
                <Textarea
                  id="seoDescription"
                  value={settings.seo.description}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    seo: { ...prev.seo, description: e.target.value }
                  }))}
                  placeholder="Mô tả ngắn gọn về website..."
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="seoKeywords">Meta Keywords</Label>
                <Input
                  id="seoKeywords"
                  value={settings.seo.keywords}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    seo: { ...prev.seo, keywords: e.target.value }
                  }))}
                  placeholder="web design, contest, thiết kế web, cuộc thi"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Favicon</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('favicon', e.target.files[0])}
                    className="w-full"
                  />
                  {settings.seo.favicon && (
                    <div className="mt-2">
                      <img src={settings.seo.favicon} alt="Current favicon" className="h-8 w-8" />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Settings */}
        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Thông tin liên hệ</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={settings.contact.email}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      contact: { ...prev.contact, email: e.target.value }
                    }))}
                    placeholder="contact@example.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Số điện thoại</Label>
                  <Input
                    id="contactPhone"
                    value={settings.contact.phone}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      contact: { ...prev.contact, phone: e.target.value }
                    }))}
                    placeholder="+84 123 456 789"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contactAddress">Địa chỉ</Label>
                <Textarea
                  id="contactAddress"
                  value={settings.contact.address}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    contact: { ...prev.contact, address: e.target.value }
                  }))}
                  placeholder="Địa chỉ liên hệ..."
                  rows={2}
                />
              </div>
              
              <div className="space-y-4">
                <Label>Mạng xã hội</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input
                      id="facebook"
                      value={settings.contact.social.facebook}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        contact: {
                          ...prev.contact,
                          social: { ...prev.contact.social, facebook: e.target.value }
                        }
                      }))}
                      placeholder="https://facebook.com/..."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter</Label>
                    <Input
                      id="twitter"
                      value={settings.contact.social.twitter}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        contact: {
                          ...prev.contact,
                          social: { ...prev.contact.social, twitter: e.target.value }
                        }
                      }))}
                      placeholder="https://twitter.com/..."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      value={settings.contact.social.instagram}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        contact: {
                          ...prev.contact,
                          social: { ...prev.contact.social, instagram: e.target.value }
                        }
                      }))}
                      placeholder="https://instagram.com/..."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      value={settings.contact.social.linkedin}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        contact: {
                          ...prev.contact,
                          social: { ...prev.contact.social, linkedin: e.target.value }
                        }
                      }))}
                      placeholder="https://linkedin.com/..."
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
