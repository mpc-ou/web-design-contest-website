import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  PlayIcon, 
  PauseIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';

const ImageCarousel = ({ 
  images = [], 
  auto = false, 
  autoInterval = 5000,
  indicator = 'dots', 
  className = '',
  aspectRatio = 'aspect-video',
  showControls = true,
  showIndicators = true,
  showDescription = true,
  onImageClick,
  onSlideChange,
  ...props 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(auto);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef(null);
  const carouselRef = useRef(null);

  // Normalize images to ensure consistent structure
  const normalizedImages = React.useMemo(() => {
    if (!Array.isArray(images)) {
      return [images].filter(Boolean);
    }
    
    return images.map((image, index) => {
      if (typeof image === 'string') {
        return {
          id: index,
          url: image,
          title: `Image ${index + 1}`,
          description: null
        };
      }
      
      return {
        id: image.id || index,
        url: image.url || image.image || image,
        title: image.title || `Image ${index + 1}`,
        description: image.description || null,
        ...image
      };
    }).filter(img => img.url);
  }, [images]);

  const totalImages = normalizedImages.length;

  // Auto-play functionality
  const startAutoPlay = useCallback(() => {
    if (auto && totalImages > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % totalImages);
      }, autoInterval);
    }
  }, [auto, autoInterval, totalImages]);

  const stopAutoPlay = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Handle auto-play
  useEffect(() => {
    if (isPlaying && !isHovered) {
      startAutoPlay();
    } else {
      stopAutoPlay();
    }

    return () => stopAutoPlay();
  }, [isPlaying, isHovered, startAutoPlay, stopAutoPlay]);

  // Navigation functions
  const goToSlide = useCallback((index) => {
    const newIndex = Math.max(0, Math.min(index, totalImages - 1));
    setCurrentIndex(newIndex);
    onSlideChange?.(newIndex, normalizedImages[newIndex]);
  }, [totalImages, normalizedImages, onSlideChange]);

  const goToPrevious = useCallback(() => {
    const newIndex = currentIndex === 0 ? totalImages - 1 : currentIndex - 1;
    goToSlide(newIndex);
  }, [currentIndex, totalImages, goToSlide]);

  const goToNext = useCallback(() => {
    const newIndex = currentIndex === totalImages - 1 ? 0 : currentIndex + 1;
    goToSlide(newIndex);
  }, [currentIndex, totalImages, goToSlide]);

  // Handle image click
  const handleImageClick = () => {
    onImageClick?.(currentIndex, normalizedImages[currentIndex]);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!carouselRef.current?.contains(document.activeElement)) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          goToPrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goToNext();
          break;
        case ' ':
          e.preventDefault();
          setIsPlaying(!isPlaying);
          break;
        case 'Enter':
          e.preventDefault();
          handleImageClick();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [goToPrevious, goToNext, goToSlide, totalImages, isPlaying, handleImageClick]);

  if (totalImages === 0) {
    return (
      <div className={cn(
        "flex items-center justify-center bg-muted rounded-lg",
        aspectRatio,
        className
      )}>
        <div className="text-center text-muted-foreground">
          <PhotoIcon className="h-12 w-12 mx-auto mb-2" />
          <p>No images to display</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={carouselRef}
      className={cn("relative group", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      tabIndex={0}
      role="region"
      aria-label="Image carousel"
      {...props}
    >
      {/* Main carousel container */}
      <div className={cn(
        "relative overflow-hidden rounded-lg bg-muted",
        aspectRatio
      )}>
        {/* Image slides */}
        <div 
          className="flex transition-transform duration-500 ease-in-out h-full"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {normalizedImages.map((image, index) => (
            <div 
              key={image.id}
              className="w-full flex-shrink-0 relative cursor-pointer"
              aria-hidden={index !== currentIndex}
              onClick={handleImageClick}
            >
              <img
                src={image.url}
                alt={image.title}
                className="w-full h-full object-cover"
                loading={Math.abs(index - currentIndex) <= 1 ? "eager" : "lazy"}
              />
              
              {/* Overlay with title and description */}
              {showDescription && (image.title || image.description) && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  {image.title && (
                    <h3 className="text-white font-semibold text-lg mb-1">
                      {image.title}
                    </h3>
                  )}
                  {image.description && (
                    <p className="text-white/90 text-sm line-clamp-2">
                      {image.description}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Navigation arrows */}
        {showControls && totalImages > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/50 hover:bg-black/70 text-white border-0"
              onClick={goToPrevious}
              aria-label="Previous image"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>

            <Button
              variant="secondary"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/50 hover:bg-black/70 text-white border-0"
              onClick={goToNext}
              aria-label="Next image"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Play/Pause button for auto-play */}
        {auto && totalImages > 1 && (
          <Button
            variant="secondary"
            size="icon"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/50 hover:bg-black/70 text-white border-0"
            onClick={() => setIsPlaying(!isPlaying)}
            aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
          >
            {isPlaying ? (
              <PauseIcon className="h-4 w-4" />
            ) : (
              <PlayIcon className="h-4 w-4" />
            )}
          </Button>
        )}

        {/* Current slide indicator */}
        <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          {currentIndex + 1} / {totalImages}
        </div>
      </div>

      {/* Dot indicators */}
      {showIndicators && indicator === 'dots' && totalImages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {normalizedImages.map((_, index) => (
            <button
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-200",
                index === currentIndex 
                  ? "bg-primary w-6" 
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
              onClick={() => goToSlide(index)}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Click hint */}
      {onImageClick && (
        <div className="text-center mt-2">
          <p className="text-xs text-muted-foreground">
            Click để xem chi tiết
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageCarousel;