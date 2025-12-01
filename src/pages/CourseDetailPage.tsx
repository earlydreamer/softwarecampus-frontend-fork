import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCourseById, fetchCourseReviews, fetchCourseQnAs } from '../services/courseService';
import { addCourseFavorite, removeCourseFavorite, checkCourseFavorite } from '../services/favoriteService';
import { Calendar, MapPin, Clock, Building, CheckCircle2, Share2, Heart } from 'lucide-react';
import { sanitizeUrl } from '../utils/security';
import Skeleton from '../components/ui/Skeleton';
import CourseReviews from '../components/course/CourseReviews';
import CourseQnAs from '../components/course/CourseQnAs';
import ShareModal from '../components/ui/ShareModal';
import { QNA_PER_PAGE } from '../constants';


const CourseDetailPage = () => {
    const { courseId } = useParams<{ courseId: string }>();

    // courseId 명시적 검증
    const parsedId = courseId ? parseInt(courseId, 10) : NaN;
    const isValidId = !isNaN(parsedId) && parsedId > 0;
    const id = isValidId ? parsedId : null;

    const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'qna'>('overview');
    const [qnaPage, setQnaPage] = useState(1);
    const [qnaSearchKeyword, setQnaSearchKeyword] = useState('');
    const [showShareModal, setShowShareModal] = useState(false);

    const queryClient = useQueryClient();

    const {
        data: course,
        isLoading,
        isError: isCourseError,
        error: courseError,
        refetch: refetchCourse
    } = useQuery({
        queryKey: ['course', id],
        queryFn: () => fetchCourseById(id!),
        enabled: isValidId,
    });

    const {
        data: reviews,
        isLoading: isReviewsLoading,
        isError: isReviewsError,
        error: reviewsError,
        refetch: refetchReviews
    } = useQuery({
        queryKey: ['course-reviews', id],
        queryFn: () => fetchCourseReviews(id!),
        enabled: isValidId,
    });

    const {
        data: qnaData,
        isLoading: isQnAsLoading,
        isError: isQnAsError,
        error: qnasError,
        refetch: refetchQnAs
    } = useQuery({
        queryKey: ['course-qnas', id, qnaPage, qnaSearchKeyword],
        queryFn: () => fetchCourseQnAs(
            id!,
            qnaPage,
            QNA_PER_PAGE,
            qnaSearchKeyword
        ),
        enabled: isValidId && !!course, // course 정보가 로드된 후에 실행
    });

    // 찜하기 상태 조회 (인증 토큰으로 사용자 식별)
    const {
        data: favoriteCheckResult
    } = useQuery({
        queryKey: ['course-favorite', id],
        queryFn: () => checkCourseFavorite(id!),
        enabled: isValidId && !!course,
    });

    // 찜 상태를 query 결과에서 직접 계산
    const isFavorite = favoriteCheckResult?.favorited ?? false;

    // 찜하기 추가 Mutation
    const addFavoriteMutation = useMutation({
        mutationFn: () => addCourseFavorite(id!),
        onMutate: async () => {
            // 진행 중인 쿼리 취소
            await queryClient.cancelQueries({ queryKey: ['course-favorite', id] });

            // 이전 상태 스냅샷 저장
            const previousFavorite = queryClient.getQueryData(['course-favorite', id]);

            // 낙관적 업데이트: 찜한 상태로 변경
            queryClient.setQueryData(['course-favorite', id], { favorited: true });

            return { previousFavorite };
        },
        onError: (error, _, context) => {
            console.error('Failed to add favorite:', error);
            // 에러 시 롤백
            if (context?.previousFavorite) {
                queryClient.setQueryData(['course-favorite', id], context.previousFavorite);
            }
            alert('찜하기 처리 중 오류가 발생했습니다.');
        },
        onSettled: () => {
            // 성공/실패 여부와 관계없이 쿼리 무효화하여 최신 상태 동기화
            queryClient.invalidateQueries({ queryKey: ['course-favorite', id] });
        }
    });

    // 찜하기 삭제 Mutation
    const removeFavoriteMutation = useMutation({
        mutationFn: () => removeCourseFavorite(id!),
        onMutate: async () => {
            // 진행 중인 쿼리 취소
            await queryClient.cancelQueries({ queryKey: ['course-favorite', id] });

            // 이전 상태 스냅샷 저장
            const previousFavorite = queryClient.getQueryData(['course-favorite', id]);

            // 낙관적 업데이트: 찜하지 않은 상태로 변경
            queryClient.setQueryData(['course-favorite', id], { favorited: false });

            return { previousFavorite };
        },
        onError: (error, _, context) => {
            console.error('Failed to remove favorite:', error);
            // 에러 시 롤백
            if (context?.previousFavorite) {
                queryClient.setQueryData(['course-favorite', id], context.previousFavorite);
            }
            alert('찜 삭제 처리 중 오류가 발생했습니다.');
        },
        onSettled: () => {
            // 성공/실패 여부와 관계없이 쿼리 무효화하여 최신 상태 동기화
            queryClient.invalidateQueries({ queryKey: ['course-favorite', id] });
        }
    });

    const handleFavoriteClick = () => {
        if (!course) return;

        if (isFavorite) {
            removeFavoriteMutation.mutate();
        } else {
            addFavoriteMutation.mutate();
        }
    };

    const handleShareClick = () => {
        setShowShareModal(true);
    };

    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

    // 유효하지 않은 ID 처리
    if (!isValidId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
                <div className="max-w-md w-full mx-4">
                    <div className="glass-panel p-8 rounded-2xl border-2 border-red-200 dark:border-red-800">
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
                                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-red-800 dark:text-red-200 mb-2">
                                유효하지 않은 과정 ID
                            </h3>
                            <p className="text-red-700 dark:text-red-300 mb-6">
                                {courseId ? `"${courseId}"는 올바른 과정 ID가 아닙니다.` : '과정 ID가 제공되지 않았습니다.'}
                            </p>
                        </div>
                        <Link
                            to="/lectures"
                            className="block w-full px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors text-center font-medium"
                        >
                            과정 목록으로 돌아가기
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // 과정 데이터 로딩 에러 처리
    if (isCourseError) {
        const errorMessage = courseError instanceof Error
            ? courseError.message
            : '과정 정보를 불러오는 중 오류가 발생했습니다.';

        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
                <div className="max-w-md w-full mx-4">
                    <div className="glass-panel p-8 rounded-2xl border-2 border-orange-200 dark:border-orange-800">
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full mb-4">
                                <svg className="w-8 h-8 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-orange-800 dark:text-orange-200 mb-2">
                                과정 로드 실패
                            </h3>
                            <p className="text-orange-700 dark:text-orange-300 mb-6">
                                {errorMessage}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => refetchCourse()}
                                className="flex-1 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl transition-colors font-medium"
                            >
                                다시 시도
                            </button>
                            <Link
                                to="/lectures"
                                className="flex-1 px-4 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-xl transition-colors text-center font-medium"
                            >
                                목록으로
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-12">
                <Skeleton className="h-8 w-2/3 mb-4" />
                <Skeleton className="h-64 w-full rounded-2xl mb-8" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-4">
                        <Skeleton className="h-40 w-full" />
                        <Skeleton className="h-40 w-full" />
                    </div>
                    <Skeleton className="h-80 w-full" />
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">과정을 찾을 수 없습니다.</h2>
                <Link to="/lectures" className="text-primary-600 hover:underline">과정 목록으로 돌아가기</Link>
            </div>
        );
    }

    return (
        <div className="pb-20">
            {/* Header Section */}
            <div className="bg-slate-900 text-white py-12 lg:py-20 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />

                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-wrap gap-2 mb-4">
                        <span className="px-3 py-1 rounded-full bg-primary-600/20 text-primary-300 text-sm font-medium border border-primary-500/30">
                            {course.category.name}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-white/10 text-slate-300 text-sm font-medium backdrop-blur-sm">
                            {course.format}
                        </span>
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-bold mb-6 leading-tight">{course.name}</h1>
                    <div className="flex flex-wrap items-center gap-6 text-slate-300 text-sm lg:text-base">
                        <div className="flex items-center gap-2">
                            <Building className="w-5 h-5 text-primary-400" />
                            <span>{course.academy.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-primary-400" />
                            <span>{course.location || course.academy.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-primary-400" />
                            <span>{course.courseStart} ~ {course.courseEnd}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-10 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Overview Card */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-8">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">과정 소개</h2>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                                {course.description || "과정 상세 설명이 없습니다."}
                            </p>

                            {course.highlights && (
                                <div className="mt-8">
                                    <h3 className="text-lg font-semibold text-slate-900 mb-4">이런 점이 좋아요</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {course.highlights.map((highlight, idx) => (
                                            <div key={idx} className="flex items-start gap-3">
                                                <CheckCircle2 className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
                                                <span className="text-slate-700 dark:text-slate-300">{highlight}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Tabs Navigation */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden">
                            <div className="border-b border-slate-200 dark:border-slate-700">
                                <div className="flex">
                                    <button
                                        onClick={() => setActiveTab('overview')}
                                        className={`flex-1 px-6 py-4 font-semibold transition-colors ${activeTab === 'overview'
                                            ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/30'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                                            }`}
                                    >
                                        과정 개요
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('reviews')}
                                        className={`flex-1 px-6 py-4 font-semibold transition-colors ${activeTab === 'reviews'
                                            ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/30'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                                            }`}
                                    >
                                        수강 후기 {reviews && `(${reviews.totalCount})`}
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('qna')}
                                        className={`flex-1 px-6 py-4 font-semibold transition-colors ${activeTab === 'qna'
                                            ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/30'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                                            }`}
                                    >
                                        Q&A {qnaData && `(${qnaData.totalCount})`}
                                    </button>
                                </div>
                            </div>

                            <div className="p-8">
                                {activeTab === 'overview' && (
                                    <div className="space-y-6">
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">커리큘럼</h2>
                                            {(() => {
                                                // 백엔드 필드명: curriculums
                                                const curriculumData = course?.curriculums;

                                                // null/undefined 체크 및 빈 배열 체크
                                                if (!curriculumData || curriculumData.length === 0) {
                                                    return (
                                                        <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600">
                                                            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full mb-4">
                                                                <svg className="w-8 h-8 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                </svg>
                                                            </div>
                                                            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                                                커리큘럼 정보가 준비 중입니다
                                                            </h3>
                                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                                자세한 커리큘럼은 곧 업데이트될 예정입니다.
                                                            </p>
                                                        </div>
                                                    );
                                                }

                                                return (
                                                    <div className="space-y-4">
                                                        {curriculumData.map((curriculum, index) => (
                                                            <div
                                                                key={curriculum.id || `chapter-${index}`}
                                                                className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:border-primary-200 dark:hover:border-primary-700 transition-colors bg-white dark:bg-slate-800/50"
                                                            >
                                                                <div className="flex justify-between items-center mb-2">
                                                                    <span className="font-semibold text-primary-600 dark:text-primary-400">
                                                                        Chapter {curriculum.chapterNumber}
                                                                    </span>
                                                                    {curriculum.chapterTime > 0 && (
                                                                        <span className="text-sm text-slate-500 dark:text-slate-400">
                                                                            총 {curriculum.chapterTime}시간
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <h3 className="font-medium text-slate-800 dark:text-slate-200 mb-2">
                                                                    {curriculum.chapterName}
                                                                </h3>
                                                                {curriculum.chapterDetail && (
                                                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 whitespace-pre-line">
                                                                        {curriculum.chapterDetail}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'reviews' && (
                                    <>
                                        {isReviewsError ? (
                                            <div className="text-center py-12">
                                                <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full mb-4">
                                                    <svg className="w-8 h-8 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                                                    리뷰를 불러올 수 없습니다
                                                </h3>
                                                <p className="text-slate-600 dark:text-slate-400 mb-4">
                                                    {reviewsError instanceof Error ? reviewsError.message : '네트워크 오류가 발생했습니다.'}
                                                </p>
                                                <button
                                                    onClick={() => refetchReviews()}
                                                    className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors font-medium"
                                                >
                                                    다시 시도
                                                </button>
                                            </div>
                                        ) : (
                                            <CourseReviews
                                                reviews={reviews?.reviews || []}
                                                courseId={Number(id!)}
                                                isLoading={isReviewsLoading}
                                                onReviewsUpdate={() => refetchReviews()}
                                            />
                                        )}
                                    </>
                                )}

                                {activeTab === 'qna' && (
                                    <>
                                        {isQnAsError ? (
                                            <div className="text-center py-12">
                                                <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full mb-4">
                                                    <svg className="w-8 h-8 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                                                    Q&A를 불러올 수 없습니다
                                                </h3>
                                                <p className="text-slate-600 dark:text-slate-400 mb-4">
                                                    {qnasError instanceof Error ? qnasError.message : '네트워크 오류가 발생했습니다.'}
                                                </p>
                                                <button
                                                    onClick={() => refetchQnAs()}
                                                    className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors font-medium"
                                                >
                                                    다시 시도
                                                </button>
                                            </div>
                                        ) : (
                                            <CourseQnAs
                                                qnas={qnaData?.qnas || []}
                                                totalCount={qnaData?.totalCount || 0}
                                                page={qnaPage}
                                                onPageChange={setQnaPage}
                                                isLoading={isQnAsLoading}
                                                onQuestionSubmit={(title, content) => {
                                                    console.log('Question submitted:', { title, content });
                                                    alert('질문이 등록되었습니다.');
                                                }}
                                                onSearch={(keyword) => {
                                                    setQnaSearchKeyword(keyword);
                                                    setQnaPage(1);
                                                }}
                                            />
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-6 sticky top-24">
                            <div className="flex justify-between items-center mb-6">
                                <div className="text-slate-500 dark:text-slate-400 text-sm">수강료</div>
                                <div className="text-2xl font-bold text-primary-600">
                                    {course.cost === 0
                                        ? "전액무료"
                                        : course.cost != null
                                            ? `${course.cost.toLocaleString()}원`
                                            : "가격 미정"}
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500 dark:text-slate-400">모집 기간</span>
                                    <span className="font-medium text-slate-900 dark:text-white">{course.recruitStart} ~ {course.recruitEnd}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500 dark:text-slate-400">교육 기간</span>
                                    <span className="font-medium text-slate-900 dark:text-white">{course.duration}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500 dark:text-slate-400">수업 시간</span>
                                    <span className="font-medium text-slate-900 dark:text-white">{course.classDay || "평일 09:00 ~ 18:00"}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500 dark:text-slate-400">모집 정원</span>
                                    <span className="font-medium text-slate-900 dark:text-white">30명</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => {
                                        const targetUrl = course.externalLink || course.academy.website;
                                        if (targetUrl) {
                                            const safeUrl = sanitizeUrl(targetUrl);
                                            if (safeUrl) {
                                                window.open(safeUrl, '_blank', 'noopener,noreferrer');
                                            } else {
                                                alert('유효하지 않은 링크입니다.');
                                            }
                                        } else {
                                            alert('자세히 보기 링크가 제공되지 않았습니다.');
                                        }
                                    }}
                                    className="w-full py-3.5 rounded-xl bg-primary-600 text-white font-bold text-lg hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/30"
                                >
                                    자세히 보기
                                </button>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={handleFavoriteClick}
                                        disabled={addFavoriteMutation.isPending || removeFavoriteMutation.isPending}
                                        className={`flex items-center justify-center gap-2 py-3 rounded-xl border font-medium transition-all ${isFavorite
                                                ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                                                : 'border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                                            }`}
                                    >
                                        <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                                        {isFavorite ? '찜 완료' : '찜하기'}
                                    </button>
                                    <button
                                        onClick={handleShareClick}
                                        className="flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 dark:border-slate-600 font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        <Share2 className="w-5 h-5" />
                                        공유
                                    </button>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-slate-100">
                                <Link to={`/academies/${course.academy.id}`} className="flex items-center gap-3 group">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 font-bold text-xs overflow-hidden">
                                        {course.academy.logoUrl ? (
                                            <img src={sanitizeUrl(course.academy.logoUrl)} alt={course.academy.name} className="w-full h-full object-cover" />
                                        ) : (
                                            course.academy.name[0]
                                        )}
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{course.academy.name}</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">기관 정보 보기</div>
                                    </div>
                                    <div className="ml-auto">
                                        <Clock className="w-4 h-4 text-slate-400 group-hover:text-primary-600 transition-colors" />
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 공유 모달 */}
            {showShareModal && (
                <ShareModal
                    url={shareUrl}
                    title={course?.name || ''}
                    onClose={() => setShowShareModal(false)}
                />
            )}
        </div>
    );
};

export default CourseDetailPage;
