import { FileText, MessageSquare, Bookmark, TrendingUp, Eye, Calendar, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDateKorean } from '../../../utils/dateUtils';
import type { TabType } from '../useMyPage';
import type { MyPost, MyComment, MyStats, CourseFavorite } from '../../../types';

interface OverviewTabProps {
    setActiveTab: (tab: TabType) => void;
    posts: MyPost[];
    comments: MyComment[];
    bookmarkedCourses: CourseFavorite[];
    stats: MyStats;
    isLoading?: boolean;
}

const OverviewTab = ({ setActiveTab, posts, comments, bookmarkedCourses, stats, isLoading }: OverviewTabProps) => {
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
            {/* KPI 카드 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 shadow-lg">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <FileText className="w-5 h-5 text-white" />
                        </div>
                        <TrendingUp className="w-4 h-4 text-white/70" />
                    </div>
                    <p className="text-3xl font-bold text-white mb-1">{stats.totalPosts}</p>
                    <p className="text-sm text-white/80">작성한 글</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 shadow-lg">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                        <TrendingUp className="w-4 h-4 text-white/70" />
                    </div>
                    <p className="text-3xl font-bold text-white mb-1">{stats.totalComments}</p>
                    <p className="text-sm text-white/80">총 댓글</p>
                </div>
                <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-5 shadow-lg">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <Bookmark className="w-5 h-5 text-white" />
                        </div>
                        <TrendingUp className="w-4 h-4 text-white/70" />
                    </div>
                    <p className="text-3xl font-bold text-white mb-1">{stats.totalBookmarks}</p>
                    <p className="text-sm text-white/80">찜한 과정</p>
                </div>
                <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-5 shadow-lg">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <Eye className="w-5 h-5 text-white" />
                        </div>
                        <TrendingUp className="w-4 h-4 text-white/70" />
                    </div>
                    <p className="text-3xl font-bold text-white mb-1">{stats.totalViews}</p>
                    <p className="text-sm text-white/80">총 조회수</p>
                </div>
            </div>

            {/* 최근 게시글 */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">최근 게시글</h3>
                    <button
                        onClick={() => setActiveTab('posts')}
                        className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                    >
                        모두 보기
                    </button>
                </div>
                <div className="space-y-3">
                    {posts.length === 0 ? (
                        <p className="text-center py-6 text-slate-500 dark:text-slate-400">작성한 글이 없습니다.</p>
                    ) : (
                        posts.slice(0, 3).map(post => (
                            <div 
                                key={post.id} 
                                onClick={() => navigate(`/community/${post.id}`)}
                                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${post.category === 'CODING_STORY' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                        }`}>
                                        {post.category === 'CODING_STORY' ? '코딩이야기' : '진로이야기'}
                                    </span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {formatDateKorean(post.createdAt)}
                                    </span>
                                </div>
                                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">{post.title}</h4>
                                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                                    <span className="flex items-center gap-1">
                                        <Eye className="w-3 h-3" />
                                        {post.hits}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <MessageSquare className="w-3 h-3" />
                                        {post.commentsCount}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* 최근 댓글 */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">최근 댓글</h3>
                    <button
                        onClick={() => setActiveTab('comments')}
                        className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                    >
                        모두 보기
                    </button>
                </div>
                <div className="space-y-3">
                    {comments.length === 0 ? (
                        <p className="text-center py-6 text-slate-500 dark:text-slate-400">작성한 댓글이 없습니다.</p>
                    ) : (
                        comments.slice(0, 3).map(comment => (
                            <div 
                                key={comment.id} 
                                onClick={() => navigate(`/community/${comment.boardId}`)}
                                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                            >
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                    <span className="font-medium text-primary-600 dark:text-primary-400">{comment.boardTitle}</span>에 댓글
                                </p>
                                <p className="text-sm text-slate-700 dark:text-slate-300 mb-2 line-clamp-2">{comment.text}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {formatDateKorean(comment.createdAt)}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* 찜한 과정 */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">찜한 과정</h3>
                    <button
                        onClick={() => setActiveTab('bookmarks')}
                        className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                    >
                        모두 보기
                    </button>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    {bookmarkedCourses.length === 0 ? (
                        <p className="col-span-2 text-center py-6 text-slate-500 dark:text-slate-400">찜한 과정이 없습니다.</p>
                    ) : (
                        bookmarkedCourses.slice(0, 2).map(course => (
                            <div 
                                key={course.courseId} 
                                onClick={() => navigate(`/lectures/${course.courseId}`)}
                                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 hover:shadow-md transition-all cursor-pointer border border-slate-200 dark:border-slate-700 group"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <span className="px-2.5 py-1 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs font-medium">
                                        강좌
                                    </span>
                                </div>
                                <h4 className="font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                    {course.courseName}
                                </h4>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default OverviewTab;
