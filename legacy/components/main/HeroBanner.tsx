import React, { useState, useEffect, useCallback } from 'react';
import { Banner } from '../../types';
import { ChevronLeftIcon, ChevronRightIcon } from '../icons/Icons';
import Skeleton from '../ui/Skeleton';
import { Link } from 'react-router-dom';

interface HeroBannerProps {
  banners: Banner[];
  loading: boolean;
}

const HeroBanner: React.FC<HeroBannerProps> = ({ banners, loading }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = useCallback(() => {
    const newIndex = currentIndex === 0 ? banners.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  }, [currentIndex, banners.length]);

  const goToNext = useCallback(() => {
    const newIndex = currentIndex === banners.length - 1 ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  }, [currentIndex, banners.length]);

  useEffect(() => {
    if (!loading && banners.length > 0) {
      const timer = setTimeout(goToNext, 5000);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, loading, banners.length, goToNext]);

  if (loading) {
    return <Skeleton className="w-full h-[300px] md:h-[500px]" />;
  }

  if (banners.length === 0) {
    return null;
  }

  // 인덱스를 안전한 범위로 클램핑
  const safeIndex = Math.max(0, Math.min(currentIndex, banners.length - 1));
  const currentBanner = banners[safeIndex];

  // 추가 안전 체크
  if (!currentBanner) {
    return null;
  }

  return (
    <div className="relative w-full h-[300px] md:h-[500px] group overflow-hidden rounded-2xl shadow-lg">
      <div
        style={{ backgroundImage: `url(${currentBanner.imageUrl})` }}
        className="w-full h-full bg-center bg-cover duration-500"
      >
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-center text-white p-4">
            <h2 className="text-2xl md:text-5xl font-extrabold mb-3 md:mb-4">{currentBanner.title}</h2>
            {currentBanner.subtitle && (
              <p className="text-sm md:text-xl max-w-2xl mx-auto leading-relaxed">{currentBanner.subtitle}</p>
            )}
            <Link
              to={currentBanner.link}
              className="mt-4 md:mt-8 inline-block bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-opacity-90 transition-transform duration-300 hover:scale-105"
            >
              자세히 보기
            </Link>
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={goToPrevious}
        className="absolute top-1/2 left-4 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300"
        aria-label="이전 배너"
      >
        <ChevronLeftIcon className="w-6 h-6" />
      </button>
      <button
        type="button"
        onClick={goToNext}
        className="absolute top-1/2 right-4 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300"
        aria-label="다음 배너"
      >
        <ChevronRightIcon className="w-6 h-6" />
      </button>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {banners.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-colors ${currentIndex === index ? 'bg-white' : 'bg-white/50'}`}
            aria-label={`배너 ${index + 1}로 이동`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroBanner;
