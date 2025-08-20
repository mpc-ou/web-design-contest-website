import { useState, useEffect } from 'react';
import { PhotoIcon } from '@heroicons/react/24/outline';
import { apiService } from '../../services/api';
import MediaCarousel from '../common/MediaCarousel';
import MediaViewer from '../common/MediaViewer';

const GallerySection = () => {
  const [galleryData, setGalleryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  useEffect(() => {
    fetchGalleryData();
  }, []);

  const fetchGalleryData = async () => {
    try {
      const response = await apiService.getCommonData('test');
      // Sử dụng galleryIntro thay vì gallery
      setGalleryData(response.data.galleryIntro || []);
    } catch (error) {
      console.error('Error fetching gallery data:', error);
      setGalleryData([]);
    } finally {
      setLoading(false);
    }
  };

  const extractYouTubeVideoId = (url) => {
    if (!url) return '';
    const match = url.match(/(?:youtube\.com\/embed\/|youtu\.be\/|youtube\.com\/watch\?v=)([^&\n?#]+)/);
    return match ? match[1] : '';
  };

  // Transform galleryIntro data for MediaCarousel and MediaViewer
  const mediaItems = galleryData.map((item, index) => {
    // Đã có type và url trong data, chỉ cần map lại
    return {
      id: item._id || index,
      type: item.type || 'image', 
      url: item.url || item.image, 
      title: `${item.type === 'iframe' ? 'Video' : 'Hình ảnh'} ${index + 1}`,
      description: item.description || null,
      thumbnail: item.type === 'iframe' 
        ? `https://img.youtube.com/vi/${extractYouTubeVideoId(item.url)}/maxresdefault.jpg` // Tạo thumbnail cho YouTube
        : item.url || item.image
    };
  }).filter(item => item.url);

  // Handle media click to open viewer
  const handleMediaClick = (index, item) => {
    setSelectedItemIndex(index);
    setIsViewerOpen(true);
  };

  const closeViewer = () => {
    setIsViewerOpen(false);
    setSelectedItemIndex(null);
  };

  if (loading) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Gallery Media</h2>
            <p className="text-xl text-muted-foreground">Những khoảnh khắc đáng nhớ từ các cuộc thi</p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="aspect-video bg-muted animate-pulse rounded-lg"></div>
            <div className="flex gap-2 justify-center mt-4">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="w-2 h-2 bg-muted animate-pulse rounded-full"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Gallery Media</h2>
            <p className="text-xl text-muted-foreground">
              Những khoảnh khắc đáng nhớ từ các cuộc thi - Hình ảnh, Video và nội dung đa phương tiện
            </p>
          </div>
          
          {mediaItems.length > 0 ? (
            <div className="max-w-4xl mx-auto">
              <MediaCarousel 
                items={mediaItems}
                auto={true}
                autoInterval={8000} 
                indicator="dots"
                aspectRatio="aspect-video"
                showControls={true}
                showIndicators={true}
                showDescription={false}
                allowFullscreen={true}
                onItemClick={handleMediaClick}
                onSlideChange={(index, item) => {
                  console.log('Gallery slide changed:', index, item?.title, item?.type);
                }}
                className="rounded-xl overflow-hidden shadow-xl"
              />
            </div>
          ) : (
            <div className="text-center py-12">
              <PhotoIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Chưa có nội dung nào</h3>
              <p className="text-muted-foreground">Gallery sẽ được cập nhật sớm nhất</p>
            </div>
          )}
        </div>
      </section>

      {/* Media Viewer Modal */}
      <MediaViewer
        items={mediaItems}
        isOpen={isViewerOpen}
        onClose={closeViewer}
        initialIndex={selectedItemIndex || 0}
        showDescription={true} // Bật mô tả trong viewer
        allowFullscreen={true}
      />
    </>
  );
};

export default GallerySection;