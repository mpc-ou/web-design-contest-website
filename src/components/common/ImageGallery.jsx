import { useState } from 'react';
import { Dialog, DialogContent } from '../ui/dialog';
import { Button } from '../ui/button';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';

const ImageGallery = ({ images = [], title = "Hình ảnh", className = "" }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter out empty or invalid images
  const validImages = images.filter(img => img && img.trim() !== '');

  if (!validImages || validImages.length === 0) {
    return null;
  }

  const openLightbox = (index) => {
    setCurrentIndex(index);
    setSelectedImage(validImages[index]);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    setCurrentIndex(0);
  };

  const goToPrevious = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : validImages.length - 1;
    setCurrentIndex(newIndex);
    setSelectedImage(validImages[newIndex]);
  };

  const goToNext = () => {
    const newIndex = currentIndex < validImages.length - 1 ? currentIndex + 1 : 0;
    setCurrentIndex(newIndex);
    setSelectedImage(validImages[newIndex]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === 'ArrowRight') goToNext();
    if (e.key === 'Escape') closeLightbox();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold">{title}</h3>
      )}
      
      {/* Grid Layout */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {validImages.map((image, index) => (
          <div
            key={index}
            className="relative group cursor-pointer overflow-hidden rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200"
            onClick={() => openLightbox(index)}
          >
            <div className="aspect-square">
              <img
                src={image}
                alt={`${title} ${index + 1}`}
                className="w-100 object-cover transition-transform duration-200 group-hover:scale-105"
                onError={(e) => {
                  e.target.src = '/img/placeholder-image.jpg';
                }}
              />
            </div>
            
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
              <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>
            
            {/* Image counter */}
            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
              {index + 1}/{validImages.length}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      <Dialog open={!!selectedImage} onOpenChange={closeLightbox}>
        <DialogContent 
          className="max-w-6xl h-[90vh] p-0 bg-black/95 border-none"
          onKeyDown={handleKeyDown}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
              onClick={closeLightbox}
            >
              <X className="w-6 h-6" />
            </Button>

            {/* Navigation buttons */}
            {validImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                  onClick={goToPrevious}
                >
                  <ChevronLeft className="w-8 h-8" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                  onClick={goToNext}
                >
                  <ChevronRight className="w-8 h-8" />
                </Button>
              </>
            )}

            {/* Main image */}
            <div className="w-full h-full flex items-center justify-center p-8">
              <img
                src={selectedImage}
                alt={`${title} ${currentIndex + 1}`}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  e.target.src = '/img/placeholder-image.jpg';
                }}
              />
            </div>

            {/* Image info */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-lg">
              <div className="text-center">
                <div className="text-sm font-medium">{title}</div>
                <div className="text-xs opacity-80">
                  {currentIndex + 1} / {validImages.length}
                </div>
              </div>
            </div>

            {/* Thumbnail strip for multiple images */}
            {validImages.length > 1 && (
              <div className="absolute bottom-4 left-4 right-4 mb-16">
                <div className="flex justify-center space-x-2 max-w-full overflow-x-auto pb-2">
                  {validImages.map((image, index) => (
                    <button
                      key={index}
                      className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden transition-all duration-200 ${
                        index === currentIndex 
                          ? 'border-white' 
                          : 'border-white/30 hover:border-white/60'
                      }`}
                      onClick={() => {
                        setCurrentIndex(index);
                        setSelectedImage(validImages[index]);
                      }}
                    >
                      <img
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/img/placeholder-image.jpg';
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImageGallery;