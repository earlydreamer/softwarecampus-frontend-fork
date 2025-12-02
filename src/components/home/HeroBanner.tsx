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

/**
 * 기본 그라데이션 배경 - 이미지가 없거나 로드 실패 시 표시
 */
const DefaultGradientBackground: React.FC<{ className?: string }> = ({ className = '' }) => (
    <>
        {/* 그라디언트 배경 */}
        <div className={`absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 ${className}`} />
        
        {/* 장식 요소 */}
        <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        </div>
    </>
);

/**
 * 기본 배너 컴포넌트 - 배너가 없거나 로드 실패 시 표시
 */
const DefaultBanner: React.FC = () => (
    <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden rounded-3xl shadow-2xl">
        <DefaultGradientBackground />
        
        {/* 콘텐츠 */}
        <div className="relative h-full flex items-center justify-center">
            <div className="text-center text-white space-y-4">
                <h2 className="text-5xl md:text-7xl font-extrabold tracking-tight">
                    Softwarecampus
                </h2>
                <p className="text-lg md:text-xl text-white/80 font-light">
                    최고의 교육 과정으로 여러분의 커리어를 시작하세요
                </p>
            </div>
        </div>
    </div>
);

/**
 * 배너 이미지 배경 - 이미지 로드 실패 시 그라데이션으로 폴백
 */
const BannerBackground: React.FC<{ imageUrl: string | undefined }> = ({ imageUrl }) => {
    const [imageError, setImageError] = useState(false);
    const sanitizedUrl = imageUrl ? sanitizeUrl(imageUrl) : '';

    // imageUrl이 변경되면 에러 상태 리셋
    useEffect(() => {
        setImageError(false);
    }, [imageUrl]);

    // 이미지가 없거나 로드 실패 시 그라데이션 배경
    if (!sanitizedUrl || imageError) {
        return <DefaultGradientBackground />;
    }

    return (
        <>
            {/* 실제 이미지 배경 */}
            <div
                style={{ backgroundImage: `url(${sanitizedUrl})` }}
                className="absolute inset-0 w-full h-full bg-center bg-cover transition-all duration-700 ease-in-out transform scale-105"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
            </div>
            {/* 이미지 로드 체크용 숨겨진 img 태그 */}
            <img
                src={sanitizedUrl}
                alt=""
                className="hidden"
                onError={() => setImageError(true)}
            />
        </>
    );
};

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

    // banners 배열 길이가 변경될 때 currentIndex를 유효한 범위로 조정
    useEffect(() => {
        if (banners.length > 0 && currentIndex >= banners.length) {
            // currentIndex가 범위를 벗어나면 마지막 유효한 인덱스로 설정
            setCurrentIndex(banners.length - 1);
        } else if (banners.length === 0) {
            // 배너가 모두 제거되면 0으로 리셋
            setCurrentIndex(0);
        }
    }, [banners.length, currentIndex]);

    useEffect(() => {
        if (!loading && banners.length > 0) {
            const timer = setTimeout(goToNext, 5000);
            return () => clearTimeout(timer);
        }
    }, [currentIndex, loading, banners.length, goToNext]);

    if (loading) {
        return <Skeleton className="w-full h-[400px] md:h-[500px] rounded-2xl" />;
    }

    // 배너가 없을 경우 기본 배너 표시
    if (banners.length === 0) {
        return <DefaultBanner />;
    }

    const currentBanner = banners[currentIndex];

    // 추가 안전장치: currentIndex가 여전히 범위를 벗어난 경우 기본 배너 표시
    if (!currentBanner) {
        return <DefaultBanner />;
    }

    return (
        <div className="relative w-full h-[400px] md:h-[500px] group overflow-hidden rounded-3xl shadow-2xl">
            {/* Background Image with Overlay (이미지 로드 실패 시 그라데이션으로 폴백) */}
            <BannerBackground imageUrl={currentBanner.imageUrl} />

            {/* Content */}
            <div className="relative h-full container mx-auto px-16 md:px-24 flex items-center">
                <div className="max-w-2xl md:max-w-4xl lg:max-w-5xl text-white space-y-6 animate-fade-in-up">
                    <h2 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight break-keep">
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
                type="button"
                onClick={goToPrevious}
                aria-label="이전 배너"
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/20"
            >
                <ChevronLeft className="w-6 h-6" />
            </button>
            <button
                type="button"
                onClick={goToNext}
                aria-label="다음 배너"
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/20"
            >
                <ChevronRight className="w-6 h-6" />
            </button>

            {/* Indicators */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
                {banners.map((_, index) => (
                    <button
                        type="button"
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        aria-label={`배너 ${index + 1}번으로 이동`}
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
