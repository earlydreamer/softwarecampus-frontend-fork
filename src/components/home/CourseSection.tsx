import React from 'react';
import { Link } from 'react-router-dom';
import type { Course } from '../../types';
import CourseCard from '../common/CourseCard';
import { ArrowRight } from 'lucide-react';
import Skeleton from '../ui/Skeleton';

interface CourseSectionProps {
    title: string;
    courses: Course[];
    loading: boolean;
    link?: string;
    targetCount?: number;
    error?: boolean;
    viewMode?: 'carousel' | 'grid';
}

const CourseSection: React.FC<CourseSectionProps> = ({
    title,
    courses,
    loading,
    link,
    targetCount,
    error,
    viewMode = 'carousel'
}) => {
    const finalTarget = targetCount ?? (loading ? 4 : courses.length);
    const isEmpty = !loading && courses.length === 0;

    const containerClasses = viewMode === 'carousel'
        ? [
            'flex overflow-x-auto pb-10 gap-4 snap-x snap-mandatory hide-scrollbar -mx-4 px-4',
            'sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 sm:pb-0 sm:overflow-visible sm:mx-0 sm:px-0'
        ].join(' ')
        : "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4";

    const itemClasses = viewMode === 'carousel'
        ? "min-w-[280px] w-[85vw] sm:w-auto snap-center"
        : "w-full";

    return (
        <section className="py-8">
            <div className="flex justify-between items-end mb-8">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {title}
                </h2>
                {link && (
                    <Link
                        to={link}
                        className="group flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                    >
                        더보기
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                )}
            </div>

            {error ? (
                <div className="glass-panel p-12 text-center rounded-2xl border-dashed border-2 border-slate-200">
                    <p className="text-slate-500">데이터를 불러오는 데 실패했습니다.</p>
                </div>
            ) : isEmpty ? (
                <div className="glass-panel p-12 text-center rounded-2xl border-dashed border-2 border-slate-200">
                    <p className="text-slate-500">등록된 과정이 없습니다.</p>
                </div>
            ) : (
                <div className={containerClasses}>
                    {loading ? (
                        Array.from({ length: finalTarget }).map((_, i) => (
                            <div key={i} className={`${itemClasses} glass-panel rounded-xl p-4 space-y-4`}>
                                <Skeleton className="h-40 w-full rounded-lg" />
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        ))
                    ) : (
                        <>
                            {courses.map((course) => (
                                <div key={course.id} className={itemClasses}>
                                    <CourseCard course={course} />
                                </div>
                            ))}
                        </>
                    )}
                </div>
            )}
        </section>
    );
};

export default CourseSection;
