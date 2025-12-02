import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { CourseFavorite, MyStats } from '../../../types';

interface BookmarksTabProps {
    courses: CourseFavorite[];
    stats: MyStats;
    isLoading?: boolean;
}

const BookmarksTab = ({ courses, stats, isLoading }: BookmarksTabProps) => {
    const navigate = useNavigate();

    if (isLoading) {
        return (
            <div className="lg:col-span-2 flex items-center justify-center py-20" role="status" aria-label="데이터 로딩 중">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" aria-hidden="true" />
                <span className="sr-only">데이터를 불러오는 중입니다...</span>
            </div>
        );
    }

    return (
        <div className="lg:col-span-2 space-y-6">
            {/* 통계 카드 */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">찜한 과정</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalBookmarks}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">현재 페이지</p>
                    <p className="text-2xl font-bold text-pink-600 dark:text-pink-400">{courses.length}</p>
                </div>
            </div>

            {/* 찜한 과정 목록 */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">찜한 과정</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    {courses.length === 0 ? (
                        <div className="col-span-2 text-center py-10 text-slate-500 dark:text-slate-400">
                            찜한 과정이 없습니다.
                        </div>
                    ) : (
                        courses.map(course => (
                            <div 
                                key={course.courseId} 
                                onClick={() => navigate(`/lectures/${course.courseId}`)}
                                onKeyDown={(e) => e.key === 'Enter' && navigate(`/lectures/${course.courseId}`)}
                                role="button"
                                tabIndex={0}
                                className="p-5 rounded-xl bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary-500 hover:shadow-lg transition-all cursor-pointer group"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <span className="px-2.5 py-1 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs font-medium">
                                        강좌
                                    </span>
                                </div>
                                <h3 className="font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                    {course.courseName}
                                </h3>
                                <span className="block w-full py-2 text-sm font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-center group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 transition">
                                    자세히 보기
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookmarksTab;
