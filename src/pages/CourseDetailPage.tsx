import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchCourseById, fetchCourseReviews, fetchCourseQnAs } from '../services/courseService';
import { Calendar, MapPin, Clock, Building, CheckCircle2, Share2, Heart } from 'lucide-react';
import { sanitizeUrl } from '../utils/security';
import Skeleton from '../components/ui/Skeleton';
import CourseReviews from '../components/course/CourseReviews';
import CourseQnAs from '../components/course/CourseQnAs';


const CourseDetailPage = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const id = Number(courseId);
    const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'qna'>('overview');

    const { data: course, isLoading } = useQuery({
        queryKey: ['course', id],
        queryFn: () => fetchCourseById(id),
        enabled: !!id,
    });

    const { data: reviews, isLoading: isReviewsLoading } = useQuery({
        queryKey: ['course-reviews', id],
        queryFn: () => fetchCourseReviews(id),
        enabled: !!id,
    });

    const { data: qnas, isLoading: isQnAsLoading } = useQuery({
        queryKey: ['course-qnas', id],
        queryFn: () => fetchCourseQnAs(id),
        enabled: !!id,
    });

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
                        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">과정 소개</h2>
                            <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                                {course.description || "과정 상세 설명이 없습니다."}
                            </p>

                            {course.highlights && (
                                <div className="mt-8">
                                    <h3 className="text-lg font-semibold text-slate-900 mb-4">이런 점이 좋아요</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {course.highlights.map((highlight, idx) => (
                                            <div key={idx} className="flex items-start gap-3">
                                                <CheckCircle2 className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
                                                <span className="text-slate-700">{highlight}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Tabs Navigation */}
                        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                            <div className="border-b border-slate-200">
                                <div className="flex">
                                    <button
                                        onClick={() => setActiveTab('overview')}
                                        className={`flex-1 px-6 py-4 font-semibold transition-colors ${activeTab === 'overview'
                                            ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/30'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                            }`}
                                    >
                                        과정 개요
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('reviews')}
                                        className={`flex-1 px-6 py-4 font-semibold transition-colors ${activeTab === 'reviews'
                                            ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/30'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                            }`}
                                    >
                                        수강 후기 {reviews && `(${reviews.length})`}
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('qna')}
                                        className={`flex-1 px-6 py-4 font-semibold transition-colors ${activeTab === 'qna'
                                            ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/30'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                            }`}
                                    >
                                        Q&A {qnas && `(${qnas.length})`}
                                    </button>
                                </div>
                            </div>

                            <div className="p-8">
                                {activeTab === 'overview' && (
                                    <div className="space-y-6">
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-900 mb-4">커리큘럼</h2>
                                            <div className="space-y-4">
                                                {[1, 2, 3, 4].map((week) => (
                                                    <div key={week} className="border border-slate-200 rounded-xl p-4 hover:border-primary-200 transition-colors">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="font-semibold text-primary-600">Week {week}</span>
                                                            <span className="text-sm text-slate-500">총 15시간</span>
                                                        </div>
                                                        <h3 className="font-medium text-slate-800">주차별 학습 내용 제목이 들어갑니다</h3>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'reviews' && (
                                    <CourseReviews reviews={reviews || []} isLoading={isReviewsLoading} />
                                )}

                                {activeTab === 'qna' && (
                                    <CourseQnAs qnas={qnas || []} isLoading={isQnAsLoading} />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 sticky top-24">
                            <div className="flex justify-between items-center mb-6">
                                <div className="text-slate-500 text-sm">수강료</div>
                                <div className="text-2xl font-bold text-primary-600">
                                    {course.cost === 0 ? "전액무료" : `${course.cost?.toLocaleString()}원`}
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">모집 기간</span>
                                    <span className="font-medium text-slate-900">{course.recruitStart} ~ {course.recruitEnd}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">교육 기간</span>
                                    <span className="font-medium text-slate-900">{course.duration}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">수업 시간</span>
                                    <span className="font-medium text-slate-900">{course.classDay || "평일 09:00 ~ 18:00"}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">모집 정원</span>
                                    <span className="font-medium text-slate-900">30명</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <button className="w-full py-3.5 rounded-xl bg-primary-600 text-white font-bold text-lg hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/30">
                                    수강 신청하기
                                </button>
                                <div className="grid grid-cols-2 gap-3">
                                    <button className="flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                                        <Heart className="w-5 h-5" />
                                        찜하기
                                    </button>
                                    <button className="flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                                        <Share2 className="w-5 h-5" />
                                        공유
                                    </button>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-slate-100">
                                <Link to={`/academies/${course.academy.id}`} className="flex items-center gap-3 group">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs overflow-hidden">
                                        {course.academy.logoUrl ? (
                                            <img src={sanitizeUrl(course.academy.logoUrl)} alt={course.academy.name} className="w-full h-full object-cover" />
                                        ) : (
                                            course.academy.name[0]
                                        )}
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-slate-900 group-hover:text-primary-600 transition-colors">{course.academy.name}</div>
                                        <div className="text-xs text-slate-500">기관 정보 보기</div>
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
        </div>
    );
};

export default CourseDetailPage;
