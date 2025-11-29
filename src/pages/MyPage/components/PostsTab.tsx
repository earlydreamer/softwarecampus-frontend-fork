import { Calendar, Eye, MessageSquare } from 'lucide-react';
import { myPosts } from '../data';

const PostsTab = () => {
    const totalViews = myPosts.reduce((sum, post) => sum + post.views, 0);
    const totalComments = myPosts.reduce((sum, post) => sum + post.comments, 0);

    return (
        <div className="lg:col-span-2 space-y-6">
            {/* 통계 카드 */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">전체 글</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{myPosts.length}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">총 조회</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalViews}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">총 댓글</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{totalComments}</p>
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
                    {myPosts.map(post => (
                        <div key={post.id} className="p-5 rounded-xl bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary-500 hover:shadow-md transition-all cursor-pointer">
                            <div className="flex items-start justify-between mb-3">
                                <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${post.category === 'CODING_STORY' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                    }`}>
                                    {post.category === 'CODING_STORY' ? '코딩이야기' : '진로이야기'}
                                </span>
                                <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {post.createdAt}
                                </span>
                            </div>
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-3">{post.title}</h3>
                            <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
                                <span className="flex items-center gap-1.5">
                                    <Eye className="w-4 h-4" />
                                    조회 {post.views}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <MessageSquare className="w-4 h-4" />
                                    댓글 {post.comments}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PostsTab;
