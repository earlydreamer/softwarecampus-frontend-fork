import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import type { Banner } from '../../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { sanitizeUrl } from '../../utils/security';
import Skeleton from '../ui/Skeleton';

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
        return <Skeleton className="w-full h-[400px] md:h-[500px] rounded-2xl" />;
    }

    if (banners.length === 0) return null;

    const currentBanner = banners[currentIndex];

    return (
        <div className="relative w-full h-[400px] md:h-[500px] group overflow-hidden rounded-3xl shadow-2xl">
            {/* Background Image with Overlay */}
            <div
                style={{ backgroundImage: `url(${sanitizeUrl(currentBanner.imageUrl)})` }}
                className="absolute inset-0 w-full h-full bg-center bg-cover transition-all duration-700 ease-in-out transform scale-105"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative h-full container mx-auto px-6 md:px-12 flex items-center">
                <div className="max-w-2xl text-white space-y-6 animate-fade-in-up">
                    <h2 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight">
                        {currentBanner.title}
                    </h2>
                    <p className="text-lg md:text-xl text-slate-200 font-light leading-relaxed">
                        {currentBanner.subtitle}
                    </p>
                    <div className="pt-4">
                        <Link
                            to={currentBanner.link}
                            className="inline-flex items-center px-8 py-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold hover:bg-white hover:text-slate-900 transition-all duration-300 shadow-lg hover:shadow-white/20"
                        >
                            자세히 보기
                            <ChevronRight className="ml-2 w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Navigation Buttons */}
            <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/20"
            >
                <ChevronLeft className="w-6 h-6" />
            </button>
            <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/20"
            >
                <ChevronRight className="w-6 h-6" />
            </button>

            {/* Indicators */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
                {banners.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${currentIndex === index
                            ? 'w-8 bg-white'
                            : 'bg-white/40 hover:bg-white/60'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default HeroBanner;
