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
}

const CourseSection: React.FC<CourseSectionProps> = ({ title, courses, loading, link, targetCount }) => {
    const finalTarget = targetCount ?? Math.max(courses.length, 4);
    const isEmpty = !loading && courses.length === 0;
    const placeholdersCount = Math.max(finalTarget - courses.length, 0);

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

            {isEmpty ? (
                <div className="glass-panel p-12 text-center rounded-2xl border-dashed border-2 border-slate-200">
                    <p className="text-slate-500">등록된 과정이 없습니다.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {loading ? (
                        Array.from({ length: finalTarget }).map((_, i) => (
                            <div key={i} className="glass-panel rounded-xl p-4 space-y-4">
                                <Skeleton className="h-40 w-full rounded-lg" />
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        ))
                    ) : (
                        <>
                            {courses.map((course) => (
                                <CourseCard key={course.id} course={course} />
                            ))}
                            {Array.from({ length: placeholdersCount }).map((_, i) => (
                                <div key={`placeholder-${i}`} className="glass-panel rounded-xl border-dashed border-2 border-slate-200 bg-slate-50/50" />
                            ))}
                        </>
                    )}
                </div>
            )}
        </section>
    );
};

export default CourseSection;
