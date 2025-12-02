import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { sanitizeUrl } from '../utils/security';
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
    ArrowDown
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import type {
    CourseApprovalRequest,
    ReviewApprovalRequest,
    BannerData,
    AdminUser,
    AdminAcademy
} from '../types';
import {
    getDashboardStats,
    getCourseApprovalRequests,
    getReviewApprovalRequests,
    getAdminBanners,
    getInstitutionDashboardStats,
    getInstitutionCourses,
    getInstitutionReviews,
    getAdminUsers,
    getAdminAcademies,
    approveCourse,
    rejectCourse,
    approveReview,
    rejectReview,
    swapBannerOrder,
    toggleBannerActivation,
    deleteBanner,
    approveAcademy,
    rejectAcademy,
    requestCourseRegistration,
    createCourseByAdmin,
    updateCourseRequest,
    convertFormToRequest,
    uploadCourseImage,
    createBanner,
    updateBanner,
    type DashboardStats
} from '../services/adminService';
import CourseRequestModal, { type CourseFormState } from '../components/admin/CourseRequestModal';
import BannerModal, { type BannerFormState } from '../components/admin/BannerModal';
import AlertModal from '../components/ui/AlertModal';
import ConfirmModal from '../components/common/ConfirmModal';
import ReasonInputModal from '../components/common/ReasonInputModal';

