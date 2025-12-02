import React from 'react';
import { Link } from 'react-router-dom';
import type { Course } from '../../types';
import { Star, MessageSquare } from 'lucide-react';
import { sanitizeUrl } from '../../utils/security';
import { getCourseDurationInfo, getCourseStatus, type CourseStatus } from '../../utils/dateUtils';
import { DEFAULT_IMAGES } from '../../constants';

const DEFAULT_COURSE_IMAGE = DEFAULT_IMAGES.COURSE_THUMBNAIL;

interface CourseCardProps {
    course: Course;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
    // 이미지 로딩 에러 핸들러 (무한 루프 방지)
    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const img = e.currentTarget;
        // 이미 폴백 이미지인 경우 핸들러 제거하여 무한 루프 방지
        if (img.src === DEFAULT_COURSE_IMAGE) {
            img.onerror = null;
            return;
        }
        img.src = DEFAULT_COURSE_IMAGE;
    };

    // 강의 기간 정보 계산
    const durationInfo = getCourseDurationInfo(
        course.courseStart || '',
        course.courseEnd || ''
    );

    const status = getCourseStatus(
        course.recruitStart || '',
        course.recruitEnd || '',
        course.courseStart || '',
        course.courseEnd || ''
    );

    const getStatusBadge = () => {
        const statusConfig: Partial<Record<CourseStatus, { label: string; color: string }>> = {
            RECRUITING: { label: '모집중', color: 'bg-blue-500/90' },
            IN_PROGRESS: { label: '진행중', color: 'bg-green-500/90' },
            ENDED: { label: '종료', color: 'bg-slate-500/90' },
        };

        const config = statusConfig[status];
        if (!config) {
            return null;
        }

        const baseClasses = 'px-2.5 py-1 rounded-full text-xs font-semibold text-white backdrop-blur-sm shadow-sm';

        return (
            <span className={`${baseClasses} ${config.color}`}>
                {config.label}
            </span>
        );
    };

    return (
        <div className="glass-panel rounded-xl overflow-hidden hover:scale-[1.02] transition-transform duration-300 group">
            <Link to={`/lectures/${course.id}`} className="block h-full">
                <div className="relative h-48 overflow-hidden">
                    <img
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        src={sanitizeUrl(course.imageUrl || '') || DEFAULT_COURSE_IMAGE}
                        alt={course.name || '과정 이미지'}
                        onError={handleImageError}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="absolute top-3 left-3 flex gap-2">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-500/90 text-white backdrop-blur-sm shadow-sm">
                            {course.category?.name || '카테고리'}
                        </span>
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800/80 text-white backdrop-blur-sm shadow-sm">
                            {course.format}
                        </span>
                    </div>

                    <div className="absolute top-3 right-3 flex gap-2">
                        {getStatusBadge()}
                    </div>
                </div>

                <div className="p-5 flex flex-col h-[calc(100%-12rem)]">
                    <p className="text-xs font-medium text-primary-600 mb-1">
                        {course.academy?.name || '소프트웨어캠퍼스'}
                    </p>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                        {course.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-4">
                        {durationInfo.months > 0 && (
                            <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 whitespace-nowrap">
                                {durationInfo.months}개월
                            </span>
                        )}
                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">
                            {durationInfo.duration}
                        </p>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-1 text-amber-500">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                {course.rating?.toFixed(1) || '0.0'}
                            </span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-400">
                            <MessageSquare className="w-4 h-4" />
                            <span className="text-sm">{course.reviewCount || 0}</span>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default CourseCard;
