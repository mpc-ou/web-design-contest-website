import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  PlayIcon, 
  PauseIcon,
  PhotoIcon,
  VideoCameraIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const MediaCarousel = ({ 
  items = [], 
  auto = false, 
  autoInterval = 5000,
  indicator = 'dots', // 'dots' | 'none'
  className = '',
  aspectRatio = 'aspect-video',
  showControls = true,
  showIndicators = true,
  showDescription = true,
  allowFullscreen = true,
  onItemClick,
  onSlideChange,
  ...props 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(auto);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef(null);
  const carouselRef = useRef(null);

  // Normalize items to ensure consistent structure
  const normalizedItems = React.useMemo(() => {
    if (!Array.isArray(items)) {
      return [items].filter(Boolean);
    }
    
    return items.map((item, index) => {
      if (typeof item === 'string') {
        // Auto-detect type based on URL extension
        const url = item.toLowerCase();
        let type = 'image';
        if (url.includes('.mp4') || url.includes('.webm') || url.includes('.ogg')) {
          type = 'video';
        } else if (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com')) {
          type = 'iframe';
        }
        
        return {
          id: index,
          type,
          url: item,
          title: `${type.charAt(0).toUpperCase() + type.slice(1)} ${index + 1}`,
          description: null,
          thumbnail: type === 'video' ? item : item
        };
      }
      
      return {
        id: item.id || index,
        type: item.type || 'image',
        url: item.url || item.image || item,
        title: item.title || `Item ${index + 1}`,
        description: item.description || null,
        thumbnail: item.thumbnail || item.url || item.image || item,
        ...item
      };
    }).filter(item => item.url);
  }, [items]);

  const totalItems = normalizedItems.length;

  // Auto-play functionality
  const startAutoPlay = useCallback(() => {
    if (auto && totalItems > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % totalItems);
      }, autoInterval);
    }
  }, [auto, autoInterval, totalItems]);

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
    const newIndex = Math.max(0, Math.min(index, totalItems - 1));
    setCurrentIndex(newIndex);
    onSlideChange?.(newIndex, normalizedItems[newIndex]);
  }, [totalItems, normalizedItems, onSlideChange]);

  const goToPrevious = useCallback(() => {
    const newIndex = currentIndex === 0 ? totalItems - 1 : currentIndex - 1;
    goToSlide(newIndex);
  }, [currentIndex, totalItems, goToSlide]);

  const goToNext = useCallback(() => {
    const newIndex = currentIndex === totalItems - 1 ? 0 : currentIndex + 1;
    goToSlide(newIndex);
  }, [currentIndex, totalItems, goToSlide]);

  // Handle item click
  const handleItemClick = () => {
    onItemClick?.(currentIndex, normalizedItems[currentIndex]);
  };

  // Get type icon
  const getTypeIcon = (type) => {
    switch (type) {
      case 'video':
        return <VideoCameraIcon className="h-4 w-4" />;
      case 'iframe':
        return <GlobeAltIcon className="h-4 w-4" />;
      default:
        return <PhotoIcon className="h-4 w-4" />;
    }
  };

  // Render media content
  const renderMediaContent = (item, isActive = true) => {
    const { type, url, title, description, thumbnail } = item;

    switch (type) {
      case 'video':
        return (
          <video
            key={item.id}
            className="w-full h-full object-cover"
            poster={thumbnail}
            preload={isActive ? "metadata" : "none"}
            muted
            loop
          >
            <source src={url} />
            <p>Your browser does not support the video tag.</p>
          </video>
        );

      case 'iframe':
        // Cho iframe (YouTube), hiển thị thumbnail thay vì embed trực tiếp
        return (
          <div className="w-full h-full bg-muted flex items-center justify-center relative">
            {thumbnail && thumbnail.includes('img.youtube.com') ? (
              // Hiển thị YouTube thumbnail
              <img
                key={item.id}
                src={thumbnail}
                alt={title}
                className="w-full h-full object-cover"
                loading={isActive ? "eager" : "lazy"}
                onError={(e) => {
                  e.target.src = '/img/contest-bg.jpg'; // Fallback image
                }}
              />
            ) : (
              // Fallback cho iframe khác
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <GlobeAltIcon className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
            
            {/* Play button overlay cho video */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/60 hover:bg-black/80 transition-colors rounded-full p-4">
                <PlayIcon className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        );

      default:
        return (
          <img
            key={item.id}
            src={url}
            alt={title}
            className="w-full h-full object-cover"
            loading={isActive ? "eager" : "lazy"}
            onError={(e) => {
              e.target.src = '/img/contest-bg.jpg'; // Fallback image
            }}
          />
        );
    }
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
          handleItemClick();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [goToPrevious, goToNext, goToSlide, totalItems, isPlaying, handleItemClick]);

  if (totalItems === 0) {
    return (
      <div className={cn(
        "flex items-center justify-center bg-muted rounded-lg",
        aspectRatio,
        className
      )}>
        <div className="text-center text-muted-foreground">
          <PhotoIcon className="h-12 w-12 mx-auto mb-2" />
          <p>No media items to display</p>
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
      aria-label="Media carousel"
      {...props}
    >
      {/* Main carousel container */}
      <div className={cn(
        "relative overflow-hidden rounded-lg bg-muted",
        aspectRatio
      )}>
        {/* Media slides */}
        <div 
          className="flex transition-transform duration-500 ease-in-out h-full"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {normalizedItems.map((item, index) => (
            <div 
              key={item.id}
              className="w-full flex-shrink-0 relative cursor-pointer"
              aria-hidden={index !== currentIndex}
              onClick={handleItemClick}
            >
              {renderMediaContent(item, Math.abs(index - currentIndex) <= 1)}
              
              {/* Type indicator */}
              
              
              {/* Overlay with title and description */}
              {showDescription && (item.title || item.description) && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  {item.title && (
                    <h3 className="text-white font-semibold text-lg mb-1">
                      {item.title}
                    </h3>
                  )}
                  {item.description && (
                    <p className="text-white/90 text-sm line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Navigation arrows */}
        {showControls && totalItems > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/50 hover:bg-black/70 text-white border-0"
              onClick={goToPrevious}
              aria-label="Previous item"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>

            <Button
              variant="secondary"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/50 hover:bg-black/70 text-white border-0"
              onClick={goToNext}
              aria-label="Next item"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Play/Pause button for auto-play */}
        {auto && totalItems > 1 && (
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
        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          {currentIndex + 1} / {totalItems}
        </div>
      </div>

      {/* Dot indicators */}
      {showIndicators && indicator === 'dots' && totalItems > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {normalizedItems.map((item, index) => (
            <button
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-200 relative",
                index === currentIndex 
                  ? "bg-primary w-6" 
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
              onClick={() => goToSlide(index)}
              aria-label={`Go to ${item.type} ${index + 1}`}
              title={item.title}
            >

            </button>
          ))}
        </div>
      )}

      {/* Click hint */}
      {onItemClick && (
        <div className="text-center mt-2">
          <p className="text-xs text-muted-foreground">
            Click để xem chi tiết
          </p>
        </div>
      )}
    </div>
  );
};

export default MediaCarousel;