import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Dialog, DialogContent } from '../ui/dialog';
import { PhotoIcon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { apiService } from '../../services/api';

const GallerySection = () => {
  const [galleryImages, setGalleryImages] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGalleryData();
  }, []);

  const fetchGalleryData = async () => {
    try {
      const response = await apiService.getCommonData('test');
      setGalleryImages(response.data.gallery || []);
    } catch (error) {
      console.error('Error fetching gallery data:', error);
      setGalleryImages([]);
    } finally {
      setLoading(false);
    }
  };

  const openLightbox = (index) => {
    setSelectedImageIndex(index);
    setIsOpen(true);
  };

  const closeLightbox = () => {
    setIsOpen(false);
    setSelectedImageIndex(null);
  };

  const goToPrevious = () => {
    setSelectedImageIndex((prev) => 
      prev === 0 ? galleryImages.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setSelectedImageIndex((prev) => 
      prev === galleryImages.length - 1 ? 0 : prev + 1
    );
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          goToPrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goToNext();
          break;
        case 'Escape':
          e.preventDefault();
          closeLightbox();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, galleryImages.length]);

  if (loading) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Gallery hình ảnh</h2>
            <p className="text-xl text-muted-foreground">Những khoảnh khắc đáng nhớ từ các cuộc thi</p>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-7xl mx-auto">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="aspect-square bg-muted animate-pulse rounded-lg"></div>
            ))}
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Gallery hình ảnh</h2>
            <p className="text-xl text-muted-foreground">
              Những khoảnh khắc đáng nhớ từ các cuộc thi
            </p>
          </div>
          
          {galleryImages.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-7xl mx-auto">
              {galleryImages.map((image, index) => (
                <div
                  key={image._id}
                  className="group relative aspect-square overflow-hidden rounded-lg cursor-pointer bg-muted hover:shadow-lg transition-all duration-300"
                  onClick={() => openLightbox(index)}
                >
                  <img
                    src={image.image}
                    alt={image.description || `Gallery image ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                    <PhotoIcon className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <PhotoIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Chưa có hình ảnh nào</h3>
              <p className="text-muted-foreground">Gallery sẽ được cập nhật sớm nhất</p>
            </div>
          )}
        </div>
      </section>

      {/* Fullscreen Lightbox Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent 
          className="!fixed !inset-0 !z-50 !w-screen !h-screen !max-w-none !max-h-none !p-0 !m-0 !bg-black/95 !border-none !rounded-none !transform-none !translate-x-0 !translate-y-0 !top-0 !left-0"
          showCloseButton={false}
          style={{
            position: 'fixed',
            inset: '0',
            width: '100vw',
            height: '100vh',
            maxWidth: 'none',
            maxHeight: 'none',
            padding: '0',
            margin: '0',
            transform: 'none',
            top: '0',
            left: '0'
          }}
        >
          {selectedImageIndex !== null && galleryImages[selectedImageIndex] && (
            <div className="w-full h-full flex items-center justify-center relative">
              {/* Close button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-50 text-white hover:bg-white/20 h-12 w-12"
                onClick={closeLightbox}
              >
                <XMarkIcon className="h-6 w-6" />
              </Button>

              {/* Navigation buttons */}
              {galleryImages.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20 h-12 w-12"
                    onClick={goToPrevious}
                  >
                    <ChevronLeftIcon className="h-8 w-8" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20 h-12 w-12"
                    onClick={goToNext}
                  >
                    <ChevronRightIcon className="h-8 w-8" />
                  </Button>
                </>
              )}

              {/* Main image */}
              <img
                src={galleryImages[selectedImageIndex].image}
                alt={galleryImages[selectedImageIndex].description || `Gallery image ${selectedImageIndex + 1}`}
                className="max-w-[90vw] max-h-[90vh] object-contain"
              />

              {/* Image info overlay */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
                {/* Image counter */}
                <div className="bg-black/80 text-white px-4 py-2 rounded-full text-sm font-medium">
                  {selectedImageIndex + 1} / {galleryImages.length}
                </div>
                
                {/* Image description */}
                {galleryImages[selectedImageIndex].description && (
                  <div className="bg-black/80 text-white px-4 py-2 rounded-lg text-sm max-w-md text-center">
                    {galleryImages[selectedImageIndex].description}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GallerySection;