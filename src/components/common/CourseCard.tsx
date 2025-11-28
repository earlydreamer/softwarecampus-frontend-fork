import React from 'react';
import { Link } from 'react-router-dom';
import type { Course } from '../../types';
import { Star, MessageSquare } from 'lucide-react';
import { sanitizeUrl } from '../../utils/security';

interface CourseCardProps {
    course: Course;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
    return (
        <div className="glass-panel rounded-xl overflow-hidden hover:scale-[1.02] transition-transform duration-300 group">
            <Link to={`/lectures/${course.id}`} className="block h-full">
                <div className="relative h-48 overflow-hidden">
                    <img
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        src={sanitizeUrl(course.imageUrl || '')}
                        alt={course.name || '과정 이미지'}
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
                </div>

                <div className="p-5 flex flex-col h-[calc(100%-12rem)]">
                    <p className="text-xs font-medium text-primary-600 mb-1">
                        {course.academy?.name || '소프트웨어캠퍼스'}
                    </p>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                        {course.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-1">
                        {course.duration || '기간 미정'}
                    </p>

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
