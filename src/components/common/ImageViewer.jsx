import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '../ui/dialog';
import { Button } from '../ui/button';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const ImageViewer = ({ 
  images = [], 
  isOpen = false, 
  onClose = () => {}, 
  initialIndex = 0,
  showDescription = true,
  className = ""
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);

  // Reset zoom when image changes
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
          toggleZoom();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prev) => 
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex];
  if (!currentImage) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={`!fixed !inset-0 !z-50 !w-screen !h-screen !max-w-none !max-h-none !p-0 !m-0 !bg-black/95 !border-none !rounded-none ${className}`}
        showCloseButton={false}
      >
        <div className="w-full h-full flex items-center justify-center relative">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-50 text-white hover:bg-white/20 h-12 w-12"
            onClick={onClose}
          >
            <XMarkIcon className="h-6 w-6" />
          </Button>

          {/* Navigation buttons */}
          {images.length > 1 && (
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

          {/* Main image with zoom capability */}
          <div className="w-full h-full flex items-center justify-center p-8 overflow-hidden">
            <img
              src={typeof currentImage === 'string' ? currentImage : currentImage.url}
              alt={typeof currentImage === 'string' ? `Image ${currentIndex + 1}` : (currentImage.title || currentImage.description || `Image ${currentIndex + 1}`)}
              className={`max-w-[90vw] max-h-[90vh] object-contain transition-transform duration-300 cursor-pointer ${
                isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
              }`}
              onClick={toggleZoom}
              style={{
                transformOrigin: 'center center'
              }}
            />
          </div>

          {/* Image info overlay */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
            {/* Image counter */}
            <div className="bg-black/80 text-white px-4 py-2 rounded-full text-sm font-medium">
              {currentIndex + 1} / {images.length}
            </div>
            
            {/* Image description */}
            {showDescription && typeof currentImage === 'object' && currentImage.description && (
              <div className="bg-black/80 text-white px-4 py-2 rounded-lg text-sm max-w-md text-center">
                {currentImage.description}
              </div>
            )}

            <div className="flex gap-4 text-xs text-white/70">
              <span>Click để zoom</span>
              <span>← → để chuyển ảnh</span>
              <span>ESC để đóng</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageViewer;