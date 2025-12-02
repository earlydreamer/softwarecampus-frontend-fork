import { Calendar, MapPin, Building } from 'lucide-react';
import type { Course } from '../../types';
import { sanitizeUrl } from '../../utils/security';

interface CourseDetailHeaderProps {
    course: Course;
    headerBackgroundImage: string;
}

/**
 * 배경 이미지 URL을 안전하게 처리
 * - sanitizeUrl로 XSS 방지
 * - 따옴표 제거 및 공백 트림
 * - 유효하지 않은 URL은 undefined 반환
 */
const getSafeBackgroundImage = (url: string | undefined): string | undefined => {
    if (!url) return undefined;
    
    const sanitized = sanitizeUrl(url);
    if (!sanitized) return undefined;
    
    // 따옴표 제거 및 공백 트림
    const cleaned = sanitized.replace(/^['"]|['"]$/g, '').trim();
    
    // 빈 문자열이나 '#'만 남은 경우 무효 처리
    if (!cleaned || cleaned === '#') return undefined;
    
    return cleaned;
};

const CourseDetailHeader = ({ course, headerBackgroundImage }: CourseDetailHeaderProps) => {
    const safeBackgroundUrl = getSafeBackgroundImage(headerBackgroundImage);
    
    return (
        <div className="bg-slate-900 text-white py-12 lg:py-20 relative overflow-hidden">
            <div 
                className="absolute inset-0 opacity-40 bg-cover bg-center"
                style={safeBackgroundUrl ? { backgroundImage: `url(${safeBackgroundUrl})` } : undefined}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 rounded-full bg-primary-600/20 text-primary-300 text-sm font-medium border border-primary-500/30">
                        {course.category.name}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white/10 text-slate-300 text-sm font-medium backdrop-blur-sm">
                        {course.format}
                    </span>
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold mb-6 leading-tight">{course.name}</h1>
                <div className="flex flex-wrap items-center gap-6 text-slate-300 text-sm lg:text-base">
                    <div className="flex items-center gap-2">
                        <Building className="w-5 h-5 text-primary-400" />
                        <span>{course.academy.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-primary-400" />
                        <span>{course.location || course.academy.address || '지역 미정'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary-400" />
                        <span>
                            {course.courseStart && course.courseEnd
                                ? `${course.courseStart} ~ ${course.courseEnd}`
                                : '교육 기간 미정'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetailHeader;
