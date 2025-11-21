import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchAcademyById, fetchCoursesByAcademyId } from '../services/academyService';
import { MapPin, Globe, Phone, Star, Award, BookOpen, Users } from 'lucide-react';
import { sanitizeUrl } from '../utils/security';
import Skeleton from '../components/ui/Skeleton';
import CourseCard from '../components/common/CourseCard';

const AcademyDetailPage = () => {
    const { academyId } = useParams<{ academyId: string }>();
    const id = Number(academyId);

    const { data: academy, isLoading: isAcademyLoading } = useQuery({
        queryKey: ['academy', id],
        queryFn: () => fetchAcademyById(id),
        enabled: !!id,
    });

    const { data: courses, isLoading: isCoursesLoading } = useQuery({
        queryKey: ['academy-courses', id],
        queryFn: () => fetchCoursesByAcademyId(id),
        enabled: !!id,
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
            {/* Header Banner */}
            <div className="bg-white border-b border-slate-200">
                <div className="container mx-auto px-4 py-12">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                            {academy.logoUrl ? (
                                <img src={sanitizeUrl(academy.logoUrl)} alt={academy.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-3xl font-bold text-slate-400">{academy.name[0]}</span>
                            )}
                        </div>
                        <div className="flex-grow">
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold text-slate-900">{academy.name}</h1>
                                {academy.isApproved === 'APPROVED' && (
                                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100 flex items-center gap-1">
                                        <Award className="w-3 h-3" />
                                        인증기관
                                    </span>
                                )}
                            </div>
                            <p className="text-slate-600 max-w-2xl mb-4">{academy.description}</p>
                            <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                                <div className="flex items-center gap-1.5">
                                    <MapPin className="w-4 h-4" />
                                    {academy.address}
                                </div>
                                {academy.website && (
                                    <a href={sanitizeUrl(academy.website)} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-primary-600 transition-colors">
                                        <Globe className="w-4 h-4" />
                                        홈페이지
                                    </a>
                                )}
                                {academy.phone && (
                                    <div className="flex items-center gap-1.5">
                                        <Phone className="w-4 h-4" />
                                        {academy.phone}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 min-w-[120px]">
                            <div className="flex items-center gap-1 text-amber-500 font-bold text-2xl">
                                <Star className="w-6 h-6 fill-current" />
                                {academy.rating}
                            </div>
                            <div className="text-sm text-slate-500">리뷰 {academy.reviewCount}개</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-10">
                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center">
                                <div className="w-10 h-10 mx-auto bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mb-3">
                                    <BookOpen className="w-5 h-5" />
                                </div>
                                <div className="text-2xl font-bold text-slate-900">{academy.courseCount}</div>
                                <div className="text-xs text-slate-500 mt-1">운영 과정</div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center">
                                <div className="w-10 h-10 mx-auto bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-3">
                                    <Users className="w-5 h-5" />
                                </div>
                                <div className="text-2xl font-bold text-slate-900">1,200+</div>
                                <div className="text-xs text-slate-500 mt-1">누적 수강생</div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center">
                                <div className="w-10 h-10 mx-auto bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-3">
                                    <Award className="w-5 h-5" />
                                </div>
                                <div className="text-2xl font-bold text-slate-900">95%</div>
                                <div className="text-xs text-slate-500 mt-1">취업률</div>
                            </div>
                        </div>

                        {/* Courses List */}
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-slate-900">운영 중인 과정</h2>
                                <Link to={`/lectures?academy=${academy.id}`} className="text-sm font-medium text-primary-600 hover:underline">
                                    전체보기
                                </Link>
                            </div>

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
                    </div>

                    {/* Sidebar Info */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
                            <h3 className="font-bold text-slate-900 mb-4">기관 정보</h3>
                            <div className="space-y-4 text-sm">
                                <div>
                                    <div className="text-slate-500 mb-1">설립일</div>
                                    <div className="font-medium">{academy.establishedDate}</div>
                                </div>
                                <div>
                                    <div className="text-slate-500 mb-1">사업자 등록번호</div>
                                    <div className="font-medium">{academy.businessNumber}</div>
                                </div>
                                <div>
                                    <div className="text-slate-500 mb-1">이메일</div>
                                    <div className="font-medium">{academy.email}</div>
                                </div>
                                <div>
                                    <div className="text-slate-500 mb-1">주요 분야</div>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {academy.fields?.map(field => (
                                            <span key={field} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">
                                                {field}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AcademyDetailPage;
