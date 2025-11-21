import { useState } from 'react';
import type { CourseReview } from '../../types';
import { Star, ThumbsUp, CheckCircle } from 'lucide-react';

interface CourseReviewsProps {
    reviews: CourseReview[];
    isLoading?: boolean;
}

const CourseReviews = ({ reviews, isLoading }: CourseReviewsProps) => {
    const [sortBy, setSortBy] = useState<'recent' | 'rating'>('recent');

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 animate-pulse">
                        <div className="h-4 bg-slate-200 rounded w-1/3 mb-3"></div>
                        <div className="h-20 bg-slate-200 rounded"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (!reviews || reviews.length === 0) {
        return (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-slate-500">아직 작성된 수강 후기가 없습니다.</p>
            </div>
        );
    }

    const sortedReviews = [...reviews].sort((a, b) => {
        if (sortBy === 'rating') return b.rating - a.rating;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    return (
        <div className="space-y-6">
            {/* 평점 요약 */}
            <div className="bg-gradient-to-br from-primary-50 to-blue-50 p-6 rounded-2xl border border-primary-100">
                <div className="flex items-center justify-center gap-6 flex-wrap">
                    <div className="text-center">
                        <div className="text-5xl font-bold text-primary-600 mb-2">{avgRating.toFixed(1)}</div>
                        <div className="flex items-center justify-center gap-1 mb-1">
                            {[1, 2, 3, 4, 5].map(star => (
                                <Star
                                    key={star}
                                    className={`w-5 h-5 ${star <= avgRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                                />
                            ))}
                        </div>
                        <div className="text-sm text-slate-600">{reviews.length}개의 수강 후기</div>
                    </div>
                    <div className="flex-1 min-w-[200px] space-y-2">
                        {[5, 4, 3, 2, 1].map(rating => {
                            const count = reviews.filter(r => r.rating === rating).length;
                            const percentage = (count / reviews.length) * 100;
                            return (
                                <div key={rating} className="flex items-center gap-2 text-sm">
                                    <span className="w-12 text-slate-600">{rating}점</span>
                                    <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden">
                                        <div
                                            className="bg-amber-400 h-full transition-all"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <span className="w-12 text-right text-slate-500">{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* 정렬 */}
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900">수강 후기</h3>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'recent' | 'rating')}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                    <option value="recent">최신순</option>
                    <option value="rating">평점순</option>
                </select>
            </div>

            {/* 리뷰 목록 */}
            <div className="space-y-4">
                {sortedReviews.map(review => (
                    <div key={review.id} className="bg-white p-6 rounded-xl border border-slate-200 hover:border-primary-200 transition-colors">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                                {review.author.avatar ? (
                                    <img src={review.author.avatar} alt={review.author.userName} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-slate-400 font-bold">{review.author.userName[0]}</span>
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold text-slate-900">{review.author.userName}</span>
                                            {review.isVerified && (
                                                <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                                                    <CheckCircle className="w-3 h-3" />
                                                    수강 인증
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-0.5">
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <Star
                                                        key={star}
                                                        className={`w-4 h-4 ${star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-sm text-slate-500">
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <h4 className="font-semibold text-slate-900 mb-2">{review.title}</h4>
                                <p className="text-slate-600 leading-relaxed whitespace-pre-line">{review.content}</p>
                                <div className="mt-4 flex items-center gap-4 text-sm text-slate-500">
                                    <button className="flex items-center gap-1 hover:text-primary-600 transition-colors">
                                        <ThumbsUp className="w-4 h-4" />
                                        도움이 돼요 ({review.helpfulCount || 0})
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CourseReviews;
