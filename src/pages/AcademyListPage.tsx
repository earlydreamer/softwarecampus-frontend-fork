import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getApprovedAcademies } from '../services/academyService';
import { MapPin, Star, BookOpen, Award, Search } from 'lucide-react';
import { sanitizeUrl } from '../utils/security';
import Skeleton from '../components/ui/Skeleton';

const AcademyListPage = () => {
    const [keyword, setKeyword] = useState('');
    const { data: academies, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['academies'],
        queryFn: () => getApprovedAcademies(true),
    });

    const filteredAcademies = academies?.filter(academy =>
        academy.name.toLowerCase().includes(keyword.toLowerCase()) ||
        academy.address.toLowerCase().includes(keyword.toLowerCase()) ||
        academy.fields?.some(field => field.toLowerCase().includes(keyword.toLowerCase()))
    );

    const noResult = !isLoading && filteredAcademies?.length === 0;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                {/* Header & Search Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">훈련기관 목록</h1>
                        <p className="text-slate-500 dark:text-slate-400">우수한 교육 기관에서 전문 교육을 받아보세요.</p>
                    </div>
                </div>

                {/* Filter Panel */}
                <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search Bar */}
                        <div className="flex flex-col gap-1.5 flex-grow max-w-xl">
                            <label htmlFor="keyword" className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">기관 검색</label>
                            <div className="relative">
                                <input
                                    id="keyword"
                                    type="text"
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                    placeholder="기관명, 주소, 혹은 분야로 검색..."
                                    className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-5 py-2.5 pl-12 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-slate-600 transition-all shadow-sm"
                                />
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Content Section */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <Skeleton key={i} className="h-80 w-full rounded-2xl" />
                        ))}
                    </div>
                ) : isError ? (
                    <div className="glass-panel p-12 text-center rounded-2xl border-dashed border-2 border-slate-200 dark:border-slate-700">
                        <p className="text-slate-500 dark:text-slate-400 mb-4">
                            데이터를 불러오는 데 실패했습니다.
                            {error instanceof Error && (
                                <span className="block text-sm mt-2">{error.message}</span>
                            )}
                        </p>
                        <button
                            onClick={() => refetch()}
                            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                        >
                            다시 시도
                        </button>
                    </div>
                ) : noResult ? (
                    <div className="glass-panel p-12 text-center rounded-2xl border-dashed border-2 border-slate-200 dark:border-slate-700">
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">조건에 맞는 기관이 없습니다</h2>
                        <p className="text-slate-500 dark:text-slate-400">다른 키워드로 검색해 보세요.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredAcademies?.map((academy) => (
                            <Link
                                key={academy.id}
                                to={`/academies/${academy.id}`}
                                className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-xl transition-all duration-300 flex flex-col h-full"
                            >
                                {/* Header with Logo */}
                                <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                                    <div className="flex items-start gap-4">
                                        <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center overflow-hidden shrink-0">
                                            {academy.logoUrl ? (
                                                <img 
                                                    src={sanitizeUrl(academy.logoUrl)} 
                                                    alt={academy.name} 
                                                    className="w-full h-full object-cover" 
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                        e.currentTarget.parentElement?.querySelector('.fallback-initial')?.classList.remove('hidden');
                                                    }}
                                                />
                                            ) : null}
                                            <span className={`fallback-initial text-2xl font-bold text-slate-400 dark:text-slate-500 ${academy.logoUrl ? 'hidden' : ''}`}>{academy.name[0]}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                                    {academy.name}
                                                </h3>
                                                {academy.approvalStatus === 'APPROVED' && (
                                                    <span className="shrink-0">
                                                        <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                                                <MapPin className="w-4 h-4" />
                                                <span className="truncate">{academy.address}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 flex-grow flex flex-col">
                                    <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-4 leading-relaxed flex-grow">
                                        {academy.description}
                                    </p>

                                    {/* Tags */}
                                    {academy.fields && academy.fields.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {academy.fields.slice(0, 3).map(field => (
                                                <span key={field} className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded text-xs">
                                                    {field}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Stats */}
                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-700 mt-auto">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-primary-50 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                                                <BookOpen className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                                            </div>
                                            <div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400">운영 과정</div>
                                                <div className="text-sm font-bold text-slate-900 dark:text-white">{academy.courseCount}개</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-amber-50 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                                                <Star className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                                            </div>
                                            <div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400">평점</div>
                                                <div className="text-sm font-bold text-slate-900 dark:text-white">
                                                    {(academy.reviewCount || 0) > 0 ? `${academy.rating}/5.0` : '없음'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer with Status */}
                                {academy.isRecruiting && (
                                    <div className="px-6 pb-6 pt-0">
                                        <div className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium px-3 py-2 rounded-lg text-center border border-green-100 dark:border-green-800">
                                            🎓 모집중
                                        </div>
                                    </div>
                                )}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AcademyListPage;
