import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, Upload, X, Calendar, Target, Trophy, Info } from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '../../../services/api';
import PageHeader from '../../../components/admin/ui/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const MinigameCreatePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [contests, setContests] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    contest: '',
    maxNumber: 100,
    startTime: '',
    endTime: '',
    maxWinners: 1,
    isActive: true,
    prizes: []
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchContests();
    // Set default times
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);

    setFormData(prev => ({
      ...prev,
      startTime: tomorrow.toISOString().slice(0, 16),
      endTime: nextWeek.toISOString().slice(0, 16)
    }));
  }, []);

  const fetchContests = async () => {
    try {
      const response = await apiService.getAdminContests();
      setContests(response.data.contests || []);
    } catch (error) {
      console.error('Error fetching contests:', error);
      toast.error('Không thể tải danh sách cuộc thi');
    }
  };

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Kích thước file không được vượt quá 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('Vui lòng chọn file hình ảnh');
        return;
      }
      
      setThumbnail(file);
      const reader = new FileReader();
      reader.onload = (e) => setThumbnailPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeThumbnail = () => {
    setThumbnail(null);
    setThumbnailPreview('');
  };

  const addPrize = () => {
    setFormData(prev => ({
      ...prev,
      prizes: [...prev.prizes, {
        type: 'voucher',
        name: '',
        description: '',
        amount: 1,
        image: null
      }]
    }));
  };

  const updatePrize = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      prizes: prev.prizes.map((prize, i) => 
        i === index ? { ...prize, [field]: value } : prize
      )
    }));
  };

  const removePrize = (index) => {
    setFormData(prev => ({
      ...prev,
      prizes: prev.prizes.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Tên minigame là bắt buộc';
    if (!formData.contest) newErrors.contest = 'Vui lòng chọn cuộc thi';
    if (!formData.maxNumber || formData.maxNumber < 1) newErrors.maxNumber = 'Số lượng tối đa phải lớn hơn 0';
    if (!formData.startTime) newErrors.startTime = 'Thời gian bắt đầu là bắt buộc';
    if (!formData.endTime) newErrors.endTime = 'Thời gian kết thúc là bắt buộc';
    
    if (formData.startTime && formData.endTime) {
      const startDate = new Date(formData.startTime);
      const endDate = new Date(formData.endTime);
      
      if (startDate >= endDate) {
        newErrors.endTime = 'Thời gian kết thúc phải sau thời gian bắt đầu';
      }
      
      if (startDate < new Date()) {
        newErrors.startTime = 'Thời gian bắt đầu không thể là quá khứ';
      }
    }
    
    if (formData.maxWinners < 1) newErrors.maxWinners = 'Số người thắng tối đa phải lớn hơn 0';
    if (formData.maxWinners > formData.maxNumber) {
      newErrors.maxWinners = 'Số người thắng không thể lớn hơn tổng số vé';
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
      
      const submitData = {
        ...formData,
        thumbnail
      };

      await apiService.createAdminMinigame(submitData);
      toast.success('Tạo minigame thành công!');
      navigate('/admin/minigames');
    } catch (error) {
      console.error('Error creating minigame:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi tạo minigame');
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
      label: loading ? 'Đang tạo...' : 'Tạo minigame',
      variant: 'default',
      icon: Save,
      onClick: handleSubmit,
      disabled: loading,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tạo Minigame Mới"
        description="Tạo trò chơi quay số may mắn mới cho người dùng tham gia"
        actions={pageActions}
      />

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Minigame sẽ được tạo với loại "Lucky Number" - người dùng sẽ chọn số may mắn để tham gia quay thưởng.
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Information */}
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Thông tin cơ bản
                </CardTitle>
                <CardDescription>Thông tin chính của minigame</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Tên minigame *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="VD: Quay số may mắn..."
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contest">Cuộc thi *</Label>
                    <Select value={formData.contest} onValueChange={(value) => handleChange('contest', value)}>
                      <SelectTrigger className={errors.contest ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Chọn cuộc thi" />
                      </SelectTrigger>
                      <SelectContent>
                        {contests.map((contest) => (
                          <SelectItem key={contest._id} value={contest._id}>
                            {contest.name} ({contest.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.contest && <p className="text-sm text-red-500">{errors.contest}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Mô tả</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Mô tả về minigame và cách thức tham gia..."
                    rows={4}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => handleChange('isActive', checked)}
                  />
                  <Label htmlFor="isActive">Kích hoạt ngay sau khi tạo</Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Cấu hình thời gian
                </CardTitle>
                <CardDescription>Thời gian diễn ra minigame</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Thời gian bắt đầu *</Label>
                    <Input
                      id="startTime"
                      type="datetime-local"
                      value={formData.startTime}
                      onChange={(e) => handleChange('startTime', e.target.value)}
                      className={errors.startTime ? 'border-red-500' : ''}
                    />
                    {errors.startTime && <p className="text-sm text-red-500">{errors.startTime}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endTime">Thời gian kết thúc *</Label>
                    <Input
                      id="endTime"
                      type="datetime-local"
                      value={formData.endTime}
                      onChange={(e) => handleChange('endTime', e.target.value)}
                      className={errors.endTime ? 'border-red-500' : ''}
                    />
                    {errors.endTime && <p className="text-sm text-red-500">{errors.endTime}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Cấu hình số lượng
                </CardTitle>
                <CardDescription>Thiết lập số lượng vé và người thắng</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxNumber">Số lượng tối đa *</Label>
                    <Input
                      id="maxNumber"
                      type="number"
                      min="1"
                      max="10000"
                      value={formData.maxNumber}
                      onChange={(e) => handleChange('maxNumber', parseInt(e.target.value))}
                      className={errors.maxNumber ? 'border-red-500' : ''}
                    />
                    <p className="text-xs text-muted-foreground">
                      Tổng số vé có thể tham gia (từ 1 đến {formData.maxNumber})
                    </p>
                    {errors.maxNumber && <p className="text-sm text-red-500">{errors.maxNumber}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxWinners">Số người thắng tối đa *</Label>
                    <Input
                      id="maxWinners"
                      type="number"
                      min="1"
                      max={formData.maxNumber}
                      value={formData.maxWinners}
                      onChange={(e) => handleChange('maxWinners', parseInt(e.target.value))}
                      className={errors.maxWinners ? 'border-red-500' : ''}
                    />
                    <p className="text-xs text-muted-foreground">
                      Số người có thể thắng giải trong lần quay
                    </p>
                    {errors.maxWinners && <p className="text-sm text-red-500">{errors.maxWinners}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Prizes Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5" />
                      Giải thưởng
                    </CardTitle>
                    <CardDescription>Cấu hình các giải thưởng cho minigame</CardDescription>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addPrize}>
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm giải
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.prizes.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg">
                    <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">Chưa có giải thưởng nào</p>
                    <Button type="button" variant="outline" size="sm" onClick={addPrize}>
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm giải thưởng đầu tiên
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.prizes.map((prize, index) => (
                      <Card key={index} className="border border-dashed">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-4">
                            <Badge variant="outline" className="bg-primary/10">
                              Giải {index + 1}
                            </Badge>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removePrize(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Loại giải thưởng</Label>
                              <Select 
                                value={prize.type} 
                                onValueChange={(value) => updatePrize(index, 'type', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Chọn loại giải" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="voucher">🎟️ Voucher</SelectItem>
                                  <SelectItem value="cash">💰 Tiền mặt</SelectItem>
                                  <SelectItem value="product">📱 Sản phẩm</SelectItem>
                                  <SelectItem value="other">🎁 Khác</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Số lượng</Label>
                              <Input
                                type="number"
                                min="1"
                                value={prize.amount}
                                onChange={(e) => updatePrize(index, 'amount', parseInt(e.target.value))}
                                placeholder="1"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Tên giải thưởng</Label>
                              <Input
                                value={prize.name}
                                onChange={(e) => updatePrize(index, 'name', e.target.value)}
                                placeholder="VD: iPhone 15 Pro Max"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Mô tả</Label>
                              <Input
                                value={prize.description}
                                onChange={(e) => updatePrize(index, 'description', e.target.value)}
                                placeholder="Mô tả chi tiết về giải thưởng"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Thumbnail */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Hình ảnh thumbnail</CardTitle>
                <CardDescription>Hình ảnh đại diện cho minigame</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {thumbnailPreview ? (
                  <div className="relative">
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="w-full aspect-video object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={removeThumbnail}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-muted-foreground/50" />
                      <div className="mt-4">
                        <Label htmlFor="thumbnail" className="cursor-pointer">
                          <span className="mt-2 block text-sm font-medium text-muted-foreground">
                            Nhấp để tải lên hình ảnh
                          </span>
                        </Label>
                        <Input
                          id="thumbnail"
                          type="file"
                          accept="image/*"
                          onChange={handleThumbnailChange}
                          className="hidden"
                        />
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        PNG, JPG, GIF tối đa 5MB<br />
                        Tỷ lệ khuyến nghị: 16:9
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Preview Card */}
            <Card>
              <CardHeader>
                <CardTitle>Xem trước</CardTitle>
                <CardDescription>Minigame sẽ hiển thị như thế này</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-3 space-y-2">
                  <div className="font-medium">{formData.name || 'Tên minigame'}</div>
                  <div className="text-sm text-muted-foreground line-clamp-2">
                    {formData.description || 'Mô tả minigame...'}
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Badge variant="outline">
                      {formData.maxNumber} vé
                    </Badge>
                    <Badge variant="secondary">
                      {formData.maxWinners} người thắng
                    </Badge>
                  </div>
                  {formData.prizes.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      🏆 {formData.prizes.length} giải thưởng
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};

export default MinigameCreatePage;