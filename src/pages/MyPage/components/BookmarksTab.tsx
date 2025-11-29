import { bookmarkedCourses } from '../data';

const BookmarksTab = () => {
    return (
        <div className="lg:col-span-2 space-y-6">
            {/* 통계 카드 */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">찜한 과정</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{bookmarkedCourses.length}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">평균 평점</p>
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                        {(bookmarkedCourses.reduce((sum, c) => sum + c.rating, 0) / bookmarkedCourses.length).toFixed(1)}
                    </p>
                </div>
            </div>

            {/* 찜한 과정 목록 */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">찜한 과정</h3>
                    <select className="px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        <option>전체</option>
                        <option>프론트엔드</option>
                        <option>백엔드</option>
                    </select>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    {bookmarkedCourses.map(course => (
                        <div key={course.id} className="p-5 rounded-xl bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary-500 hover:shadow-lg transition-all cursor-pointer group">
                            <div className="flex items-start justify-between mb-3">
                                <span className="px-2.5 py-1 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs font-medium">
                                    {course.category}
                                </span>
                                <div className="flex items-center gap-1 text-yellow-500">
                                    <span className="text-sm font-semibold">⭐ {course.rating}</span>
                                </div>
                            </div>
                            <h3 className="font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                {course.title}
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{course.academy}</p>
                            <button className="w-full py-2 text-sm font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition">
                                자세히 보기
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BookmarksTab;
