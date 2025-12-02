import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { sanitizeUrl } from '../utils/security';
import { DEFAULT_IMAGES } from '../constants';
import Skeleton from '../components/ui/Skeleton';
import CourseDetailHeader from '../components/course/CourseDetailHeader';
import CourseDetailSidebar from '../components/course/CourseDetailSidebar';
import CourseOverview from '../components/course/CourseOverview';
import CourseCurriculum from '../components/course/CourseCurriculum';
import CourseReviews from '../components/course/CourseReviews';
import CourseQnAs from '../components/course/CourseQnAs';
import ShareModal from '../components/ui/ShareModal';
import AlertModal from '../components/ui/AlertModal';
import { useCourseDetail } from '../hooks/useCourseDetail';

const CourseDetailPage = () => {
    const { courseId } = useParams<{ courseId: string }>();

    // courseId 명시적 검증
    const parsedId = courseId ? parseInt(courseId, 10) : NaN;
    const isValidId = !isNaN(parsedId) && parsedId > 0;
    const id = isValidId ? parsedId : null;

    const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'qna'>('overview');
    const [showShareModal, setShowShareModal] = useState(false);

    // 커스텀 훅으로 데이터 페칭 및 mutation 로직 분리
    const {
        course,
        isLoading,
        isCourseError,
        courseError,
        refetchCourse,
        reviews,
        isReviewsLoading,
        isReviewsError,
        reviewsError,
        refetchReviews,
        qnaData,
        isQnAsLoading,
        isQnAsError,
        qnasError,
        refetchQnAs,
        qnaPage,
        setQnaPage,
        isFavorite,
        handleFavoriteClick,
        isFavoritePending,
        handleQnaSearch,
        handleQnaSubmit,
        alertModal,
        setAlertModal,
    } = useCourseDetail({ courseId: id, isValidId });

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

    // 헤더 배경 이미지 URL 검증 (empty url() 방지)
    const sanitizedHeaderImageUrl = course.headerImageUrl ? sanitizeUrl(course.headerImageUrl) : '';
    const headerBackgroundImage = sanitizedHeaderImageUrl || DEFAULT_IMAGES.COURSE_HEADER;

    return (
        <div className="pb-20">
            {/* Header Section */}
            <CourseDetailHeader 
                course={course} 
                headerBackgroundImage={headerBackgroundImage} 
            />

            <div className="container mx-auto px-4 -mt-10 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Overview Card */}
                        <CourseOverview course={course} />

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
                                            <CourseCurriculum course={course} />
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
                                                courseId={Number(id!)}
                                                academyId={course?.academy?.id}
                                                qnas={qnaData?.qnas || []}
                                                totalCount={qnaData?.totalCount || 0}
                                                page={qnaPage}
                                                onPageChange={setQnaPage}
                                                isLoading={isQnAsLoading}
                                                onQuestionSubmit={handleQnaSubmit}
                                                onSearch={handleQnaSearch}
                                                onQnAsUpdate={() => refetchQnAs()}
                                            />
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <CourseDetailSidebar
                        course={course}
                        isFavorite={isFavorite}
                        isFavoritePending={isFavoritePending}
                        onFavoriteClick={handleFavoriteClick}
                        onShareClick={() => setShowShareModal(true)}
                        setAlertModal={setAlertModal}
                    />
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

            {/* 알림 모달 */}
            <AlertModal
                isOpen={alertModal.isOpen}
                onClose={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
                title={alertModal.title}
                message={alertModal.message}
                type={alertModal.type}
            />
        </div>
    );
};

export default CourseDetailPage;
