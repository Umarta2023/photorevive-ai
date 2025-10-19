import React, { useState, useRef, useEffect, useCallback } from 'react';
import { photoExamples } from '../assets/photo-data';

const WelcomeSlider: React.FC = () => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isSliding = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhotoIndex((prevIndex) => (prevIndex + 1) % photoExamples.length);
    }, 5000); // Change photo every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const currentPhoto = photoExamples[currentPhotoIndex];

  const handleSliderMove = useCallback((clientX: number) => {
    if (!isSliding.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    let pos = ((clientX - rect.left) / rect.width) * 100;
    pos = Math.max(0, Math.min(100, pos));
    setSliderPosition(pos);
  }, []);
  
  const handleSliderStart = useCallback((e: React.MouseEvent) => {
    isSliding.current = true;
    handleSliderMove(e.clientX);
  }, [handleSliderMove]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    isSliding.current = true;
    handleSliderMove(e.touches[0].clientX);
  }, [handleSliderMove]);
  
  const handleInteractionEnd = useCallback(() => {
    isSliding.current = false;
  }, []);
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    handleSliderMove(e.clientX);
  }, [handleSliderMove]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    handleSliderMove(e.touches[0].clientX);
  }, [handleSliderMove]);
  
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleInteractionEnd);
    window.addEventListener('touchend', handleInteractionEnd);
    el.addEventListener('touchmove', handleTouchMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleInteractionEnd);
      window.removeEventListener('touchend', handleInteractionEnd);
      el.removeEventListener('touchmove', handleTouchMove);
    };
  }, [handleMouseMove, handleInteractionEnd, handleTouchMove]);

  const clipStyle = { clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` };

  return (
    <div 
        ref={containerRef}
        className="relative w-full h-full select-none overflow-hidden rounded-lg shadow-2xl bg-gray-800"
    >
      <div className="absolute inset-0 w-full h-full">
        <img src={currentPhoto.after} alt="After" className="w-full h-full object-cover" />
        <div
          className="absolute inset-0 w-full h-full"
          style={clipStyle}
        >
          <img src={currentPhoto.before} alt="Before" className="w-full h-full object-cover" />
        </div>
      </div>
      
      <div
        className="absolute top-0 bottom-0 w-1 bg-yellow-400 -translate-x-1/2 z-30 cursor-ew-resize"
        style={{ left: `${sliderPosition}%` }}
        onMouseDown={handleSliderStart}
        onTouchStart={handleTouchStart}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -left-4 w-9 h-9 rounded-full bg-yellow-400 flex items-center justify-center shadow-lg pointer-events-none">
            <svg className="w-7 h-7 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" transform="rotate(90 12 12)" />
            </svg>
        </div>
      </div>
    </div>
  );
};

export default WelcomeSlider;