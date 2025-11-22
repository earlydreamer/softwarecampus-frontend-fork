import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    BookOpen,
    Star,
    Users,
    Building,
    CheckCircle,
    XCircle,
    Clock,
    Search,
    MoreVertical,
    ImageIcon,
    Plus,
    Trash2,
    Edit2,
    ArrowUp,
    ArrowDown,
    MessageSquare
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import {
    mockCourseApprovalRequests,
    mockReviewApprovalRequests,
    mockAdminUsers,
    mockAdminAcademies,
    mockBanners,
    type CourseApprovalRequest,
    type ReviewApprovalRequest,
    type AdminUser,
    type AdminAcademy,
    type BannerData
} from '../services/mockAdminData';
import CourseRequestModal, { type CourseFormState } from '../components/admin/CourseRequestModal';
import BannerModal, { type BannerFormState } from '../components/admin/BannerModal';
import { sanitizeUrl } from '../utils/security';

const AdminPage = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuthStore();

    // 상태 관리
    const [activeTab, setActiveTab] = useState('dashboard');
    const [courseRequests, setCourseRequests] = useState<CourseApprovalRequest[]>(mockCourseApprovalRequests);
    const [reviewRequests, setReviewRequests] = useState<ReviewApprovalRequest[]>(mockReviewApprovalRequests);
    const [users] = useState<AdminUser[]>(mockAdminUsers);
    const [academies] = useState<AdminAcademy[]>(mockAdminAcademies);
    const [banners, setBanners] = useState<BannerData[]>(mockBanners);

    // 필터 상태
    const [courseFilter, setCourseFilter] = useState<'전체' | '대기' | '승인' | '거부'>('대기');
    const [reviewFilter, setReviewFilter] = useState<'전체' | '대기' | '승인' | '거부'>('대기');
    const [userSearchTerm, setUserSearchTerm] = useState('');

    // 배너 모달 상태
    const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState<BannerData | null>(null);

    // 답변 입력 상태 (기관 회원용)
    const [replyingReviewId, setReplyingReviewId] = useState<number | null>(null);
    const [replyContent, setReplyContent] = useState('');

    // 과정 모달 상태
    const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<CourseApprovalRequest | null>(null);

    // 데이터 필터링 (ACADEMY 회원은 본인 기관 데이터만)
    const filteredCourseRequests = user?.accountType === 'ACADEMY' && user.academyId
        ? courseRequests.filter(r => r.academyId === user.academyId)
        : courseRequests;

    const filteredReviewRequests = user?.accountType === 'ACADEMY' && user.academyId
        ? reviewRequests.filter(r => r.academyId === user.academyId)
        : reviewRequests;

    // 통계 계산
    const stats = {
        pendingCourses: filteredCourseRequests.filter(r => r.status === '대기').length,
        approvedCourses: filteredCourseRequests.filter(r => r.status === '승인').length,
        pendingReviews: filteredReviewRequests.filter(r => r.status === '대기').length,
        totalUsers: users.length,
        activeUsers: users.filter(u => u.status === '활성').length,
        totalAcademies: academies.length,
        activeBanners: banners.filter(b => b.isActive).length
    };

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
        if (user?.accountType !== 'ADMIN' && user?.accountType !== 'ACADEMY') {
            navigate('/');
        }
    }, [isAuthenticated, user, navigate]);

    if (!isAuthenticated || (user?.accountType !== 'ADMIN' && user?.accountType !== 'ACADEMY')) {
        return null;
    }

    // 메뉴 구성
    const menuItems = user?.accountType === 'ADMIN' ? [
        { id: 'dashboard', icon: LayoutDashboard, label: '대시보드' },
        { id: 'courses', icon: BookOpen, label: '과정 관리', badge: stats.pendingCourses },
        { id: 'reviews', icon: Star, label: '리뷰/문의 관리', badge: stats.pendingReviews },
        { id: 'users', icon: Users, label: '회원 관리' },
        { id: 'academies', icon: Building, label: '훈련기관' },
        { id: 'banners', icon: ImageIcon, label: '배너 관리', badge: stats.activeBanners },
    ] : [
        { id: 'dashboard', icon: LayoutDashboard, label: '대시보드' },
        { id: 'courses', icon: BookOpen, label: '내 과정 관리', badge: stats.pendingCourses },
        { id: 'reviews', icon: Star, label: '리뷰/문의 관리', badge: stats.pendingReviews },
    ];

    // 과정 승인 처리
    const handleCourseApproval = (requestId: number, action: '승인' | '거부') => {
        setCourseRequests(prev =>
            prev.map(req =>
                req.id === requestId ? { ...req, status: action } : req
            )
        );
    };

    // 리뷰 승인 처리
    const handleReviewApproval = (requestId: number, action: '승인' | '거부') => {
        setReviewRequests(prev =>
            prev.map(req =>
                req.id === requestId ? { ...req, status: action } : req
            )
        );
    };

    // 답변 제출 처리
    const handleReplySubmit = (reviewId: number) => {
        if (!replyContent.trim()) return;
        // 실제로는 API 호출하여 답변 저장
        alert(`리뷰 #${reviewId}에 답변이 등록되었습니다: ${replyContent}`);
        setReplyingReviewId(null);
        setReplyContent('');
    };

    // 배너 관련 핸들러
    const handleBannerDelete = (id: number) => {
        if (confirm('정말 이 배너를 삭제하시겠습니까?')) {
            setBanners(prev => prev.filter(b => b.id !== id));
        }
    };

    const handleBannerToggle = (id: number) => {
        setBanners(prev => prev.map(b =>
            b.id === id ? { ...b, isActive: !b.isActive } : b
        ));
    };

    const handleBannerMove = (id: number, direction: 'up' | 'down') => {
        const index = banners.findIndex(b => b.id === id);
        if (index === -1) return;
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === banners.length - 1) return;

        const newBanners = [...banners];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        // 순서 교환
        [newBanners[index], newBanners[targetIndex]] = [newBanners[targetIndex], newBanners[index]];

        // displayOrder 업데이트
        newBanners.forEach((b, i) => {
            b.displayOrder = i + 1;
        });

        setBanners(newBanners);
    };

    const openBannerModal = (banner?: BannerData) => {
        setEditingBanner(banner || null);
        setIsBannerModalOpen(true);
    };



    const handleBannerSubmit = (data: BannerFormState) => {
        if (editingBanner) {
            setBanners(prev => prev.map(b =>
                b.id === editingBanner.id ? { ...b, ...data } as BannerData : b
            ));
        } else {
            const newBanner: BannerData = {
                ...data as BannerData,
                id: Math.max(...banners.map(b => b.id), 0) + 1,
                createdDate: new Date().toISOString().split('T')[0],
                displayOrder: banners.length + 1
            };
            setBanners(prev => [...prev, newBanner]);
        }
        setIsBannerModalOpen(false);
    };

    // 과정 모달 핸들러
    const openCourseModal = (course?: CourseApprovalRequest) => {
        setEditingCourse(course || null);
        setIsCourseModalOpen(true);
    };

    const handleCourseSubmit = (data: CourseFormState) => {
        if (editingCourse) {
            const updatedRequest: CourseApprovalRequest = {
                ...editingCourse,
                ...data as CourseApprovalRequest,
                requestType: '수정',
                status: '대기',
                requestDate: new Date().toISOString().split('T')[0]
            };
            setCourseRequests(prev => prev.map(req => req.id === editingCourse.id ? updatedRequest : req));
            alert('과정 수정 요청이 접수되었습니다. 관리자 승인 후 반영됩니다.');
        } else {
            const newRequest: CourseApprovalRequest = {
                ...data as CourseApprovalRequest,
                id: Math.max(...courseRequests.map(r => r.id), 0) + 1,
                academyId: user?.academyId || 0,
                academyName: user?.affiliation || '알 수 없음',
                requestType: '등록',
                status: '대기',
                requestDate: new Date().toISOString().split('T')[0],
                requesterId: user?.id || 0,
                requesterName: user?.userName || '알 수 없음'
            };
            setCourseRequests(prev => [newRequest, ...prev]);
            alert('과정 등록 요청이 접수되었습니다. 관리자 승인 후 반영됩니다.');
        }
        setIsCourseModalOpen(false);
    };



    // 필터링된 데이터 (뷰 렌더링용)
    const filteredCourses = filteredCourseRequests.filter(req =>
        courseFilter === '전체' ? true : req.status === courseFilter
    );

    const filteredReviews = filteredReviewRequests.filter(req =>
        reviewFilter === '전체' ? true : req.status === reviewFilter
    );

    const filteredUsers = users.filter(user =>
        !userSearchTerm ||
        user.username.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearchTerm.toLowerCase())
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return (
                    <div className="space-y-6">
                        {/* KPI 카드 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <div className="glass-panel p-6 rounded-2xl">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-slate-500 text-sm font-medium">승인 대기 과정</h3>
                                    <div className="p-2 bg-orange-50 rounded-lg">
                                        <BookOpen className="w-5 h-5 text-orange-500" />
                                    </div>
                                </div>
                                <div className="text-2xl font-bold text-slate-900">{stats.pendingCourses}</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">처리 필요한 요청</div>
                            </div>
                            <div className="glass-panel p-6 rounded-2xl">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-slate-500 text-sm font-medium">승인 대기 리뷰/문의</h3>
                                    <div className="p-2 bg-blue-50 rounded-lg">
                                        <Star className="w-5 h-5 text-blue-500" />
                                    </div>
                                </div>
                                <div className="text-2xl font-bold text-slate-900">{stats.pendingReviews}</div>
                                <div className="text-xs text-slate-400 mt-1">처리 필요한 리뷰 및 문의</div>
                            </div>

                            {user?.accountType === 'ADMIN' && (
                                <>
                                    <div className="glass-panel p-6 rounded-2xl">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-slate-500 text-sm font-medium">전체 회원</h3>
                                            <div className="p-2 bg-green-50 rounded-lg">
                                                <Users className="w-5 h-5 text-green-500" />
                                            </div>
                                        </div>
                                        <div className="text-2xl font-bold text-slate-900">{stats.totalUsers}</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">활성 회원 {stats.activeUsers}명</div>
                                    </div>
                                    <div className="glass-panel p-6 rounded-2xl">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-slate-500 text-sm font-medium">활성 배너</h3>
                                            <div className="p-2 bg-purple-50 rounded-lg">
                                                <ImageIcon className="w-5 h-5 text-purple-500" />
                                            </div>
                                        </div>
                                        <div className="text-2xl font-bold text-slate-900">{stats.activeBanners}</div>
                                        <div className="text-xs text-slate-400 mt-1">메인 페이지 노출 중</div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* 최근 승인 요청 */}
                        <div className="grid lg:grid-cols-2 gap-6">
                            <div className="glass-panel rounded-2xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">최근 과정 요청</h3>
                                    <button
                                        onClick={() => setActiveTab('courses')}
                                        className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                                    >
                                        모두 보기
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {filteredCourseRequests.filter(r => r.status === '대기').slice(0, 3).map(req => (
                                        <div key={req.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
                                            <h4 className="font-semibold text-slate-900 dark:text-white mb-1">{req.courseTitle}</h4>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">{req.academyName} · {req.category}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">{req.requestDate}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="glass-panel rounded-2xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">최근 리뷰/문의</h3>
                                    <button
                                        onClick={() => setActiveTab('reviews')}
                                        className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                                    >
                                        모두 보기
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {filteredReviewRequests.filter(r => r.status === '대기').slice(0, 3).map(req => (
                                        <div key={req.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-semibold text-slate-900 dark:text-white">{req.courseTitle}</h4>
                                                <span className="text-yellow-500">{'⭐'.repeat(req.rating)}</span>
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{req.content}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">{req.authorName} · {req.requestDate}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'courses':
                return (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                {user?.accountType === 'ADMIN' ? '과정 승인 관리' : '내 과정 관리'}
                            </h2>
                            {user?.accountType === 'ACADEMY' && (
                                <button
                                    onClick={() => openCourseModal()}
                                    className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>과정 등록 요청</span>
                                </button>
                            )}
                        </div>

                        {/* 필터 섹션 분리 */}
                        <div className="glass-panel p-1 rounded-xl w-fit">
                            {['전체', '대기', '승인', '거부'].map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setCourseFilter(filter as typeof courseFilter)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${courseFilter === filter
                                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                                        }`}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>

                        <div className="glass-panel rounded-2xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 dark:bg-slate-900/50">
                                        <tr>
                                            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">과정명</th>
                                            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">훈련기관</th>
                                            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">카테고리</th>
                                            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">요청일</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">상태</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">작업</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                        {filteredCourses.map((req) => (
                                            <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30">
                                                <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">{req.courseTitle}</td>
                                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{req.academyName}</td>
                                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{req.category}</td>
                                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{req.requestDate}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${req.status === '대기' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                        req.status === '승인' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                        }`}>
                                                        {req.status === '대기' ? <Clock className="w-3 h-3" /> :
                                                            req.status === '승인' ? <CheckCircle className="w-3 h-3" /> :
                                                                <XCircle className="w-3 h-3" />}
                                                        {req.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {user?.accountType === 'ADMIN' && req.status === '대기' ? (
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => handleCourseApproval(req.id, '승인')}
                                                                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition"
                                                            >
                                                                승인
                                                            </button>
                                                            <button
                                                                onClick={() => handleCourseApproval(req.id, '거부')}
                                                                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition"
                                                            >
                                                                거부
                                                            </button>
                                                        </div>
                                                    ) : user?.accountType === 'ACADEMY' ? (
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => openCourseModal(req)}
                                                                className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                                                                title="수정 요청"
                                                                aria-label="수정 요청"
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                            </button>
                                                            {req.status === '대기' && (
                                                                <button
                                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                                    title="삭제 요청"
                                                                    aria-label="삭제 요청"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-slate-500">-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );

            case 'reviews':
                return (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">리뷰/문의 관리</h2>
                            <div className="glass-panel p-1 rounded-xl w-fit flex items-center gap-2">
                                {['전체', '대기', '승인', '거부'].map((filter) => (
                                    <button
                                        key={filter}
                                        onClick={() => setReviewFilter(filter as typeof reviewFilter)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${reviewFilter === filter
                                            ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                                            }`}
                                    >
                                        {filter}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            {filteredReviews.map((req) => (
                                <div key={req.id} className="glass-panel rounded-2xl p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{req.courseTitle}</h3>
                                                <span className="text-yellow-500 flex items-center">
                                                    {'⭐'.repeat(req.rating)}
                                                </span>
                                            </div>
                                            <p className="text-slate-700 dark:text-slate-300 mb-3">{req.content}</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{req.authorName} · {req.requestDate}</p>
                                        </div>
                                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${req.status === '대기' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                            req.status === '승인' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                            }`}>
                                            {req.status === '대기' ? <Clock className="w-3 h-3" /> :
                                                req.status === '승인' ? <CheckCircle className="w-3 h-3" /> :
                                                    <XCircle className="w-3 h-3" />}
                                            {req.status}
                                        </span>
                                    </div>

                                    {user?.accountType === 'ADMIN' && req.status === '대기' && (
                                        <div className="flex items-center gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                                            <button
                                                onClick={() => handleReviewApproval(req.id, '승인')}
                                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition"
                                            >
                                                승인
                                            </button>
                                            <button
                                                onClick={() => handleReviewApproval(req.id, '거부')}
                                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition"
                                            >
                                                거부
                                            </button>
                                        </div>
                                    )}

                                    {user?.accountType === 'ACADEMY' && (
                                        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                                            {replyingReviewId === req.id ? (
                                                <div className="space-y-3">
                                                    <textarea
                                                        value={replyContent}
                                                        onChange={(e) => setReplyContent(e.target.value)}
                                                        placeholder="답변 내용을 입력하세요..."
                                                        className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary-500 outline-none resize-none h-24"
                                                    />
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setReplyingReviewId(null);
                                                                setReplyContent('');
                                                            }}
                                                            className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-sm"
                                                        >
                                                            취소
                                                        </button>
                                                        <button
                                                            onClick={() => handleReplySubmit(req.id)}
                                                            className="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700"
                                                        >
                                                            답변 등록
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setReplyingReviewId(req.id)}
                                                    className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
                                                >
                                                    <MessageSquare className="w-4 h-4" />
                                                    답변 달기
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'users':
                return (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">회원 관리</h2>
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    aria-label="회원 검색"
                                    placeholder="이름 또는 이메일 검색"
                                    value={userSearchTerm}
                                    onChange={(e) => setUserSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="glass-panel rounded-2xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 dark:bg-slate-900/50">
                                        <tr>
                                            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">회원명</th>
                                            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">이메일</th>
                                            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">구분</th>
                                            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">가입일</th>
                                            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">상태</th>
                                            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">작업</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                        {filteredUsers.map((u) => (
                                            <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30">
                                                <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">{u.username}</td>
                                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{u.email}</td>
                                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${u.accountType === 'ADMIN' ? 'bg-red-100 text-red-700' :
                                                        u.accountType === 'ACADEMY' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-slate-100 text-slate-700'
                                                        }`}>
                                                        {u.accountType}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{u.registeredDate}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${u.status === '활성' ? 'bg-green-100 text-green-700' :
                                                        u.status === '정지' ? 'bg-red-100 text-red-700' :
                                                            'bg-slate-100 text-slate-700'
                                                        }`}>
                                                        {u.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button className="text-slate-400 hover:text-slate-600" aria-label="더 보기">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );

            case 'academies':
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">훈련기관 관리</h2>
                        <div className="glass-panel rounded-2xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 dark:bg-slate-900/50">
                                        <tr>
                                            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">기관명</th>
                                            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">사업자번호</th>
                                            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">연락처</th>
                                            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">등록 과정</th>
                                            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">상태</th>
                                            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">작업</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                        {academies.map((academy) => (
                                            <tr key={academy.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30">
                                                <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">{academy.name}</td>
                                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{academy.businessNumber}</td>
                                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{academy.phone}</td>
                                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{academy.courseCount}개</td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                        {academy.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button className="text-slate-400 hover:text-slate-600" aria-label="더 보기">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );

            case 'banners':
                // 불변성을 유지하기 위해 배열을 복사한 후 정렬
                const sortedBanners = [...banners].sort((a, b) => a.displayOrder - b.displayOrder);

                return (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">배너 관리</h2>
                            <button
                                onClick={() => openBannerModal()}
                                className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
                            >
                                <Plus className="w-4 h-4" />
                                <span>배너 추가</span>
                            </button>
                        </div>

                        <div className="grid gap-4">
                            {sortedBanners.map((banner, index) => (
                                <div key={banner.id} className="glass-panel rounded-xl p-4 flex items-center gap-4">
                                    <div className="flex flex-col gap-1">
                                        <button
                                            onClick={() => handleBannerMove(banner.id, 'up')}
                                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500"
                                            disabled={index === 0}
                                            aria-label="위로 이동"
                                        >
                                            <ArrowUp className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleBannerMove(banner.id, 'down')}
                                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500"
                                            disabled={index === sortedBanners.length - 1}
                                            aria-label="아래로 이동"
                                        >
                                            <ArrowDown className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="w-32 h-20 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                                        <img src={sanitizeUrl(banner.imageUrl)} alt={banner.title} className="w-full h-full object-cover" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-slate-900 dark:text-white truncate">{banner.title}</h3>
                                            {!banner.isActive && (
                                                <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-full">비활성</span>
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-500 truncate">{banner.description}</p>
                                        <p className="text-xs text-slate-400 mt-1 truncate">{banner.linkUrl}</p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleBannerToggle(banner.id)}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${banner.isActive
                                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                        >
                                            {banner.isActive ? '활성' : '비활성'}
                                        </button>
                                        <button
                                            onClick={() => openBannerModal(banner)}
                                            className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                                            aria-label="배너 수정"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleBannerDelete(banner.id)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            aria-label="배너 삭제"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pt-24 pb-12">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="lg:w-64 flex-shrink-0">
                        <div className="glass-panel rounded-2xl p-4 sticky top-24">
                            <div className="flex items-center gap-3 px-4 py-3 mb-6 border-b border-slate-100 dark:border-slate-700">
                                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
                                    <LayoutDashboard className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-slate-900 dark:text-white">
                                        {user?.accountType === 'ADMIN' ? '관리자 센터' : '기관 센터'}
                                    </h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {user?.accountType === 'ADMIN' ? '시스템 통합 관리' : user?.affiliation || '기관 관리'}
                                    </p>
                                </div>
                            </div>

                            <nav className="space-y-1" role="tablist" aria-orientation="vertical">
                                {menuItems.map((item) => (
                                    <button
                                        key={item.id}
                                        role="tab"
                                        aria-selected={activeTab === item.id}
                                        onClick={() => setActiveTab(item.id)}
                                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === item.id
                                            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon className="w-5 h-5" />
                                            {item.label}
                                        </div>
                                        {item.badge !== undefined && item.badge > 0 && (
                                            <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-xs font-bold">
                                                {item.badge}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 min-w-0">
                        {renderTabContent()}
                    </main>
                </div>
            </div>

            {/* Modals */}
            <BannerModal
                isOpen={isBannerModalOpen}
                onClose={() => setIsBannerModalOpen(false)}
                onSubmit={handleBannerSubmit}
                initialData={editingBanner}
            />

            <CourseRequestModal
                isOpen={isCourseModalOpen}
                onClose={() => setIsCourseModalOpen(false)}
                onSubmit={handleCourseSubmit}
                initialData={editingCourse}
            />
        </div>
    );
};

export default AdminPage;
