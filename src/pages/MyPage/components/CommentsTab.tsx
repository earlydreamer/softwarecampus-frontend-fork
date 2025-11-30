import { Calendar } from 'lucide-react';
import { myComments } from '../data';

const CommentsTab = () => {
    return (
        <div className="lg:col-span-2 space-y-6">
            {/* 통계 카드 */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">작성한 댓글</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{myComments.length}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">이번 달</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">2</p>
                </div>
            </div>

            {/* 댓글 목록 */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">내가 작성한 댓글</h3>
                    <select className="px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        <option>최신순</option>
                        <option>오래된순</option>
                    </select>
                </div>
                <div className="space-y-3">
                    {myComments.map(comment => (
                        <div key={comment.id} className="p-5 rounded-xl bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary-500 hover:shadow-md transition-all">
                            <div className="flex items-start justify-between mb-3">
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    <span className="font-semibold text-primary-600 dark:text-primary-400">{comment.postTitle}</span>에 댓글
                                </p>
                                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {comment.createdAt}
                                </span>
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                                {comment.content}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CommentsTab;
