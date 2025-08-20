import { useState, useCallback, useRef, useEffect } from 'react';

export const useCarousel = ({
  itemsLength = 0,
  auto = false,
  autoInterval = 5000,
  onSlideChange
} = {}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(auto);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef(null);

  const goToSlide = useCallback((index) => {
    const newIndex = Math.max(0, Math.min(index, itemsLength - 1));
    setCurrentIndex(newIndex);
    onSlideChange?.(newIndex);
  }, [itemsLength, onSlideChange]);

  const goToPrevious = useCallback(() => {
    const newIndex = currentIndex === 0 ? itemsLength - 1 : currentIndex - 1;
    goToSlide(newIndex);
  }, [currentIndex, itemsLength, goToSlide]);

  const goToNext = useCallback(() => {
    const newIndex = currentIndex === itemsLength - 1 ? 0 : currentIndex + 1;
    goToSlide(newIndex);
  }, [currentIndex, itemsLength, goToSlide]);

  const startAutoPlay = useCallback(() => {
    if (auto && itemsLength > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % itemsLength);
      }, autoInterval);
    }
  }, [auto, autoInterval, itemsLength]);

  const stopAutoPlay = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const togglePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  // Handle auto-play
  useEffect(() => {
    if (isPlaying && !isHovered) {
      startAutoPlay();
    } else {
      stopAutoPlay();
    }

    return () => stopAutoPlay();
  }, [isPlaying, isHovered, startAutoPlay, stopAutoPlay]);

  // Reset when items change
  useEffect(() => {
    if (currentIndex >= itemsLength) {
      setCurrentIndex(0);
    }
  }, [itemsLength, currentIndex]);

  return {
    currentIndex,
    isPlaying,
    isHovered,
    setIsHovered,
    goToSlide,
    goToPrevious,
    goToNext,
    togglePlayPause,
    startAutoPlay,
    stopAutoPlay
  };
};

export default useCarousel;