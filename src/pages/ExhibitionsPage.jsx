/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { CalendarIcon, MagnifyingGlassIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { apiService } from '../services/api';
import { toast } from 'sonner';

const ExhibitionsPage = () => {
  const [exhibitions, setExhibitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasNext: false
  });
  const [filters, setFilters] = useState({
    search: '',
    status: 'all'
  });

  useEffect(() => {
    fetchExhibitions(1, true);
  }, [filters]);

  const fetchExhibitions = async (page = 1, reset = false) => {
    try {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const params = {
        page,
        perPage: 12,
        ...(filters.search && { search: filters.search }),
        ...(filters.status !== 'all' && { status: filters.status })
      };

      const response = await apiService.getExhibitions(params);
      const data = response.data;

      if (reset) {
        setExhibitions(data.exhibitions || []);
      } else {
        setExhibitions(prev => [...prev, ...(data.exhibitions || [])]);
      }

      setPagination({
        currentPage: data.pagination?.currentPage || 1,
        totalPages: data.pagination?.pageCount || 1,
        hasNext: data.pagination?.hasNext || false
      });

    } catch (error) {
      console.error('Error fetching exhibitions:', error);
      toast.error('Không thể tải danh sách triển lãm');
      return []
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (pagination.hasNext && !loadingMore) {
      fetchExhibitions(pagination.currentPage + 1, false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
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

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Triển lãm các tác phẩm</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Khám phá những tác phẩm xuất sắc từ các cuộc thi thiết kế web. 
          Mỗi triển lãm là một hành trình khám phá sự sáng tạo và tài năng của các thí sinh.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm triển lãm..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="active">Đang diễn ra</SelectItem>
            <SelectItem value="upcoming">Sắp diễn ra</SelectItem>
            <SelectItem value="completed">Đã kết thúc</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="overflow-hidden">
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
      ) : exhibitions.length > 0 ? (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {exhibitions.map((exhibition) => (
              <Card key={exhibition._id} className="group overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={exhibition.thumbnail || exhibition.bannerImage || exhibition.banner || exhibition.image || "/img/contest-bg.jpg"}
                    alt={exhibition.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute top-2 right-2">
                    {getStatusBadge(exhibition.status)}
                  </div>
                </div>
                
                <CardHeader>
                  <CardTitle className="text-lg line-clamp-2">{exhibition.title}</CardTitle>
                  <CardDescription className="line-clamp-3">{exhibition.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarIcon className="h-4 w-4" />
                    <span>
                      {exhibition.startDate ? formatDate(exhibition.startDate) : ''}
                      {exhibition.endDate ? ` - ${formatDate(exhibition.endDate)}` : ''}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Cuộc thi:</span> 
                      <span className="font-medium ml-1">{exhibition.contestCode || exhibition.contest?.code || '-'}</span>
                    </div>
                    {(exhibition.itemCount || exhibition.totalWorks) && (
                      <div className="text-sm text-muted-foreground">
                        {exhibition.itemCount || exhibition.totalWorks} tác phẩm
                      </div>
                    )}
                  </div>
                  
                  <Button asChild className="w-full">
                    <Link to={`/exhibitions/${exhibition._id}`}>
                      Xem triển lãm
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More Button */}
          {pagination.hasNext && (
            <div className="text-center">
              <Button
                variant="outline"
                size="lg"
                onClick={loadMore}
                disabled={loadingMore}
                className="min-w-32"
              >
                {loadingMore ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                ) : (
                  'Tải thêm'
                )}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <PhotoIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Không tìm thấy triển lãm nào</h3>
          <p className="text-muted-foreground">
            {filters.search || filters.status !== 'all' 
              ? 'Thử thay đổi bộ lọc để tìm kiếm triển lãm khác'
              : 'Các triển lãm sẽ được cập nhật sớm nhất'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default ExhibitionsPage;