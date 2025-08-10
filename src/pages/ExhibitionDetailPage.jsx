import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { CalendarIcon, ArrowLeftIcon, PhotoIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import MediaViewer from '../components/common/MediaViewer';
import { toast } from 'sonner';

const ExhibitionDetailPage = () => {
  const { exhibitionId } = useParams();
  const [loading, setLoading] = useState(true);
  const [exhibition, setExhibition] = useState(null);
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await apiService.getExhibition(exhibitionId);
        // Be tolerant to different response shapes
        const data = res.data || {};
        const ex = data.exhibition || data;
        setExhibition(ex);
        // Fetch items from separate endpoint
        const itemsRes = await apiService.getExhibitionItems(ex._id || exhibitionId, { page: 1, limit: 18 });
        const itemsData = itemsRes.data?.items || [];
        setItems(itemsData);
        const p = itemsRes.data?.pagination;
        setPage(p?.currentPage || 1);
        setHasNext((p?.currentPage || 1) < (p?.pageCount || 1));
      } catch (e) {
        console.error('Error fetching exhibition detail', e);
        toast.error('Không thể tải chi tiết triển lãm');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [exhibitionId]);

  const loadMore = async () => {
    if (!hasNext || loadingMore) return;
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const itemsRes = await apiService.getExhibitionItems(exhibition?._id || exhibitionId, { page: nextPage, limit: 18 });
      const itemsData = itemsRes.data?.items || [];
      setItems((prev) => [...prev, ...itemsData]);
      const p = itemsRes.data?.pagination;
      setPage(p?.currentPage || nextPage);
      setHasNext((p?.currentPage || nextPage) < (p?.pageCount || nextPage));
    } catch (e) {
      toast.error('Không thể tải thêm tác phẩm');
    } finally {
      setLoadingMore(false);
    }
  };

  const formatDateRange = (start, end) => {
    if (!start && !end) return null;
    const fmt = (d) => new Date(d).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });
    if (start && end) return `${fmt(start)} - ${fmt(end)}`;
    if (start) return fmt(start);
    return fmt(end);
  };

  const handleOpenItem = (index) => setSelectedItemIndex(index);
  const handleCloseItem = () => setSelectedItemIndex(null);

  const currentItem = useMemo(() => {
    if (selectedItemIndex == null) return null;
    return items[selectedItemIndex] || null;
  }, [selectedItemIndex, items]);

  const mediaItems = useMemo(() => {
    if (!currentItem) return [];
    const images = (currentItem.images || []).filter(Boolean);
    const videos = currentItem.videoUrl ? [currentItem.videoUrl] : [];
    return [...images, ...videos];
  }, [currentItem]);

  if (loading) {
    return (
      <div className="container py-8 space-y-8">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-square bg-muted animate-pulse" />
              <CardHeader>
                <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!exhibition) {
    return (
      <div className="container py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Không tìm thấy triển lãm</h1>
          <Button asChild variant="outline">
            <Link to="/exhibitions"><ArrowLeftIcon className="h-4 w-4 mr-2" />Quay lại</Link>
          </Button>
        </div>
        <div className="text-muted-foreground">Vui lòng thử lại sau.</div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{exhibition.title}</h1>
          <Button asChild variant="outline">
            <Link to="/exhibitions"><ArrowLeftIcon className="h-4 w-4 mr-2" />Quay lại</Link>
          </Button>
        </div>
        {exhibition.description && (
          <p className="text-muted-foreground max-w-3xl">{exhibition.description}</p>
        )}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {formatDateRange(exhibition.startDate, exhibition.endDate) && (
            <span className="inline-flex items-center gap-2"><CalendarIcon className="h-4 w-4" />{formatDateRange(exhibition.startDate, exhibition.endDate)}</span>
          )}
          {exhibition.organizer && (
            <span className="inline-flex items-center gap-2"><GlobeAltIcon className="h-4 w-4" />{exhibition.organizer}</span>
          )}
          {typeof exhibition.isPublic === 'boolean' && (
            <Badge variant={exhibition.isPublic ? 'default' : 'secondary'}>
              {exhibition.isPublic ? 'Công khai' : 'Riêng tư'}
            </Badge>
          )}
        </div>
      </div>

      {/* Items Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Các tác phẩm</h2>
        {items && items.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, index) => (
              <Card 
                key={item._id || index}
                className="group overflow-hidden hover:shadow-md transition-all cursor-pointer"
                onClick={() => handleOpenItem(index)}
              >
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={(item.images && item.images[0]) || '/img/contest-bg.jpg'}
                    alt={item.title || `Item ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => { e.currentTarget.src = '/img/contest-bg.jpg'; }}
                  />
                </div>
                <CardHeader className="space-y-1">
                  <CardTitle className="text-base line-clamp-2">{item.title || 'Tác phẩm'}</CardTitle>
                </CardHeader>
                <CardContent>
                  {item.teamName && (
                    <div className="text-sm text-muted-foreground">{item.teamName}</div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <PhotoIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <div className="text-muted-foreground">Chưa có tác phẩm nào.</div>
          </div>
        )}

        {hasNext && (
          <div className="text-center mt-2">
            <Button variant="outline" onClick={loadMore} disabled={loadingMore}>
              {loadingMore ? 'Đang tải...' : 'Tải thêm'}
            </Button>
          </div>
        )}
      </div>

      {/* Item Detail Modal */}
      {currentItem && (
        <MediaViewer
          items={mediaItems}
          isOpen={selectedItemIndex != null}
          onClose={handleCloseItem}
          initialIndex={0}
          showDescription={false}
        />
      )}

      {/* Item meta modal-like card below or alongside media viewer */}
      {currentItem && (
        <div className="fixed inset-x-0 bottom-0 md:bottom-6 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 z-[60] pointer-events-none">
          <div className="mx-4 md:mx-0 md:w-[720px] pointer-events-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{currentItem.title || 'Chi tiết tác phẩm'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {currentItem.description && (
                  <div className="text-sm text-muted-foreground">{currentItem.description}</div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  {currentItem.teamName && <div><span className="text-muted-foreground">Đội thi:</span> <span className="font-medium">{currentItem.teamName}</span></div>}
                  {currentItem.websiteUrl && <div><span className="text-muted-foreground">Website:</span> <a className="font-medium underline" href={currentItem.websiteUrl} target="_blank" rel="noreferrer">Mở</a></div>}
                  {currentItem.githubUrl && <div><span className="text-muted-foreground">GitHub:</span> <a className="font-medium underline" href={currentItem.githubUrl} target="_blank" rel="noreferrer">Mở</a></div>}
                  {currentItem.videoUrl && <div><span className="text-muted-foreground">Video:</span> <a className="font-medium underline" href={currentItem.videoUrl} target="_blank" rel="noreferrer">Mở</a></div>}
                </div>
                {Array.isArray(currentItem.technologies) && currentItem.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {currentItem.technologies.map((t, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{t}</Badge>
                    ))}
                  </div>
                )}
                {Array.isArray(currentItem.awards) && currentItem.awards.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {currentItem.awards.map((t, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{t}</Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExhibitionDetailPage;

