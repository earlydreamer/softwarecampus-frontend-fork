import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CourseReview } from '../../types';
import { Star, ThumbsUp, ChevronDown, ChevronUp, User, Calendar } from 'lucide-react';
import { REVIEW_SECTION_LABELS } from '../../types';
import { toggleReviewLike } from '../../services/courseService';
import AlertModal from '../ui/AlertModal';

interface CourseReviewsProps {
    reviews: CourseReview[];
    courseId: number;
    isLoading?: boolean;
    onReviewsUpdate?: () => void;
}

const CourseReviews = ({ reviews, courseId, isLoading, onReviewsUpdate }: CourseReviewsProps) => {
    const [sortBy, setSortBy] = useState<'recent' | 'rating'>('recent');
    const [expandedReviews, setExpandedReviews] = useState<Set<number>>(new Set());
    const [likingReviews, setLikingReviews] = useState<Set<number>>(new Set());
    const [localLikeCounts, setLocalLikeCounts] = useState<Map<number, number>>(new Map());
    const [alertModal, setAlertModal] = useState<{ isOpen: boolean; title: string; message: string; type: 'error' | 'warning' | 'info' }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info'
    });
    
    const queryClient = useQueryClient();

    const toggleReview = (reviewId: number) => {
        setExpandedReviews(prev => {
            const newSet = new Set(prev);
            if (newSet.has(reviewId)) {
                newSet.delete(reviewId);
            } else {
                newSet.add(reviewId);
            }
            return newSet;
        });
    };

    const showAlert = (title: string, message: string, type: 'error' | 'warning' | 'info' = 'info') => {
        setAlertModal({ isOpen: true, title, message, type });
    };

    const closeAlert = () => {
        setAlertModal({ isOpen: false, title: '', message: '', type: 'info' });
    };

    const likeMutation = useMutation({
        mutationFn: ({ reviewId }: { reviewId: number }) => 
            toggleReviewLike(courseId, reviewId, 'LIKE'),
        onMutate: async ({ reviewId }) => {
            // 진행 중인 리뷰 쿼리 취소 (경쟁 조건 방지)
            await queryClient.cancelQueries({ queryKey: ['course-reviews', courseId] });
            
            // 현재 상태 스냅샷
            const previousLikeCounts = new Map(localLikeCounts);
            const previousLikingReviews = new Set(likingReviews);
            
            // Optimistic 업데이트: 즉시 UI 반영
            setLikingReviews(prev => new Set(prev).add(reviewId));
            
            const currentReview = reviews.find(r => r.id === reviewId);
            if (currentReview) {
                const currentCount = localLikeCounts.get(reviewId) ?? currentReview.likeCount;
                setLocalLikeCounts(prev => new Map(prev).set(reviewId, currentCount + 1));
            }
            
            // 롤백용 컨텍스트 반환
            return { previousLikeCounts, previousLikingReviews };
        },
        onError: (error: import('axios').AxiosError, _variables, context) => {
            console.error('Failed to like review:', error);
            
            // 롤백: 이전 상태로 복원
            if (context) {
                setLocalLikeCounts(context.previousLikeCounts);
                setLikingReviews(context.previousLikingReviews);
            }
            
            // 401 Unauthorized 체크
            if (error?.response?.status === 401) {
                showAlert('로그인 필요', '로그인이 필요합니다.', 'warning');
            } else {
                showAlert('오류 발생', '좋아요 처리 중 오류가 발생했습니다.', 'error');
            }
        },
        onSuccess: (data, variables) => {
            // 서버 응답으로 최종 업데이트
            setLocalLikeCounts(prev => new Map(prev).set(variables.reviewId, data.likeCount));
        },
        onSettled: (_data, _error, variables) => {
            // 로딩 상태 정리
            setLikingReviews(prev => {
                const newSet = new Set(prev);
                newSet.delete(variables.reviewId);
                return newSet;
            });
            
            // 리뷰 데이터 재조회 (최신 상태 동기화)
            queryClient.invalidateQueries({ queryKey: ['course-reviews', courseId] });
            onReviewsUpdate?.();
        }
    });

    const handleLike = (reviewId: number) => {
        if (likingReviews.has(reviewId)) return;
        
        likeMutation.mutate({ reviewId });
    };

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
            <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full mb-4">
                    <Star className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                </div>
                <p className="text-slate-500 dark:text-slate-400">아직 작성된 수강 후기가 없습니다.</p>
            </div>
        );
    }

    const sortedReviews = [...reviews].sort((a, b) => {
        if (sortBy === 'rating') return b.averageScore - a.averageScore;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const avgRating = reviews.reduce((sum, r) => sum + r.averageScore, 0) / reviews.length;

    return (
        <div className="space-y-6">
            {/* 평점 요약 */}
            <div className="bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 p-6 rounded-2xl border border-primary-100 dark:border-primary-800">
                <div className="flex items-center justify-center gap-6 flex-wrap">
                    <div className="text-center">
                        <div className="text-5xl font-bold text-primary-600 dark:text-primary-400 mb-2">{avgRating.toFixed(1)}</div>
                        <div className="flex items-center justify-center gap-1 mb-1">
                            {[1, 2, 3, 4, 5].map(star => (
                                <Star
                                    key={star}
                                    className={`w-5 h-5 ${star <= avgRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`}
                                />
                            ))}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">{reviews.length}개의 수강 후기</div>
                    </div>
                    <div className="flex-1 min-w-[200px] space-y-2">
                        {[5, 4, 3, 2, 1].map(rating => {
                            const count = reviews.filter(r => Math.round(r.averageScore) === rating).length;
                            const percentage = (count / reviews.length) * 100;
                            return (
                                <div key={rating} className="flex items-center gap-2 text-sm">
                                    <span className="w-12 text-slate-600 dark:text-slate-400">{rating}점</span>
                                    <div className="flex-1 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                                        <div
                                            className="bg-amber-400 h-full transition-all"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <span className="w-12 text-right text-slate-500 dark:text-slate-400">{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* 정렬 */}
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">수강 후기</h3>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'recent' | 'rating')}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                    <option value="recent">최신순</option>
                    <option value="rating">평점순</option>
                </select>
            </div>

            {/* 리뷰 목록 */}
            <div className="space-y-4">
                {sortedReviews.map(review => {
                    const isExpanded = expandedReviews.has(review.id);
                    
                    return (
                        <div 
                            key={review.id} 
                            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary-200 dark:hover:border-primary-700 transition-all overflow-hidden"
                        >
                            {/* 헤더 (항상 표시) */}
                            <button
                                onClick={() => toggleReview(review.id)}
                                className="w-full p-6 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-4 flex-1">
                                        {/* 아바타 */}
                                        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                                            <User className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                                        </div>
                                        
                                        {/* 작성자 정보 및 평점 */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="font-semibold text-slate-900 dark:text-white">{review.writerName}</span>
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                                    <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                                                        {review.averageScore.toFixed(1)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                                <Calendar className="w-4 h-4" />
                                                <span>
                                                    {new Date(review.createdAt).toLocaleDateString('ko-KR', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* 펼치기/접기 아이콘 */}
                                    <div className="flex items-center gap-2">
                                        {isExpanded ? (
                                            <ChevronUp className="w-5 h-5 text-slate-400" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-slate-400" />
                                        )}
                                    </div>
                                </div>
                            </button>

                            {/* 상세 내용 (펼쳤을 때만 표시) */}
                            {isExpanded && (
                                <div className="px-6 pb-6 pt-2 border-t border-slate-100 dark:border-slate-700">
                                    {/* 세부 평점 */}
                                    {review.sections && review.sections.length > 0 && (
                                        <div className="mb-6">
                                            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">세부 평가</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {review.sections.map((section, idx) => (
                                                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                                                        <span className="text-sm text-slate-600 dark:text-slate-400">
                                                            {REVIEW_SECTION_LABELS[section.sectionType]}
                                                        </span>
                                                        <div className="flex items-center gap-1">
                                                            {[1, 2, 3, 4, 5].map(star => (
                                                                <Star
                                                                    key={star}
                                                                    className={`w-4 h-4 ${
                                                                        star <= section.score 
                                                                            ? 'fill-amber-400 text-amber-400' 
                                                                            : 'text-slate-300 dark:text-slate-600'
                                                                    }`}
                                                                />
                                                            ))}
                                                            <span className="ml-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                                                                {section.score}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* 기타 의견 */}
                                    {review.comment && (
                                        <div className="mb-4">
                                            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">후기</h4>
                                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                                                {review.comment}
                                            </p>
                                        </div>
                                    )}

                                    {/* 첨부파일 */}
                                    {review.attachments && review.attachments.length > 0 && (
                                        <div className="mb-4">
                                            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">첨부 파일</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {review.attachments.map((file) => (
                                                    <a
                                                        key={file.id}
                                                        href={file.downloadUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-300 transition-colors"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                        {file.originalFileName}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* 도움이 돼요 버튼 */}
                                    <div className="flex items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                                        <button 
                                            onClick={() => handleLike(review.id)}
                                            disabled={likingReviews.has(review.id)}
                                            className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            aria-label="이 리뷰가 도움이 되었나요?"
                                        >
                                            <ThumbsUp className="w-4 h-4" />
                                            도움이 돼요 ({localLikeCounts.get(review.id) ?? review.likeCount ?? 0})
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Alert Modal */}
            <AlertModal
                isOpen={alertModal.isOpen}
                onClose={closeAlert}
                title={alertModal.title}
                message={alertModal.message}
                type={alertModal.type}
            />
        </div>
    );
};

export default CourseReviews;
