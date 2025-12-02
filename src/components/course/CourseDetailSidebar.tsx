import { Link } from 'react-router-dom';
import { Heart, Share2, Clock } from 'lucide-react';
import { sanitizeUrl } from '../../utils/security';
import type { Course, AlertModalState } from '../../types';

interface CourseDetailSidebarProps {
    course: Course;
    isFavorite: boolean;
    isFavoritePending: boolean;
    onFavoriteClick: () => void;
    onShareClick: () => void;
    setAlertModal: (modal: AlertModalState) => void;
}

const CourseDetailSidebar = ({
    course,
    isFavorite,
    isFavoritePending,
    onFavoriteClick,
    onShareClick,
    setAlertModal
}: CourseDetailSidebarProps) => {
    const handleExternalLinkClick = () => {
        const targetUrl = course.externalLink || course.academy.website;
        if (targetUrl) {
            const safeUrl = sanitizeUrl(targetUrl);
            if (safeUrl) {
                window.open(safeUrl, '_blank', 'noopener,noreferrer');
            } else {
                setAlertModal({
                    isOpen: true,
                    title: '링크 오류',
                    message: '유효하지 않은 링크입니다.',
                    type: 'error'
                });
            }
        } else {
            setAlertModal({
                isOpen: true,
                title: '링크 없음',
                message: '자세히 보기 링크가 제공되지 않았습니다.',
                type: 'info'
            });
        }
    };

    return (
        <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-6 sticky top-24">
                {/* 수강료 */}
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

                {/* 과정 정보 */}
                <div className="space-y-4 mb-8">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">모집 기간</span>
                        <span className="font-medium text-slate-900 dark:text-white">
                            {course.recruitStart && course.recruitEnd
                                ? `${course.recruitStart} ~ ${course.recruitEnd}`
                                : '모집 기간 미정'}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">교육 기간</span>
                        <span className="font-medium text-slate-900 dark:text-white">{course.duration ?? '교육 기간 미정'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">수업 시간</span>
                        <span className="font-medium text-slate-900 dark:text-white">{course.classDay || "평일 09:00 ~ 18:00"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">모집 정원</span>
                        <span className="font-medium text-slate-900 dark:text-white">
                            {course.capacity ? `${course.capacity}명` : '정원 정보 없음'}
                        </span>
                    </div>
                </div>

                {/* 버튼 그룹 */}
                <div className="flex flex-col gap-3">
                    <button
                        type="button"
                        onClick={handleExternalLinkClick}
                        className="w-full py-3.5 rounded-xl bg-primary-600 text-white font-bold text-lg hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/30"
                    >
                        자세히 보기
                    </button>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={onFavoriteClick}
                            disabled={isFavoritePending}
                            aria-pressed={isFavorite}
                            className={`flex items-center justify-center gap-2 py-3 rounded-xl border font-medium transition-all ${isFavorite
                                ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                                : 'border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                                }`}
                        >
                            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                            {isFavorite ? '찜 완료' : '찜하기'}
                        </button>
                        <button
                            type="button"
                            onClick={onShareClick}
                            className="flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 dark:border-slate-600 font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                            <Share2 className="w-5 h-5" />
                            공유
                        </button>
                    </div>
                </div>

                {/* 기관 정보 */}
                <div className="mt-6 pt-6 border-t border-slate-100">
                    <Link to={`/academies/${course.academy.id}`} className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 font-bold text-xs overflow-hidden">
                            {course.academy.logoUrl ? (
                                <img src={sanitizeUrl(course.academy.logoUrl)} alt={course.academy.name} className="w-full h-full object-cover" />
                            ) : (
                                course.academy.name?.length > 0 ? course.academy.name[0] : '?'
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
    );
};

export default CourseDetailSidebar;