const AdminPage = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuthStore();

    // 상태 관리
    const [activeTab, setActiveTab] = useState('dashboard');
    const [courseRequests, setCourseRequests] = useState<CourseApprovalRequest[]>([]);
    const [reviewRequests, setReviewRequests] = useState<ReviewApprovalRequest[]>([]);
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [academies, setAcademies] = useState<AdminAcademy[]>([]);
    const [banners, setBanners] = useState<BannerData[]>([]);
    const [serverStats, setServerStats] = useState<DashboardStats | null>(null);

    // 필터 상태
    const [courseFilter, setCourseFilter] = useState<'전체' | '대기' | '승인' | '거부'>('대기');
    const [reviewFilter, setReviewFilter] = useState<'전체' | '대기' | '승인' | '거부'>('대기');
    const [academyFilter, setAcademyFilter] = useState<'전체' | '대기' | '활성' | '정지'>('전체');
    // 로딩 오류 상태
    const [loadError, setLoadError] = useState<string | null>(null);
    // 배너 모달 상태
    const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState<BannerData | null>(null);

    // 과정 모달 상태
    const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<CourseApprovalRequest | null>(null);

    // AlertModal 상태 (알림 메시지 표시)
    const [alertModal, setAlertModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'success' | 'error' | 'warning' | 'info';
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info'
    });

    // ConfirmModal 상태 (확인 대화상자)
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {}
    });

    // ReasonInputModal 상태 (거부 사유 입력)
    const [reasonModal, setReasonModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: (reason: string) => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {}
    });

    // 데이터 필터링 (ACADEMY 회원은 본인 기관 데이터만)
    const filteredCourseRequests = user?.accountType === 'ACADEMY' && user.academyId
        ? courseRequests.filter(r => r.academyId === user.academyId)
        : courseRequests;

    const [userSearchTerm, setUserSearchTerm] = useState('');

    const filteredReviewRequests = user?.accountType === 'ACADEMY' && user.academyId
        ? reviewRequests.filter(r => r.academyId === user.academyId)
        : reviewRequests;

    // 통계 계산 (서버 데이터 우선)
    const stats = {
        pendingCourses: serverStats?.pendingCourses ?? filteredCourseRequests.filter(r => r.status === '대기').length,
        approvedCourses: filteredCourseRequests.filter(r => r.status === '승인').length,
        pendingReviews: serverStats?.pendingReviews ?? filteredReviewRequests.filter(r => r.status === '대기').length,
        totalUsers: serverStats?.totalUsers ?? users.length,
        activeUsers: users.filter(u => u.status === '활성').length,
        totalAcademies: academies.length,
        activeBanners: banners.filter(b => b.isActive).length
    };

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        if (user?.accountType !== 'ADMIN' && user?.accountType !== 'ACADEMY') {
            navigate('/');
            return;
        }

        const loadData = async () => {
            try {
                // 병렬로 데이터 로딩
                let statsData: DashboardStats | undefined;
                let coursesData: { requests: CourseApprovalRequest[], totalCount: number } | undefined;
                let reviewsData: { requests: ReviewApprovalRequest[], totalCount: number } | undefined;
                let bannersData: BannerData[] = [];
                let usersData: { users: AdminUser[], totalCount: number } | undefined;
                let academiesData: { academies: AdminAcademy[], totalCount: number } | undefined;

                if (user?.accountType === 'ACADEMY') {
                    // 기관 회원용 데이터 로딩
                    const [stats, courses, reviews] = await Promise.all([
                        getInstitutionDashboardStats(),
                        getInstitutionCourses(),
                        getInstitutionReviews()
                    ]);
                    statsData = stats;
                    coursesData = courses;
                    reviewsData = reviews;
                    bannersData = [];
                } else {
                    // 관리자용 데이터 로딩
                    const [stats, courses, reviews, banners, users, academies] = await Promise.all([
                        getDashboardStats(),
                        getCourseApprovalRequests(),
                        getReviewApprovalRequests(),
                        getAdminBanners(),
                        getAdminUsers(),
                        getAdminAcademies()
                    ]);
                    statsData = stats;
                    coursesData = courses;
                    reviewsData = reviews;
                    bannersData = banners;
                    usersData = users;
                    academiesData = academies;
                }

                setServerStats(statsData || null);
                setCourseRequests(coursesData?.requests || []);
                setReviewRequests(reviewsData?.requests || []);
                setBanners(bannersData || []);
                if (usersData) setUsers(usersData.users);
                if (academiesData) setAcademies(academiesData.academies);

            } catch (error) {
                console.error("Failed to load admin data:", error);
                setLoadError('데이터를 불러오는데 실패했습니다. 다시 시도해주세요.');
            }
        };

        setLoadError(null);
        loadData();
    }, [isAuthenticated, user, navigate]);

    // 알림 모달 표시 헬퍼 함수
    const showAlert = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
        setAlertModal({ isOpen: true, title, message, type });
    };

    // 확인 모달 표시 헬퍼 함수
    const showConfirm = (title: string, message: string, onConfirm: () => void) => {
        setConfirmModal({ isOpen: true, title, message, onConfirm });
    };

    // 사유 입력 모달 표시 헬퍼 함수
    const showReasonInput = (title: string, message: string, onConfirm: (reason: string) => void) => {
        setReasonModal({ isOpen: true, title, message, onConfirm });
    };

    // 기관 승인/거부 핸들러
    const handleApproveAcademy = (academyId: number) => {
        showConfirm('기관 승인', '해당 기관을 승인하시겠습니까?', async () => {
            setConfirmModal(prev => ({ ...prev, isOpen: false }));
            try {
                await approveAcademy(academyId);
                showAlert('승인 완료', '기관이 승인되었습니다.', 'success');
                // 목록 갱신
                const { academies } = await getAdminAcademies();
                setAcademies(academies);
            } catch (error) {
                console.error('Failed to approve academy:', error);
                showAlert('승인 실패', '기관 승인에 실패했습니다.', 'error');
            }
        });
    };

    const handleRejectAcademy = (academyId: number) => {
        showReasonInput('기관 승인 거부', '거부 사유를 입력해주세요:', async (reason) => {
            setReasonModal(prev => ({ ...prev, isOpen: false }));
            try {
                await rejectAcademy(academyId, reason);
                showAlert('거부 완료', '기관 승인이 거부되었습니다.', 'success');
                // 목록 갱신
                const { academies } = await getAdminAcademies();
                setAcademies(academies);
            } catch (error) {
                console.error('Failed to reject academy:', error);
                showAlert('거부 실패', '기관 거부에 실패했습니다.', 'error');
            }
        });
    };

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
        if (action === '승인') {
            showConfirm('과정 승인', '해당 과정을 승인하시겠습니까?', async () => {
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
                try {
                    await approveCourse(requestId);
                    showAlert('승인 완료', '과정이 승인되었습니다.', 'success');
                    // 목록 및 통계 갱신
                    const { requests } = await getCourseApprovalRequests();
                    setCourseRequests(requests);
                    const newStats = await getDashboardStats();
                    setServerStats(newStats);
                } catch (error) {
                    console.error('Failed to approve course:', error);
                    showAlert('승인 실패', '과정 승인 중 오류가 발생했습니다.', 'error');
                }
            });
        } else {
            showReasonInput('과정 거부', '거부 사유를 입력해주세요:', async (reason) => {
                setReasonModal(prev => ({ ...prev, isOpen: false }));
                try {
                    await rejectCourse(requestId, reason);
                    showAlert('거부 완료', '과정이 거부되었습니다.', 'success');
                    // 목록 및 통계 갱신
                    const { requests } = await getCourseApprovalRequests();
                    setCourseRequests(requests);
                    const newStats = await getDashboardStats();
                    setServerStats(newStats);
                } catch (error) {
                    console.error('Failed to reject course:', error);
                    showAlert('거부 실패', '과정 거부 중 오류가 발생했습니다.', 'error');
                }
            });
        }
    };

    // 리뷰 승인 처리
    const handleReviewApproval = (requestId: number, action: '승인' | '거부') => {
        if (action === '승인') {
            showConfirm('리뷰 승인', '해당 리뷰를 승인하시겠습니까?', async () => {
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
                try {
                    await approveReview(requestId);
                    showAlert('승인 완료', '리뷰가 승인되었습니다.', 'success');
                    const { requests } = await getReviewApprovalRequests();
                    setReviewRequests(requests);
                    const newStats = await getDashboardStats();
                    setServerStats(newStats);
                } catch (error) {
                    console.error('Failed to approve review:', error);
                    showAlert('승인 실패', '리뷰 승인 중 오류가 발생했습니다.', 'error');
                }
            });
        } else {
            showReasonInput('리뷰 거부', '거부 사유를 입력해주세요:', async (reason) => {
                setReasonModal(prev => ({ ...prev, isOpen: false }));
                try {
                    await rejectReview(requestId, reason);
                    showAlert('거부 완료', '리뷰가 거부되었습니다.', 'success');
                    const { requests } = await getReviewApprovalRequests();
                    setReviewRequests(requests);
                    const newStats = await getDashboardStats();
                    setServerStats(newStats);
                } catch (error) {
                    console.error('Failed to reject review:', error);
                    showAlert('거부 실패', '리뷰 거부 중 오류가 발생했습니다.', 'error');
                }
            });
        }
    };

    // 배너 관련 핸들러
    const handleBannerDelete = (id: number) => {
        showConfirm('배너 삭제', '정말 이 배너를 삭제하시겠습니까?', async () => {
            setConfirmModal(prev => ({ ...prev, isOpen: false }));
            try {
                await deleteBanner(id);
                const newBanners = await getAdminBanners();
                setBanners(newBanners);
                showAlert('삭제 완료', '배너가 삭제되었습니다.', 'success');
            } catch (error) {
                console.error("Failed to delete banner", error);
                showAlert('삭제 실패', '배너 삭제 중 오류가 발생했습니다.', 'error');
            }
        });
    };

    const handleBannerToggle = async (id: number) => {
        try {
            await toggleBannerActivation(id);
            const newBanners = await getAdminBanners();
            setBanners(newBanners);
        } catch (error) {
            console.error("Failed to toggle banner", error);
            showAlert('상태 변경 실패', '배너 상태 변경 중 오류가 발생했습니다.', 'error');
        }
    };

    // 배너 순서 변경 (원자적 교환 API 사용)
    const handleBannerMove = async (id: number, direction: 'up' | 'down') => {
        // displayOrder 기준으로 정렬된 배너 목록 사용
        const sortedBanners = [...banners].sort((a, b) => a.displayOrder - b.displayOrder);
        const index = sortedBanners.findIndex(b => b.id === id);
        if (index === -1) return;
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === sortedBanners.length - 1) return;

        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        const currentBanner = sortedBanners[index];
        const targetBanner = sortedBanners[targetIndex];

        try {
            // 두 배너의 순서를 원자적으로 교환 (백엔드에서 트랜잭션으로 처리)
            await swapBannerOrder(currentBanner.id, targetBanner.id);
            const newBanners = await getAdminBanners();
            setBanners(newBanners);
        } catch (error) {
            console.error("Failed to reorder banners", error);
            showAlert('순서 변경 실패', '배너 순서 변경 중 오류가 발생했습니다.', 'error');
        }
    };

    const openBannerModal = (banner?: BannerData) => {
        setEditingBanner(banner || null);
        setIsBannerModalOpen(true);
    };



    const handleBannerSubmit = async (data: BannerFormState) => {
        try {
            // 링크 URL 보안 검증
            const safeLinkUrl = sanitizeUrl(data.linkUrl ?? '');
            
            const formData = new FormData();
            formData.append('title', data.title || '');
            formData.append('description', data.description || '');
            formData.append('linkUrl', safeLinkUrl);
            formData.append('isActivated', String(data.isActive));
            if (data.imageFile) {
                formData.append('imageFile', data.imageFile);
            }

            if (editingBanner) {
                const updatedBanner = await updateBanner(editingBanner.id, formData);
                setBanners(prev => prev.map(b =>
                    b.id === editingBanner.id ? updatedBanner : b
                ));
                showAlert('수정 완료', '배너가 수정되었습니다.', 'success');
            } else {
                const newBanner = await createBanner(formData);
                setBanners(prev => [...prev, newBanner]);
                showAlert('등록 완료', '배너가 생성되었습니다.', 'success');
            }
            setIsBannerModalOpen(false);
        } catch (error) {
            console.error('Banner submit failed:', error);
            showAlert('저장 실패', '배너 저장 중 오류가 발생했습니다.', 'error');
        }
    };

    // 과정 모달 핸들러
    const openCourseModal = (course?: CourseApprovalRequest) => {
        setEditingCourse(course || null);
        setIsCourseModalOpen(true);
    };

    const handleCourseSubmit = async (data: CourseFormState) => {
        // 관리자는 기관 선택 필요, 기관 회원은 본인 기관 사용
        let academyId: number;

        if (user?.accountType === 'ADMIN') {
            // 관리자는 모달에서 선택한 기관 사용
            if (data.selectedAcademyId) {
                academyId = data.selectedAcademyId;
            } else {
                showAlert('입력 오류', '기관을 선택해주세요.', 'warning');
                return;
            }
        } else {
            // 기관 회원은 본인 기관 사용
            if (!user?.academyId) {
                showAlert('입력 오류', '기관 정보가 없습니다. 관리자에게 문의하세요.', 'warning');
                return;
            }
            academyId = user.academyId;
        }

        try {
            // 폼 데이터를 백엔드 DTO 형식으로 변환
            const requestData = convertFormToRequest(data, academyId);

            let newRequest: CourseApprovalRequest;
            if (editingCourse) {
                // 과정 수정 요청
                newRequest = await updateCourseRequest(editingCourse.id, requestData);
                setCourseRequests(prev => prev.map(req =>
                    req.id === editingCourse.id ? newRequest : req
                ));
            } else {
                // 관리자는 즉시 승인, 기관 회원은 승인 대기
                if (user?.accountType === 'ADMIN') {
                    newRequest = await createCourseByAdmin(requestData);
                } else {
                    newRequest = await requestCourseRegistration(requestData);
                }
                setCourseRequests(prev => [newRequest, ...prev]);
            }

            // 이미지 파일이 있으면 업로드
            if (data.imageFile) {
                try {
                    const categoryType = data.target === '재직자' ? 'EMPLOYEE' : 'JOB_SEEKER';
                    await uploadCourseImage(categoryType, newRequest.id, data.imageFile, true);
                } catch (imageError) {
                    console.error('이미지 업로드 실패:', imageError);
                    showAlert('이미지 업로드 실패', '과정은 등록되었지만 이미지 업로드에 실패했습니다. 나중에 다시 시도해주세요.', 'warning');
                }
            }

            if (editingCourse) {
                showAlert('수정 완료', '과정이 수정되었습니다.', 'success');
            } else if (user?.accountType === 'ADMIN') {
                showAlert('등록 완료', '과정이 등록되었습니다.', 'success');
            } else {
                showAlert('요청 접수', '과정 등록 요청이 접수되었습니다. 관리자 승인 후 반영됩니다.', 'info');
            }

            // 통계 갱신
            if (user?.accountType === 'ACADEMY') {
                const newStats = await getInstitutionDashboardStats();
                setServerStats(newStats);
            } else if (user?.accountType === 'ADMIN') {
                const newStats = await getDashboardStats();
                setServerStats(newStats);
            }

            setIsCourseModalOpen(false);
        } catch (error: unknown) {
            console.error('Failed to submit course:', error);
            let message = '과정 처리 중 오류가 발생했습니다.';
            
            // axios 에러 타입 가드를 사용하여 타입 안전하게 처리
            if (axios.isAxiosError<{ message?: string }>(error)) {
                // AxiosError인 경우 응답 데이터의 메시지 사용
                if (error.response?.data?.message) {
                    message = error.response.data.message;
                } else if (error.message) {
                    message = error.message;
                }
            } else if (error instanceof Error) {
                // 일반 Error인 경우
                message = error.message;
            }
            
            showAlert('처리 실패', message, 'error');
        }
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
        user.userName.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearchTerm.toLowerCase())
    );

    const filteredAcademies = academies.filter(academy =>
        academyFilter === '전체' ? true : academy.status === academyFilter
    );

    // 재로드 함수
    const handleRetry = () => {
        setLoadError(null);
        window.location.reload();
    };

    const renderTabContent = () => {
        // 오류 상태 표시
        if (loadError) {
            return (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                        <XCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">데이터 로딩 실패</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">{loadError}</p>
                    <button
                        onClick={handleRetry}
                        className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
                    >
                        다시 시도
                    </button>
                </div>
            );
        }

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
                            <button
                                onClick={() => openCourseModal()}
                                className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
                            >
                                <Plus className="w-4 h-4" />
                                <span>{user?.accountType === 'ADMIN' ? '과정 직접 등록' : '과정 등록 요청'}</span>
                            </button>
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
                                                <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">{req.courseName}</td>
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
                                                                    onClick={() => showAlert('알림', '삭제 요청이 접수되었습니다.', 'info')}
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

                        <div className="glass-panel rounded-2xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 dark:bg-slate-900/50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">과정명</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">작성자</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">평점/내용</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">작성일</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">상태</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">작업</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                        {filteredReviews.map((req) => (
                                            <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30">
                                                <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">{req.courseName}</td>
                                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{req.writerName}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1 mb-1">
                                                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                                        <span className="text-sm font-medium text-slate-900 dark:text-white">{req.rating}</span>
                                                    </div>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1">{req.comment}</p>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{req.requestDate}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${req.status === '대기' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                        req.status === '승인' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                        }`}>
                                                        {req.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {user?.accountType === 'ADMIN' && req.status === '대기' ? (
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => handleReviewApproval(req.id, '승인')}
                                                                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition"
                                                            >
                                                                승인
                                                            </button>
                                                            <button
                                                                onClick={() => handleReviewApproval(req.id, '거부')}
                                                                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition"
                                                            >
                                                                거부
                                                            </button>
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

            case 'banners':
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
                            {[...banners].sort((a, b) => a.displayOrder - b.displayOrder).map((banner) => (
                                <div key={banner.id} className="glass-panel p-4 rounded-xl flex items-center gap-4">
                                    <div className="w-8 flex flex-col items-center gap-1">
                                        <button
                                            onClick={() => handleBannerMove(banner.id, 'up')}
                                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-600"
                                        >
                                            <ArrowUp className="w-4 h-4" />
                                        </button>
                                        <span className="text-xs font-bold text-slate-500">{banner.displayOrder}</span>
                                        <button
                                            onClick={() => handleBannerMove(banner.id, 'down')}
                                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-600"
                                        >
                                            <ArrowDown className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="w-32 h-20 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                                        <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-slate-900 dark:text-white truncate">{banner.title}</h3>
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${banner.isActive
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                                }`}>
                                                {banner.isActive ? '게시중' : '비활성'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{banner.linkUrl}</p>
                                        <p className="text-xs text-slate-400 mt-1">등록일: {banner.createdDate}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleBannerToggle(banner.id)}
                                            className={`p-2 rounded-lg transition-colors ${banner.isActive
                                                ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                                                : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                                }`}
                                            title={banner.isActive ? '비활성화' : '활성화'}
                                        >
                                            {banner.isActive ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                        </button>
                                        <button
                                            onClick={() => openBannerModal(banner)}
                                            className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                                        >
                                            <Edit2 className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleBannerDelete(banner.id)}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
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
                                    placeholder="이름 또는 이메일 검색"
                                    value={userSearchTerm}
                                    onChange={(e) => setUserSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                                />
                            </div>
                        </div>

                        <div className="glass-panel rounded-2xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 dark:bg-slate-900/50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">회원정보</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">구분</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">가입일</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">상태</th>
                                            <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white">관리</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                        {filteredUsers.map((user) => (
                                            <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <div className="font-medium text-slate-900 dark:text-white">{user.userName}</div>
                                                        <div className="text-sm text-slate-500">{user.email}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                                    {user.accountType === 'USER' ? '수강생' : user.accountType === 'ACADEMY' ? '기관' : '관리자'}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{user.registeredDate}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.status === '활성'
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400'
                                                        }`}>
                                                        {user.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                                        <MoreVertical className="w-5 h-5" />
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
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">기관 관리</h2>
                            <div className="flex items-center gap-4">
                                <div className="glass-panel p-1 rounded-xl w-fit flex items-center gap-2">
                                    {['전체', '대기', '활성', '정지'].map((filter) => (
                                        <button
                                            key={filter}
                                            onClick={() => setAcademyFilter(filter as typeof academyFilter)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${academyFilter === filter
                                                ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                                                }`}
                                        >
                                            {filter}
                                        </button>
                                    ))}
                                </div>
                                <button className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
                                    <Plus className="w-4 h-4" />
                                    <span>기관 등록</span>
                                </button>
                            </div>
                        </div>

                        <div className="glass-panel rounded-2xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 dark:bg-slate-900/50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">기관명</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">사업자번호</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">연락처</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">상태</th>
                                            <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white">관리</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                        {filteredAcademies.map((academy) => (
                                            <tr key={academy.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <div className="font-medium text-slate-900 dark:text-white">{academy.name}</div>
                                                        <div className="text-sm text-slate-500">{academy.address}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{academy.businessNumber}</td>
                                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                                    <div>{academy.phone}</div>
                                                    <div className="text-xs text-slate-500">{academy.email}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${academy.status === '활성'
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                        }`}>
                                                        {academy.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button className="text-indigo-600 hover:text-indigo-900 mr-3">수정</button>
                                                    {academy.status === '대기' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleApproveAcademy(academy.id)}
                                                                className="text-green-600 hover:text-green-900 mr-3"
                                                            >
                                                                승인
                                                            </button>
                                                            <button
                                                                onClick={() => handleRejectAcademy(academy.id)}
                                                                className="text-red-600 hover:text-red-900"
                                                            >
                                                                거부
                                                            </button>
                                                        </>
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
                isAdmin={user?.accountType === 'ADMIN'}
            />

            {/* Alert Modal */}
            <AlertModal
                isOpen={alertModal.isOpen}
                onClose={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
                title={alertModal.title}
                message={alertModal.message}
                type={alertModal.type}
            />

            {/* Confirm Modal */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText={confirmModal.confirmText}
                cancelText={confirmModal.cancelText}
                type={confirmModal.type}
            />

            {/* Reason Input Modal */}
            <ReasonInputModal
                isOpen={reasonModal.isOpen}
                onClose={() => setReasonModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={reasonModal.onConfirm}
                title={reasonModal.title}
                placeholder={reasonModal.placeholder}
            />
        </div>
    );
};

export default AdminPage;
