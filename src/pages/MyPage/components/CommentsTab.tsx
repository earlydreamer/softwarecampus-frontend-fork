import { Calendar, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDateKorean } from '../../../utils/dateUtils';
import type { MyComment, MyStats } from '../../../types';

interface CommentsTabProps {
    comments: MyComment[];
    stats: MyStats;
    isLoading?: boolean;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const CommentsTab = ({ comments, stats, isLoading, currentPage, totalPages, onPageChange }: CommentsTabProps) => {
    const navigate = useNavigate();

    if (isLoading) {
        return (
            <div className="lg:col-span-2 flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        );
    }

    return (
        <div className="lg:col-span-2 space-y-6">
            {/* 통계 카드 */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">작성한 댓글</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalComments}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">참여한 게시글</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {new Set(comments.map(c => c.boardId)).size}
                    </p>
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
                    {comments.length === 0 ? (
                        <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                            작성한 댓글이 없습니다.
                        </div>
                    ) : (
                        comments.map(comment => (
                            <div 
                                key={comment.id} 
                                onClick={() => navigate(`/community/${comment.boardId}`)}
                                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), navigate(`/community/${comment.boardId}`))}
                                role="button"
                                tabIndex={0}
                                aria-label={`${comment.boardTitle}에 작성한 댓글 보기`}
                                className="p-5 rounded-xl bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary-500 hover:shadow-md transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        <span className="font-semibold text-primary-600 dark:text-primary-400">{comment.boardTitle}</span>에 댓글
                                    </p>
                                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {formatDateKorean(comment.createdAt)}
                                    </span>
                                </div>
                                <p className="text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                                    {comment.text}
                                </p>
                            </div>
                        ))
                    )}
                </div>

                {/* 페이지네이션 */}
                {totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-6">
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 0}
                            className="px-3 py-1 rounded-lg border border-slate-300 dark:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                            이전
                        </button>
                        <span className="px-3 py-1 text-slate-600 dark:text-slate-400">
                            {currentPage + 1} / {totalPages}
                        </span>
                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage >= totalPages - 1}
                            className="px-3 py-1 rounded-lg border border-slate-300 dark:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                            다음
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommentsTab;
