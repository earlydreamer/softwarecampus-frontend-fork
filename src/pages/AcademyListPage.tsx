import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { fetchAcademies } from '../services/academyService';
import { MapPin, Star, BookOpen, Award } from 'lucide-react';
import Skeleton from '../components/ui/Skeleton';

const AcademyListPage = () => {
    const { data: academies, isLoading } = useQuery({
        queryKey: ['academies'],
        queryFn: fetchAcademies,
    });

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-12">
                <Skeleton className="h-12 w-1/3 mb-8" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <Skeleton key={i} className="h-80 w-full rounded-2xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-slate-900 mb-3">훈련기관</h1>
                <p className="text-slate-600">우수한 교육 기관에서 전문 교육을 받아보세요</p>
            </div>

            {!academies || academies.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-slate-500">등록된 훈련기관이 없습니다.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {academies.map((academy) => (
                        <Link
                            key={academy.id}
                            to={`/academies/${academy.id}`}
                            className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-primary-300 hover:shadow-xl transition-all duration-300"
                        >
                            {/* Header with Logo */}
                            <div className="p-6 border-b border-slate-100">
                                <div className="flex items-start gap-4">
                                    <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                                        {academy.logoUrl ? (
                                            <img src={academy.logoUrl} alt={academy.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-2xl font-bold text-slate-400">{academy.name[0]}</span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-lg font-bold text-slate-900 truncate group-hover:text-primary-600 transition-colors">
                                                {academy.name}
                                            </h3>
                                            {academy.isApproved === 'APPROVED' && (
                                                <span className="shrink-0">
                                                    <Award className="w-4 h-4 text-blue-600" />
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 text-sm text-slate-500">
                                            <MapPin className="w-4 h-4" />
                                            <span className="truncate">{academy.address}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <p className="text-sm text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                                    {academy.description}
                                </p>

                                {/* Tags */}
                                {academy.fields && academy.fields.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {academy.fields.slice(0, 3).map(field => (
                                            <span key={field} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">
                                                {field}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
                                            <BookOpen className="w-4 h-4 text-primary-600" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-slate-500">운영 과정</div>
                                            <div className="text-sm font-bold text-slate-900">{academy.courseCount}개</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                                            <Star className="w-4 h-4 text-amber-500" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-slate-500">평점</div>
                                            <div className="text-sm font-bold text-slate-900">{academy.rating}/5.0</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer with Status */}
                            {academy.isRecruiting && (
                                <div className="px-6 pb-6">
                                    <div className="bg-green-50 text-green-700 text-sm font-medium px-3 py-2 rounded-lg text-center border border-green-100">
                                        🎓 모집중
                                    </div>
                                </div>
                            )}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AcademyListPage;
