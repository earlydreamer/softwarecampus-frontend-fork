import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAcademyById, fetchCoursesByAcademyId, fetchAcademyQnAs, createAcademyQnA } from '../services/academyService';
import { MapPin, Phone, Star, Award, BookOpen, Users, CheckCircle2 } from 'lucide-react';
import { sanitizeUrl } from '../utils/security';
import Skeleton from '../components/ui/Skeleton';
import CourseCard from '../components/common/CourseCard';
import AcademyQnAs from '../components/academy/AcademyQnAs';
import MapEmbed from '../components/common/MapEmbed';
import { QNA_PER_PAGE } from '../constants';
import AlertModal from '../components/ui/AlertModal';
import { useAuthStore } from '../store/authStore';

const AcademyDetailPage = () => {
    const { academyId } = useParams<{ academyId: string }>();
    const id = Number(academyId);
    const [activeTab, setActiveTab] = useState<'info' | 'courses' | 'qna'>('info');
    const [qnaPage, setQnaPage] = useState(1);
    const [qnaSearchKeyword, setQnaSearchKeyword] = useState('');
    const [alertModal, setAlertModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'success' | 'warning' | 'error' | 'info';
    }>({ isOpen: false, title: '', message: '', type: 'info' });
    
    const queryClient = useQueryClient();
    const { isAuthenticated } = useAuthStore();

    // Q&A 등록 mutation
    const createQnAMutation = useMutation({
        mutationFn: ({ title, content }: { title: string; content: string }) =>
            createAcademyQnA(id, title, content),
        onSuccess: () => {
            // Q&A 목록 캐시 무효화
            queryClient.invalidateQueries({ queryKey: ['academy-qnas', id] });
            setAlertModal({
                isOpen: true,
                title: '등록 완료',
                message: '질문이 등록되었습니다.',
                type: 'success'
            });
        },
        onError: (error: Error) => {
            console.error('Q&A 등록 실패:', error);
            setAlertModal({
                isOpen: true,
                title: '등록 실패',
                message: error.message || '질문 등록에 실패했습니다.',
                type: 'error'
            });
        }
    });

    const {
        data: academy,
        isLoading: isAcademyLoading,
        error: academyError,
        isError: isAcademyError
    } = useQuery({
        queryKey: ['academy', id],
        queryFn: () => fetchAcademyById(id),
        enabled: !isNaN(id) && id > 0,
    });

    const {
        data: courses,
        isLoading: isCoursesLoading,
        error: coursesError,
        isError: isCoursesError
    } = useQuery({
        queryKey: ['academy-courses', id],
        queryFn: () => fetchCoursesByAcademyId(id),
        enabled: !isNaN(id) && id > 0,
    });

    const {
        data: qnaData,
        isLoading: isQnasLoading,
        error: qnasError,
        isError: isQnasError,
        refetch: refetchQnAs
    } = useQuery({
        queryKey: ['academy-qnas', id, qnaPage, qnaSearchKeyword],
        queryFn: () => fetchAcademyQnAs(id, qnaPage, QNA_PER_PAGE, qnaSearchKeyword || undefined),
        enabled: !isNaN(id) && id > 0,
    });

    if (isAcademyLoading) {
        return (
            <div className="container mx-auto px-4 py-12">
                <Skeleton className="h-64 w-full rounded-2xl mb-8" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <Skeleton className="h-40 w-full mb-8" />
                        <div className="grid grid-cols-2 gap-4">
                            <Skeleton className="h-60 w-full" />
                            <Skeleton className="h-60 w-full" />
                        </div>
                    </div>
                    <Skeleton className="h-80 w-full" />
                </div>
            </div>
        );
    }

    if (isAcademyError || isCoursesError) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                    {isAcademyError ? '기관 정보를 불러올 수 없습니다.' : '과정 정보를 불러올 수 없습니다.'}
                </h2>
                <p className="text-slate-500 mb-6">
                    {(academyError as Error)?.message || (coursesError as Error)?.message || '잠시 후 다시 시도해주세요.'}
                </p>
                <Link to="/academies" className="btn-primary inline-flex items-center gap-2 px-6 py-3">
                    기관 목록으로 돌아가기
                </Link>
            </div>
        );
    }

    if (!academy) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">기관을 찾을 수 없습니다.</h2>
                <Link to="/academies" className="text-primary-600 hover:underline">기관 목록으로 돌아가기</Link>
            </div>
        );
    }

    return (
        <div className="pb-20">
            {/* Header Section */}
            <div className="bg-slate-900 text-white py-12 lg:py-20 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />

                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-white p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-lg">
                            {academy.logoUrl ? (
                                <img 
                                    src={sanitizeUrl(academy.logoUrl)} 
                                    alt={academy.name} 
                                    className="w-full h-full object-contain rounded-xl" 
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.parentElement?.querySelector('.fallback-initial')?.classList.remove('hidden');
                                    }}
                                />
                            ) : null}
                            <div className={`fallback-initial w-full h-full bg-slate-100 rounded-xl flex items-center justify-center ${academy.logoUrl ? 'hidden' : ''}`}>
                                <span className="text-3xl font-bold text-slate-400">{academy.name[0]}</span>
                            </div>
                        </div>
                        <div className="flex-grow">
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                <h1 className="text-3xl lg:text-4xl font-bold leading-tight">{academy.name}</h1>
                                {academy.approvalStatus === 'APPROVED' && (
                                    <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30 flex items-center gap-1">
                                        <Award className="w-3 h-3" />
                                        인증기관
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-wrap items-center gap-6 text-slate-300 text-sm lg:text-base mt-4">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-primary-400" />
                                    <span>{academy.address}</span>
                                </div>
                                {academy.phone && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-5 h-5 text-primary-400" />
                                        <span>{academy.phone}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 min-w-[120px]">
                            <div className="flex items-center gap-1 text-amber-400 font-bold text-3xl">
                                <Star className="w-8 h-8 fill-current" />
                                {academy.rating}
                            </div>
                            <div className="text-sm text-slate-400">리뷰 {academy.reviewCount}개</div>
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
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">기관 소개</h2>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                                {academy.description}
                            </p>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-slate-100 dark:border-slate-700">
                                <div className="text-center">
                                    <div className="w-10 h-10 mx-auto bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center mb-3">
                                        <BookOpen className="w-5 h-5" />
                                    </div>
                                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{academy.courseCount}</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">운영 과정</div>
                                </div>
                                <div className="text-center">
                                    <div className="w-10 h-10 mx-auto bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-3">
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <div className="text-2xl font-bold text-slate-900 dark:text-white">1,200+</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">누적 수강생</div>
                                </div>
                                <div className="text-center">
                                    <div className="w-10 h-10 mx-auto bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center mb-3">
                                        <Award className="w-5 h-5" />
                                    </div>
                                    <div className="text-2xl font-bold text-slate-900 dark:text-white">95%</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">취업률</div>
                                </div>
                            </div>
                        </div>

                        {/* Tabs Navigation */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden">
                            <div className="border-b border-slate-200 dark:border-slate-700">
                                <div className="flex">
                                    <button
                                        onClick={() => setActiveTab('info')}
                                        className={`flex-1 px-6 py-4 font-semibold transition-colors ${activeTab === 'info'
                                            ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/30'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                                            }`}
                                    >
                                        상세 정보
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('courses')}
                                        className={`flex-1 px-6 py-4 font-semibold transition-colors ${activeTab === 'courses'
                                            ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/30'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                                            }`}
                                    >
                                        개설 과정 {courses && `(${courses.length})`}
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
                                {activeTab === 'info' && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">기관 특징</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="flex items-start gap-3">
                                                    <CheckCircle2 className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
                                                    <span className="text-slate-700 dark:text-slate-300">고용노동부 인증 우수 훈련 기관</span>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <CheckCircle2 className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
                                                    <span className="text-slate-700 dark:text-slate-300">실무 중심의 프로젝트 기반 학습</span>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <CheckCircle2 className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
                                                    <span className="text-slate-700 dark:text-slate-300">전문 취업 컨설턴트의 1:1 케어</span>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <CheckCircle2 className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
                                                    <span className="text-slate-700 dark:text-slate-300">최신 사양의 교육 장비 지원</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-slate-100 dark:border-slate-700">
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">기관 설명</h3>
                                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                                                {academy.description}
                                            </p>
                                        </div>

                                        <div className="pt-6 border-t border-slate-100 dark:border-slate-700">
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">위치 안내</h3>
                                            <div className="h-[300px] w-full">
                                                <MapEmbed address={academy.address} height="100%" />
                                            </div>
                                            <p className="mt-2 text-slate-600 dark:text-slate-400 flex items-center gap-2">
                                                <MapPin className="w-4 h-4" />
                                                {academy.address}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'courses' && (
                                    <div>
                                        {isCoursesLoading ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <Skeleton className="h-80 w-full" />
                                                <Skeleton className="h-80 w-full" />
                                            </div>
                                        ) : courses && courses.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {courses.map(course => (
                                                    <CourseCard key={course.id} course={course} />
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100">
                                                <p className="text-slate-500">현재 운영 중인 과정이 없습니다.</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'qna' && (
                                    <>
                                        {isQnasError ? (
                                            <div className="text-center py-12">
                                                <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                                                    <Award className="w-8 h-8 text-orange-600" />
                                                </div>
                                                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                                    Q&A를 불러올 수 없습니다
                                                </h3>
                                                <p className="text-slate-600 mb-4">
                                                    {(qnasError as Error)?.message || '네트워크 오류가 발생했습니다.'}
                                                </p>
                                                <button
                                                    onClick={() => refetchQnAs()}
                                                    className="btn-primary"
                                                    aria-label="Q&A 다시 불러오기"
                                                >
                                                    다시 시도
                                                </button>
                                            </div>
                                        ) : (
                                            <AcademyQnAs
                                                qnas={qnaData?.qas || []}
                                                totalCount={qnaData?.totalCount || 0}
                                                page={qnaPage}
                                                onPageChange={setQnaPage}
                                                isLoading={isQnasLoading}
                                                onQuestionSubmit={(title, content) => {
                                                    if (!isAuthenticated) {
                                                        setAlertModal({
                                                            isOpen: true,
                                                            title: '로그인 필요',
                                                            message: '질문을 등록하려면 로그인이 필요합니다.',
                                                            type: 'warning'
                                                        });
                                                        return;
                                                    }
                                                    createQnAMutation.mutate({ title, content });
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

                    {/* Sidebar Info */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-6 sticky top-24">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">기관 상세 정보</h3>
                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500 dark:text-slate-400">설립일</span>
                                    <span className="font-medium text-slate-900 dark:text-white">{academy.establishedDate}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500 dark:text-slate-400">사업자 등록번호</span>
                                    <span className="font-medium text-slate-900 dark:text-white">{academy.businessNumber}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500 dark:text-slate-400">이메일</span>
                                    <span className="font-medium text-slate-900 dark:text-white">{academy.email}</span>
                                </div>
                                <div>
                                    <div className="text-slate-500 dark:text-slate-400 mb-2">주요 분야</div>
                                    <div className="flex flex-wrap gap-2">
                                        {academy.fields?.map(field => (
                                            <span key={field} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md text-xs font-medium">
                                                {field}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
                                {academy.website ? (
                                    <a
                                        href={sanitizeUrl(academy.website)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="w-full py-3.5 rounded-xl bg-primary-600 text-white font-bold text-lg hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/30 mb-3 flex items-center justify-center"
                                    >
                                        기관 홈페이지 바로가기
                                    </a>
                                ) : (
                                    <button className="w-full py-3.5 rounded-xl bg-slate-300 text-white font-bold text-lg cursor-not-allowed mb-3" disabled>
                                        기관 홈페이지 바로가기
                                    </button>
                                )}
                                <button className="w-full py-3.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-bold text-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                                    공유하기
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Alert Modal */}
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

export default AcademyDetailPage;
