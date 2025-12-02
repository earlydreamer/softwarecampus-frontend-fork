import { CheckCircle2 } from 'lucide-react';
import { sanitizeTiptapContent } from '../../utils/htmlSanitizer';
import type { Course } from '../../types';

interface CourseOverviewProps {
    course: Course;
}

const CourseOverview = ({ course }: CourseOverviewProps) => {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">과정 소개</h2>
            
            {/* 과정 설명 */}
            {course.description ? (
                <div 
                    className="text-slate-600 dark:text-slate-300 leading-relaxed prose prose-slate dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ 
                        __html: sanitizeTiptapContent(course.description)
                    }}
                />
            ) : (
                <p className="text-slate-500 dark:text-slate-400">과정 상세 설명이 없습니다.</p>
            )}

            {/* 하이라이트 */}
            {course.highlights && (
                <div className="mt-8">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">이런 점이 좋아요</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {course.highlights.map((highlight, idx) => (
                            <div key={idx} className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
                                <span className="text-slate-700 dark:text-slate-300">{highlight}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseOverview;
