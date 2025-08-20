import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogPortal, DialogOverlay } from '../ui/dialog';
import { Button } from '../ui/button';
import { 
  XMarkIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  PhotoIcon,
  VideoCameraIcon,
  GlobeAltIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon
} from '@heroicons/react/24/outline';

const MediaViewer = ({ 
  items = [], 
  isOpen = false, 
  onClose = () => {}, 
  initialIndex = 0,
  showDescription = true,
  allowFullscreen = true,
  className = ""
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);

  // Reset zoom when item changes
  useEffect(() => {
    setIsZoomed(false);
  }, [currentIndex]);

  // Update current index when initialIndex changes
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  // Handle keyboard navigation
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
          onClose();
          break;
        case ' ':
          e.preventDefault();
          if (getCurrentItemType() === 'image') {
            toggleZoom();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, items.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? items.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prev) => 
      prev === items.length - 1 ? 0 : prev + 1
    );
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  const getCurrentItemType = () => {
    const currentItem = items[currentIndex];
    
    if (typeof currentItem === 'string') {
      const url = currentItem.toLowerCase();
      if (url.includes('.mp4') || url.includes('.webm') || url.includes('.ogg') || url.includes('.mov')) {
        return 'video';
      } else if (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com')) {
        return 'iframe';
      }
      return 'image';
    }
    
    return currentItem.type || 'image';
  };

  const getEmbedUrl = (url) => {
    // Convert YouTube URLs to embed format
    if (url.includes('youtube.com/watch')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
    } else if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
    } else if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return url;
  };

  const renderMediaContent = (item) => {
    const type = getCurrentItemType();
    const url = typeof item === 'string' ? item : item.url;

    switch (type) {
      case 'video':
        return (
          <div className="w-full h-full flex items-center justify-center p-4">
            <video
              className="max-w-full max-h-full object-contain rounded-lg"
              controls
              autoPlay
              poster={typeof item === 'object' ? item.thumbnail : undefined}
              preload="metadata"
              style={{ maxWidth: '90vw', maxHeight: '80vh' }}
            >
              <source src={url} />
              <p className="text-white">Trình duyệt không hỗ trợ video này.</p>
            </video>
          </div>
        );

      case 'iframe':
        { const embedUrl = getEmbedUrl(url);
        return (
          <div className="w-full h-full flex items-center justify-center p-4">
            <iframe
              src={embedUrl}
              className="rounded-lg border-0"
              style={{ 
                width: 'min(90vw, 1200px)', 
                height: 'min(80vh, 675px)',
                aspectRatio: '16/9'
              }}
              title={typeof item === 'object' ? item.description : 'Media content'}
              allowFullScreen={allowFullscreen}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              loading="eager"
            />
          </div>
        ); }

      default:
        return (
          <div className="w-full h-full flex items-center justify-center p-4">
            <img
              src={url}
              alt={typeof item === 'object' ? item.description : 'Media content'}
              className={`max-w-full max-h-full object-contain transition-transform duration-300 cursor-pointer rounded-lg ${
                isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
              }`}
              onClick={() => getCurrentItemType() === 'image' && toggleZoom()}
              style={{
                transformOrigin: 'center center',
                maxWidth: '90vw',
                maxHeight: '80vh'
              }}
              onError={(e) => {
                e.target.src = '/img/contest-bg.jpg'; // Fallback image
              }}
            />
          </div>
        );
    }
  };

  if (!isOpen || items.length === 0) return null;

  const currentItem = items[currentIndex];
  if (!currentItem) return null;

  const currentType = getCurrentItemType();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogPortal>
        <DialogOverlay className="bg-black/95" />
        <div className={`fixed inset-0 z-50 flex items-center justify-center ${className}`}>
          <div className="w-full h-full relative">
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-50 text-white hover:bg-white/20 h-12 w-12"
              onClick={onClose}
            >
              <XMarkIcon className="h-6 w-6" />
            </Button>


            {/* Zoom controls for images */}
            {currentType === 'image' && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 h-10 w-10"
                  onClick={() => setIsZoomed(false)}
                  disabled={!isZoomed}
                >
                  <MagnifyingGlassMinusIcon className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 h-10 w-10"
                  onClick={() => setIsZoomed(true)}
                  disabled={isZoomed}
                >
                  <MagnifyingGlassPlusIcon className="h-5 w-5" />
                </Button>
              </div>
            )}

            {/* Navigation buttons */}
            {items.length > 1 && (
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

            {/* Main media content */}
            {renderMediaContent(currentItem)}

            {/* Media info overlay */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
              {/* Media counter */}
              <div className="bg-black/80 text-white px-4 py-2 rounded-full text-sm font-medium">
                {currentIndex + 1} / {items.length}
              </div>
              
              {/* Media description */}
              {showDescription && typeof currentItem === 'object' && currentItem.description && (
                <div className="bg-black/80 text-white px-4 py-2 rounded-lg text-sm max-w-md text-center">
                  {currentItem.description}
                </div>
              )}

              {/* Control hints */}
              <div className="flex gap-4 text-xs text-white/70">
                {currentType === 'image' && <span>Click để zoom</span>}
                <span>← → để chuyển</span>
                <span>ESC để đóng</span>
              </div>
            </div>
          </div>
        </div>
      </DialogPortal>
    </Dialog>
  );
};

export default MediaViewer;