import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CourseReview, ReviewSection } from '../../types';
import { Star, ThumbsUp, ChevronDown, ChevronUp, User, Calendar, Pencil, AlertCircle } from 'lucide-react';
import { REVIEW_SECTION_LABELS } from '../../types';
import { toggleReviewLike, createCourseReview, updateCourseReview, uploadReviewFile } from '../../services/courseService';
import { sanitizeUrl } from '../../utils/security';
import AlertModal from '../ui/AlertModal';
import { useAuthStore } from '../../store/authStore';
import ReviewEditor from './ReviewEditor';
import DOMPurify from 'dompurify';

type ApiErrorResponse = {
    response?: {
        status?: number;
        data?: {
            detail?: string;
        };
    };
};

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
    const [localLikeTypes, setLocalLikeTypes] = useState<Map<number, string>>(new Map()); // 추가: 로컬 좋아요 상태 관리
    const [alertModal, setAlertModal] = useState<{ isOpen: boolean; title: string; message: string; type: 'error' | 'warning' | 'info' }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info'
    });
    // 거부 사유 모달 상태 (2025-12-02 추가)
    const [rejectionReasonModal, setRejectionReasonModal] = useState<{ isOpen: boolean; reason: string }>({
        isOpen: false,
        reason: ''
    });
    // 리뷰 수정 모드 상태 (2025-12-02 추가)
    const [editingReview, setEditingReview] = useState<CourseReview | null>(null);

    // 리뷰 데이터가 변경되면 로컬 상태 초기화
    useEffect(() => {
        const counts = new Map<number, number>();
        const types = new Map<number, string>();
        reviews.forEach(r => {
            counts.set(r.id, r.likeCount);
            types.set(r.id, r.myLikeType || 'NONE');
        });
        setLocalLikeCounts(counts);
        setLocalLikeTypes(types);
    }, [reviews]);

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
            const previousLikeTypes = new Map(localLikeTypes);
            const previousLikingReviews = new Set(likingReviews);

            // Optimistic 업데이트: 즉시 UI 반영
            setLikingReviews(prev => new Set(prev).add(reviewId));

            const currentType = localLikeTypes.get(reviewId) || 'NONE';
            const currentCount = localLikeCounts.get(reviewId) || 0;

            // 토글 로직 시뮬레이션
            if (currentType === 'LIKE') {
                // 이미 좋아요 상태면 취소 (NONE)
                setLocalLikeTypes(prev => new Map(prev).set(reviewId, 'NONE'));
                setLocalLikeCounts(prev => new Map(prev).set(reviewId, Math.max(0, currentCount - 1)));
            } else {
                // 좋아요 설정 (LIKE)
                setLocalLikeTypes(prev => new Map(prev).set(reviewId, 'LIKE'));
                setLocalLikeCounts(prev => new Map(prev).set(reviewId, currentCount + 1));
            }

            // 롤백용 컨텍스트 반환
            return { previousLikeCounts, previousLikeTypes, previousLikingReviews };
        },
        onError: (error: unknown, _variables, context) => {
            const apiError = error as ApiErrorResponse;
            console.error('Failed to like review:', error);

            // 롤백: 이전 상태로 복원
            if (context) {
                setLocalLikeCounts(context.previousLikeCounts);
                setLocalLikeTypes(context.previousLikeTypes);
                setLikingReviews(context.previousLikingReviews);
            }

            // 401 Unauthorized 체크
            if (apiError.response?.status === 401) {
                showAlert('로그인 필요', '로그인이 필요합니다.', 'warning');
            } else {
                const errorMessage = apiError.response?.data?.detail || '좋아요 처리 중 오류가 발생했습니다.';
                showAlert('오류 발생', errorMessage, 'error');
            }
        },
        onSuccess: (data, variables) => {
            // 서버 응답으로 최종 업데이트
            setLocalLikeCounts(prev => new Map(prev).set(variables.reviewId, data.likeCount));
            setLocalLikeTypes(prev => new Map(prev).set(variables.reviewId, data.type));
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

    const { user, isAuthenticated } = useAuthStore();
    const [isWritingReview, setIsWritingReview] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 이미 작성한 리뷰가 있는지 확인 (거부된 리뷰는 제외 - 다시 작성 가능)
    const myReview = reviews.find(r => r.writerId === user?.id && r.approvalStatus !== 'REJECTED');
    // 내 리뷰의 승인 상태
    const myReviewStatus = myReview?.approvalStatus;

    // 거부 사유 보기 (2025-12-02 추가)
    const handleShowRejectionReason = (reason: string | null | undefined) => {
        setRejectionReasonModal({
            isOpen: true,
            reason: reason || '거부 사유가 기록되지 않았습니다.'
        });
    };

    // 리뷰 수정 시작 (2025-12-02 추가)
    const handleEditReview = (review: CourseReview) => {
        setEditingReview(review);
    };

    // 리뷰 수정 제출 (2025-12-02 추가)
    const handleReviewUpdate = async (data: { comment: string; sections: ReviewSection[]; file?: File }) => {
        if (!user || !editingReview) return;

        setIsSubmitting(true);
        try {
            // 1. 리뷰 수정
            await updateCourseReview(courseId, editingReview.id, {
                comment: data.comment,
                sections: data.sections,
            });

            // 2. 파일 업로드 (있을 경우)
            if (data.file) {
                await uploadReviewFile(courseId, editingReview.id, data.file);
            }

            // 3. 성공 처리
            setEditingReview(null);
            const wasRejected = editingReview.approvalStatus === 'REJECTED';
            showAlert(
                '수정 완료',
                wasRejected
                    ? '후기가 수정되어 재심사 대기 상태로 변경되었습니다.'
                    : '후기가 수정되었습니다.',
                'info'
            );
            onReviewsUpdate?.();
        } catch (error) {
            console.error('Review update failed:', error);
            showAlert('오류 발생', '후기 수정 중 오류가 발생했습니다.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleWriteClick = () => {
        if (!isAuthenticated) {
            showAlert('로그인 필요', '후기를 작성하려면 로그인이 필요합니다.', 'warning');
            return;
        }
        if (myReviewStatus === 'PENDING') {
            showAlert('승인 대기 중', '작성한 후기가 승인 대기 중입니다.', 'info');
            return;
        }
        if (myReviewStatus === 'APPROVED') {
            showAlert('작성 불가', '이미 이 과정에 대한 후기를 작성하셨습니다.', 'info');
            return;
        }
        setIsWritingReview(true);
    };

    const handleReviewSubmit = async (data: { comment: string; sections: ReviewSection[]; file?: File }) => {
        if (!user) return;

        setIsSubmitting(true);
        try {
            // 1. 리뷰 생성
            const newReview = await createCourseReview(courseId, {
                comment: data.comment,
                sections: data.sections,
            });

            // 2. 파일 업로드 (있을 경우)
            if (data.file) {
                await uploadReviewFile(courseId, newReview.id, data.file);
            }

            // 3. 성공 처리
            setIsWritingReview(false);
            showAlert('작성 완료', '후기가 등록되었습니다. 관리자 승인 후 공개됩니다.', 'info');
            onReviewsUpdate?.();
        } catch (error) {
            console.error('Review submission failed:', error);
            showAlert('오류 발생', '후기 작성 중 오류가 발생했습니다.', 'error');
        } finally {
            setIsSubmitting(false);
        }
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

    // 리뷰 작성 중일 때
    if (isWritingReview) {
        return (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">수강 후기 작성</h3>
                <ReviewEditor
                    onSubmit={handleReviewSubmit}
                    onCancel={() => setIsWritingReview(false)}
                    isSubmitting={isSubmitting}
                />
            </div>
        );
    }

    // 리뷰 수정 중일 때 (2025-12-02 추가)
    if (editingReview) {
        return (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">수강 후기 수정</h3>
                {editingReview.approvalStatus === 'REJECTED' && (
                    <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                            <div>
                                <p className="font-medium text-red-700 dark:text-red-400">거부된 후기입니다</p>
                                <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                                    거부 사유: {editingReview.rejectionReason || '사유가 기록되지 않았습니다.'}
                                </p>
                                <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                                    수정 후 제출하면 재심사 요청됩니다.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
                <ReviewEditor
                    onSubmit={handleReviewUpdate}
                    onCancel={() => setEditingReview(null)}
                    isSubmitting={isSubmitting}
                    initialData={{
                        comment: editingReview.comment,
                        sections: editingReview.sections,
                    }}
                />
            </div>
        );
    }

    if (!reviews || reviews.length === 0) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">수강 후기</h3>
                    <button
                        onClick={handleWriteClick}
                        className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        후기 작성하기
                    </button>
                </div>
                <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full mb-4">
                        <Star className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400">아직 작성된 수강 후기가 없습니다.</p>
                    <p className="text-sm text-slate-400 mt-2">첫 번째 후기를 작성해보세요!</p>
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

            {/* 정렬 및 작성 버튼 */}
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">수강 후기</h3>
                <div className="flex items-center gap-3">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'recent' | 'rating')}
                        className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="recent">최신순</option>
                        <option value="rating">평점순</option>
                    </select>
                    {myReviewStatus === 'PENDING' ? (
                        <span className="px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-lg text-sm">
                            작성한 후기가 승인 대기 중입니다
                        </span>
                    ) : myReviewStatus === 'APPROVED' ? (
                        <span className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-lg text-sm">
                            이미 후기를 작성하셨습니다
                        </span>
                    ) : (
                        <button
                            onClick={handleWriteClick}
                            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                            후기 작성
                        </button>
                    )}
                </div>
            </div>

            {/* 리뷰 목록 */}
            <div className="space-y-4">
                {sortedReviews.map(review => {
                    const isExpanded = expandedReviews.has(review.id);
                    const isLiked = localLikeTypes.get(review.id) === 'LIKE'; // 좋아요 여부 확인
                    const isPending = review.approvalStatus === 'PENDING';
                    const isRejected = review.approvalStatus === 'REJECTED';
                    const isMyReview = review.writerId === user?.id;

                    return (
                        <div
                            key={review.id}
                            className={`bg-white dark:bg-slate-800 rounded-xl border transition-all overflow-hidden ${
                                isRejected
                                    ? 'border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-900/10'
                                    : isPending
                                        ? 'border-yellow-200 bg-yellow-50/50 dark:border-yellow-900/50 dark:bg-yellow-900/10'
                                        : 'border-slate-200 dark:border-slate-700 hover:border-primary-200 dark:hover:border-primary-700'
                            }`}
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
                                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                <span className="font-semibold text-slate-900 dark:text-white">{review.writerName}</span>
                                                {isMyReview && (
                                                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
                                                        내 후기
                                                    </span>
                                                )}
                                                {isPending && (
                                                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800">
                                                        승인 대기 중
                                                    </span>
                                                )}
                                                {isRejected && (
                                                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border border-red-200 dark:border-red-800">
                                                        거부됨
                                                    </span>
                                                )}
                                                <div className="flex items-center gap-1 ml-auto sm:ml-2">
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
                                                {review.sections.map((section) => (
                                                    <div key={section.sectionType} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                                                        <span className="text-sm text-slate-600 dark:text-slate-400">
                                                            {REVIEW_SECTION_LABELS[section.sectionType]}
                                                        </span>
                                                        <div className="flex items-center gap-1">
                                                            {[1, 2, 3, 4, 5].map(star => (
                                                                <Star
                                                                    key={star}
                                                                    className={`w-4 h-4 ${star <= section.score
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
                                            <div
                                                className="text-slate-600 dark:text-slate-300 leading-relaxed prose prose-sm max-w-none dark:prose-invert"
                                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(review.comment) }}
                                            />
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
                                                        href={sanitizeUrl(file.downloadUrl || '')}
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

                                    {/* 도움이 돼요 버튼 및 액션 버튼 */}
                                    <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex-wrap">
                                        <button
                                            onClick={() => handleLike(review.id)}
                                            disabled={likingReviews.has(review.id)}
                                            className={`flex items-center gap-2 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isLiked
                                                ? 'text-primary-600 dark:text-primary-400 font-medium'
                                                : 'text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400'
                                                }`}
                                            aria-label="이 리뷰가 도움이 되었나요?"
                                        >
                                            <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                                            도움이 돼요 ({localLikeCounts.get(review.id) ?? review.likeCount ?? 0})
                                        </button>

                                        {/* 본인 리뷰인 경우 수정/거부사유 버튼 (2025-12-02 추가) */}
                                        {isMyReview && (isPending || isRejected) && (
                                            <div className="flex items-center gap-2">
                                                {isRejected && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleShowRejectionReason(review.rejectionReason);
                                                        }}
                                                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    >
                                                        <AlertCircle className="w-4 h-4" />
                                                        거부 사유
                                                    </button>
                                                )}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEditReview(review);
                                                    }}
                                                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                    수정하기
                                                </button>
                                            </div>
                                        )}
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

            {/* 거부 사유 모달 (2025-12-02 추가) */}
            <AlertModal
                isOpen={rejectionReasonModal.isOpen}
                onClose={() => setRejectionReasonModal({ isOpen: false, reason: '' })}
                title="거부 사유"
                message={rejectionReasonModal.reason}
                type="error"
            />
        </div>
    );
};

export default CourseReviews;
