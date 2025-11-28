import React from 'react';
import { Link } from 'react-router-dom';
import type { CommunityPost } from '../../types';
import { ArrowRight, ThumbsUp } from 'lucide-react';
import Skeleton from '../ui/Skeleton';

interface CommunitySectionProps {
    posts: CommunityPost[];
    loading: boolean;
}

const boardColors: Record<string, string> = {
    '공지사항': 'bg-rose-100 text-rose-700 border-rose-200',
    '진로이야기': 'bg-blue-100 text-blue-700 border-blue-200',
    '코딩이야기': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    '문의사항': 'bg-slate-100 text-slate-700 border-slate-200'
};

const CommunitySection: React.FC<CommunitySectionProps> = ({ posts, loading }) => {
    const isEmpty = !loading && posts.length === 0;

    return (
        <section className="py-8">
            <div className="flex justify-between items-end mb-8">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                    커뮤니티 베스트
                </h2>
                <Link
                    to="/community"
                    className="group flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                >
                    더보기
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
            </div>

            {isEmpty ? (
                <div className="glass-panel p-12 text-center rounded-2xl border-dashed border-2 border-slate-200">
                    <p className="text-slate-500">등록된 게시글이 없습니다.</p>
                </div>
            ) : (
                <div className="flex overflow-x-auto pb-4 gap-4 snap-x snap-mandatory md:grid md:grid-cols-3 md:gap-6 md:pb-0 hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="min-w-[280px] w-[85vw] md:w-auto snap-center glass-panel p-6 rounded-xl space-y-4">
                                <Skeleton className="h-6 w-3/4" />
                                <div className="flex justify-between">
                                    <Skeleton className="h-4 w-1/4" />
                                    <Skeleton className="h-4 w-1/4" />
                                </div>
                            </div>
                        ))
                    ) : (
                        posts.map((post) => {
                            const boardName = post.categoryName || '공지사항';
                            const boardClass = boardColors[boardName] ?? 'bg-slate-100 text-slate-700 border-slate-200';

                            return (
                                <Link
                                    to={`/community/${post.id}`}
                                    key={post.id}
                                    className="min-w-[280px] w-[85vw] md:w-auto snap-center glass-panel p-6 rounded-xl hover:scale-[1.02] transition-all duration-300 group"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${boardClass}`}>
                                            {boardName}
                                        </span>
                                        <span className="text-xs text-slate-400">{post.createdAt}</span>
                                    </div>

                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 line-clamp-1 group-hover:text-primary-600 transition-colors">
                                        {post.title}
                                    </h3>

                                    <div className="flex justify-between items-center text-sm text-slate-500">
                                        <span className="font-medium">{post.account.userName}</span>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1">
                                                <ThumbsUp className="w-4 h-4" />
                                                <span>{post.likeCount}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })
                    )}
                </div>
            )}
        </section>
    );
};

export default CommunitySection;
