import { Calendar, Eye, MessageSquare, ThumbsUp, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDateKorean } from '../../../utils/dateUtils';
import type { MyPost, MyStats, BoardCategory } from '../../../types';
import { BOARD_CATEGORY_LABELS } from '../../../types';

// 카테고리별 스타일 매핑
const CATEGORY_STYLES: Record<BoardCategory, string> = {
    'NOTICE': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    'QUESTION': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    'COURSE_STORY': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'CODING_STORY': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
};

interface PostsTabProps {
    posts: MyPost[];
    stats: MyStats;
    isLoading?: boolean;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const PostsTab = ({ posts, stats, isLoading, currentPage, totalPages, onPageChange }: PostsTabProps) => {
    const navigate = useNavigate();

    const handlePostClick = (postId: number) => {
        navigate(`/community/${postId}`);
    };

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
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">전체 글</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalPosts}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">총 조회</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalViews}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">총 댓글</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.totalComments}</p>
                </div>
            </div>

            {/* 글 목록 */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">내가 작성한 글</h3>
                    <select className="px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        <option>최신순</option>
                        <option>조회순</option>
                        <option>댓글순</option>
                    </select>
                </div>
                <div className="space-y-3">
                    {posts.length === 0 ? (
                        <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                            작성한 글이 없습니다.
                        </div>
                    ) : (
                        posts.map(post => (
                            <div 
                                key={post.id} 
                                onClick={() => handlePostClick(post.id)}
                                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), handlePostClick(post.id))}
                                role="button"
                                tabIndex={0}
                                className="p-5 rounded-xl bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary-500 hover:shadow-md transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${CATEGORY_STYLES[post.category as BoardCategory] || 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400'}`}>
                                        {BOARD_CATEGORY_LABELS[post.category as BoardCategory] || post.category}
                                    </span>
                                    <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        {formatDateKorean(post.createdAt)}
                                    </span>
                                </div>
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-3">{post.title}</h3>
                                <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
                                    <span className="flex items-center gap-1.5">
                                        <Eye className="w-4 h-4" />
                                        조회 {post.hits}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <MessageSquare className="w-4 h-4" />
                                        댓글 {post.commentsCount}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <ThumbsUp className="w-4 h-4" />
                                        좋아요 {post.likeCount}
                                    </span>
                                </div>
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

export default PostsTab;
