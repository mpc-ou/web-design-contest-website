import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { PhotoIcon, EyeIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { apiService } from '../../services/api';

const ExhibitionSection = () => {
  const [exhibitions, setExhibitions] = useState([]);
  const [selectedExhibition, setSelectedExhibition] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExhibitions();
  }, []);

  const fetchExhibitions = async () => {
    try {
      const response = await apiService.getExhibitions({ perPage: 6 });
      setExhibitions(response.data.exhibitions || []);
    } catch (error) {
      console.error('Error fetching exhibitions:', error);
      toast.error('Không thể tải triển lãm. Vui lòng thử lại sau.');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (exhibition) => {
    setSelectedExhibition(exhibition);
    setIsOpen(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Đang diễn ra</Badge>;
      case 'upcoming':
        return <Badge variant="secondary">Sắp diễn ra</Badge>;
      case 'completed':
        return <Badge variant="outline">Đã kết thúc</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Triển lãm các tác phẩm</h2>
            <p className="text-xl text-muted-foreground">Khám phá những tác phẩm xuất sắc từ các cuộc thi</p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="aspect-video bg-muted animate-pulse"></div>
                <CardHeader>
                  <div className="h-4 bg-muted rounded animate-pulse mb-2"></div>
                  <div className="h-3 bg-muted rounded animate-pulse w-3/4"></div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Triển lãm các tác phẩm</h2>
            <p className="text-xl text-muted-foreground">
              Khám phá những tác phẩm xuất sắc từ các cuộc thi trước
            </p>
          </div>
          
          {exhibitions.length > 0 ? (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
                {exhibitions.map((exhibition) => (
                  <Card key={exhibition._id} className="group overflow-hidden hover:shadow-xl transition-all duration-300">
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={exhibition.image || "/img/contest-bg.jpg"}
                        alt={exhibition.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleViewDetails(exhibition)}
                          className="gap-2"
                        >
                          <EyeIcon className="h-4 w-4" />
                          Xem chi tiết
                        </Button>
                      </div>
                      <div className="absolute top-2 right-2">
                        {getStatusBadge(exhibition.status)}
                      </div>
                    </div>
                    
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg line-clamp-1">{exhibition.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{exhibition.description}</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CalendarIcon className="h-4 w-4" />
                          <span>{formatDate(exhibition.startDate)} - {formatDate(exhibition.endDate)}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">Cuộc thi:</span> {exhibition.contestCode}
                        </div>
                        {exhibition.totalWorks && (
                          <div className="text-sm text-muted-foreground">
                            <span className="font-medium">Số tác phẩm:</span> {exhibition.totalWorks}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="text-center mt-12">
                <Button variant="outline" size="lg" asChild>
                  <Link to="/exhibitions">
                    <PhotoIcon className="mr-2 h-5 w-5" />
                    Xem tất cả triển lãm
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <PhotoIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Chưa có triển lãm nào</h3>
              <p className="text-muted-foreground">Các triển lãm sẽ được cập nhật sớm nhất</p>
            </div>
          )}
        </div>
      </section>

      {/* Exhibition Detail Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          {selectedExhibition && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedExhibition.title}</DialogTitle>
                <DialogDescription>
                  {selectedExhibition.description}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="aspect-video rounded-lg overflow-hidden">
                  <img
                    src={selectedExhibition.image || "/img/contest-bg.jpg"}
                    alt={selectedExhibition.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Thông tin triển lãm</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Cuộc thi:</span> {selectedExhibition.contestCode}</div>
                      <div><span className="font-medium">Trạng thái:</span> {getStatusBadge(selectedExhibition.status)}</div>
                      <div><span className="font-medium">Số tác phẩm:</span> {selectedExhibition.totalWorks || 'N/A'}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Thời gian</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Bắt đầu:</span> {formatDate(selectedExhibition.startDate)}</div>
                      <div><span className="font-medium">Kết thúc:</span> {formatDate(selectedExhibition.endDate)}</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button asChild className="flex-1">
                    <Link to={`/exhibitions/${selectedExhibition._id}`}>
                      Xem triển lãm
                    </Link>
                  </Button>
                  <Button variant="outline" onClick={() => setIsOpen(false)}>
                    Đóng
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExhibitionSection;