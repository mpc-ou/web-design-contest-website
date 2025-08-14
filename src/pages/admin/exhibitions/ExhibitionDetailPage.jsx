import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Image, ExternalLink, Plus, MoreHorizontal, Calendar, Tag, Info, MapPin, Building, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { apiService } from '../../../services/api';
import DetailCard from '../../../components/admin/ui/DetailCard';
import LoadingCard from '../../../components/admin/ui/LoadingCard';
import PageHeader from '../../../components/admin/ui/PageHeader';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

const ExhibitionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exhibition, setExhibition] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingItems, setLoadingItems] = useState(true);
  const [pagination, setPagination] = useState({ currentPage: 1, pageCount: 1, hasNext: false });

  useEffect(() => {
    fetchExhibitionDetail();
  }, [id]);

  useEffect(() => {
    if (exhibition) {
      fetchExhibitionItems();
    }
  }, [exhibition]);

  const fetchExhibitionDetail = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAdminExhibition(id);
      setExhibition(response.data);
    } catch (error) {
      console.error('Error fetching exhibition:', error);
      toast.error('Có lỗi khi tải thông tin triển lãm');
      navigate('/admin/exhibitions');
    } finally {
      setLoading(false);
    }
  };

  const fetchExhibitionItems = async (page = 1) => {
    try {
      setLoadingItems(true);
      if (typeof apiService.getExhibitionItems !== 'function') {
        throw new Error("API function getExhibitionItems is not defined");
      }
      
      const response = await apiService.getExhibitionItems(id, { page, limit: 20 });
      
      const itemsData = response.data.items || response.data || [];
      const paginationData = response.data.pagination || { currentPage: 1, pageCount: 1, hasNext: false };
      
      if (page === 1) {
        setItems(itemsData);
      } else {
        setItems(prev => [...prev, ...itemsData]);
      }
      
      setPagination(paginationData);
    } catch (error) {
      console.error('Error fetching exhibition items:', error);
      toast.error(`Có lỗi khi tải các tác phẩm triển lãm: ${error.message || 'Unknown error'}`);
    } finally {
      setLoadingItems(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa triển lãm này?')) {
      try {
        await apiService.deleteAdminExhibition(id);
        toast.success('Xóa triển lãm thành công');
        navigate('/admin/exhibitions');
      } catch (error) {
        toast.error('Có lỗi xảy ra');
      }
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tác phẩm này?')) {
      try {
        await apiService.deleteAdminExhibitionItem(id, itemId);
        toast.success('Xóa tác phẩm thành công');
        setItems(prev => prev.filter(item => item._id !== itemId));
      } catch (error) {
        toast.error('Có lỗi khi xóa tác phẩm');
      }
    }
  };

  const loadMoreItems = () => {
    if (pagination.hasNext) {
      fetchExhibitionItems(pagination.currentPage + 1);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const pageActions = [
    {
      label: 'Quay lại',
      variant: 'outline',
      icon: ArrowLeft,
      onClick: () => navigate('/admin/exhibitions'),
    },
    {
      label: 'Thêm tác phẩm',
      variant: 'default',
      icon: Plus,
      onClick: () => navigate(`/admin/exhibitions/${id}/items/create`),
    },
    {
      label: 'Chỉnh sửa',
      variant: 'default',
      icon: Edit,
      onClick: () => navigate(`/admin/exhibitions/${id}/edit`),
    },
    {
      label: 'Xóa',
      variant: 'destructive',
      icon: Trash2,
      onClick: handleDelete,
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingCard showHeader={true} />
        <LoadingCard />
      </div>
    );
  }

  if (!exhibition) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Không tìm thấy triển lãm"
          description="Triển lãm bạn đang tìm kiếm không tồn tại."
          actions={[{
            label: 'Quay lại',
            variant: 'outline',
            icon: ArrowLeft,
            onClick: () => navigate('/admin/exhibitions'),
          }]}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:px-4 max-w-full overflow-hidden">
      <PageHeader
        title={exhibition.title}
        description={`Chi tiết triển lãm #${exhibition._id}`}
        actions={pageActions}
      />

      <Tabs defaultValue="details" className="space-y-6 max-w-full">
        <TabsList>
          <TabsTrigger value="details">Thông tin triển lãm</TabsTrigger>
          <TabsTrigger value="items">Tác phẩm ({items.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6 max-w-full">
          <div className="grid gap-6 md:grid-cols-2 max-w-full">
            {/* Thông tin cơ bản */}
            <Card className="max-w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Thông tin cơ bản
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-[120px_1fr] gap-2">
                  <span className="font-medium">Tiêu đề:</span>
                  <span className="break-words min-w-0">{exhibition.title}</span>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-2">
                  <span className="font-medium">Mô tả:</span>
                  <p className="whitespace-pre-wrap break-words min-w-0">{exhibition.description}</p>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-2">
                  <span className="font-medium">Trạng thái:</span>
                  <Badge variant={exhibition.isPublic ? 'default' : 'outline'}>
                    {exhibition.isPublic ? 'Công khai' : 'Riêng tư'}
                  </Badge>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-2">
                  <span className="font-medium">Cuộc thi:</span>
                  <span className="break-words min-w-0">{exhibition.contest?.name || exhibition.contest?.code || 'N/A'}</span>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-2">
                  <span className="font-medium">Lượt xem:</span>
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    <span>{exhibition.viewCount || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Thời gian & địa điểm */}
            <Card className="max-w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Thời gian & địa điểm
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-[120px_1fr] gap-2">
                  <span className="font-medium">Bắt đầu:</span>
                  <span className="break-words min-w-0">{formatDate(exhibition.startDate)}</span>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-2">
                  <span className="font-medium">Kết thúc:</span>
                  <span className="break-words min-w-0">{formatDate(exhibition.endDate)}</span>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-2">
                  <span className="font-medium">Địa điểm:</span>
                  <div className="flex items-center min-w-0">
                    <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="break-words min-w-0">{exhibition.location || 'N/A'}</span>
                  </div>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-2">
                  <span className="font-medium">Đơn vị tổ chức:</span>
                  <div className="flex items-center min-w-0">
                    <Building className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="break-words min-w-0">{exhibition.organizer || 'N/A'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Thẻ */}
            <Card className="max-w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Thẻ
                </CardTitle>
              </CardHeader>
              <CardContent>
                {exhibition.tags && exhibition.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2 max-w-full">
                    {exhibition.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="break-words">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Không có thẻ nào</p>
                )}
              </CardContent>
            </Card>

            {/* Thông tin thời gian */}
            <Card className="max-w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Thông tin hệ thống
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-[120px_1fr] gap-2">
                  <span className="font-medium">ID:</span>
                  <span className="font-mono text-sm break-all min-w-0">{exhibition._id}</span>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-2">
                  <span className="font-medium">Ngày tạo:</span>
                  <span className="break-words min-w-0">{formatDate(exhibition.createdAt)}</span>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-2">
                  <span className="font-medium">Cập nhật lúc:</span>
                  <span className="break-words min-w-0">{formatDate(exhibition.updatedAt)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Thumbnail và Banner */}
          <div className="grid gap-6 md:grid-cols-2 max-w-full">
            {/* Thumbnail */}
            <Card className="max-w-full overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Hình thu nhỏ
                </CardTitle>
              </CardHeader>
              <CardContent className="max-w-full">
                {exhibition.thumbnail ? (
                  <div className="w-full max-w-full overflow-hidden">
                    <div className="rounded-md border w-full max-w-full overflow-hidden">
                      <img 
                        src={exhibition.thumbnail} 
                        alt="Thumbnail"
                        className="w-full h-auto max-w-full object-contain"
                        style={{ maxHeight: '400px' }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-40 bg-muted rounded-md border">
                    <Image className="h-10 w-10 text-muted-foreground opacity-50" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Banner */}
            <Card className="max-w-full overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Banner
                </CardTitle>
              </CardHeader>
              <CardContent className="max-w-full">
                {exhibition.bannerImage ? (
                  <div className="w-full max-w-full overflow-hidden">
                    <div className="rounded-md border w-full max-w-full overflow-hidden">
                      <img 
                        src={exhibition.bannerImage} 
                        alt="Banner"
                        className="w-full h-auto max-w-full object-contain"
                        style={{ maxHeight: '400px' }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-40 bg-muted rounded-md border">
                    <Image className="h-10 w-10 text-muted-foreground opacity-50" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="items" className="space-y-4 max-w-full">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Danh sách tác phẩm</h3>
            <Button onClick={() => navigate(`/admin/exhibitions/${id}/items/create`)}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm tác phẩm
            </Button>
          </div>

          {loadingItems ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-w-full">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden max-w-full">
                  <div className="aspect-video bg-muted animate-pulse"></div>
                  <CardHeader>
                    <div className="h-4 bg-muted rounded animate-pulse mb-2"></div>
                    <div className="h-3 bg-muted rounded animate-pulse w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-3 bg-muted rounded animate-pulse mb-2"></div>
                    <div className="h-3 bg-muted rounded animate-pulse w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : items.length > 0 ? (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 w-full max-w-full">
                {items.map((item) => (
                  <Card key={item._id} className="overflow-hidden max-w-full group">
                    <div className="relative aspect-video bg-muted overflow-hidden w-full">
                      {item.images && item.images.length > 0 ? (
                        <img 
                          src={item.images[0]} 
                          alt={item.title}
                          className="w-full h-full object-cover object-center"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Image className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <Button 
                        variant="secondary" 
                        size="sm"
                        className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => navigate(`/admin/exhibitions/${id}/items/${item._id}`)}
                      >
                        Xem chi tiết
                      </Button>
                    </div>
                    
                    <CardHeader className="p-4">
                      <div className="flex justify-between items-start min-w-0">
                        <CardTitle className="text-lg truncate min-w-0 pr-2" title={item.title}>
                          {item.title}
                        </CardTitle>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => navigate(`/admin/exhibitions/${id}/items/${item._id}`)}
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => navigate(`/admin/exhibitions/${id}/items/${item._id}/edit`)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDeleteItem(item._id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      {item.teamName && (
                        <CardDescription className="font-medium break-words">
                          Team: {item.teamName}
                        </CardDescription>
                      )}
                    </CardHeader>
                    
                    <CardContent className="p-4 pt-0">
                      <p className="text-sm text-muted-foreground line-clamp-2 break-words">
                        {item.description}
                      </p>
                      {item.technologies && item.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2 max-w-full">
                          {item.technologies.slice(0, 3).map((tech, i) => (
                            <span key={i} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-secondary break-words">
                              {tech}
                            </span>
                          ))}
                          {item.technologies.length > 3 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-secondary">
                              +{item.technologies.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </CardContent>
                    
                    <CardFooter className="p-4 pt-0 flex justify-between gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/admin/exhibitions/${id}/items/${item._id}/edit`)}
                        className="flex-shrink-0"
                      >
                        <Edit className="h-3 w-3 mr-2" />
                        Sửa
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/admin/exhibitions/${id}/items/${item._id}`)}
                        className="flex-shrink-0"
                      >
                        Chi tiết
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              {pagination.hasNext && (
                <div className="flex justify-center mt-6">
                  <Button variant="outline" onClick={loadMoreItems}>
                    Tải thêm tác phẩm
                  </Button>
                </div>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Image className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Chưa có tác phẩm nào</h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  Triển lãm này chưa có tác phẩm nào. Hãy thêm tác phẩm để hiển thị trong triển lãm.
                </p>
                <Button onClick={() => navigate(`/admin/exhibitions/${id}/items/create`)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm tác phẩm
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExhibitionDetailPage;