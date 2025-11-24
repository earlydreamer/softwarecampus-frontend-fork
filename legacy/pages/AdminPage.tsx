import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  LayoutDashboard,
  BookOpenIcon,
  StarIcon,
  UsersIcon,
  Building2,
  ImageIcon,
  CheckCircle,
  XCircle,
  XIcon,
  AlertCircle,
  Search,
  PlusIcon,
  EditIcon,
  Trash2,
  Eye,
  FilterIcon,
  ChevronUp,
  ChevronDown
} from '../components/icons/Icons';
import {
  getCourseApprovalRequests,
  processCourseApproval,
  restoreCourse,
  getReviewApprovalRequests,
  processReviewApproval,
  getAdminUsers,
  updateUserStatus,
  deleteUser,
  getAdminAcademies,
  createAcademy,
  updateAcademy,
  deleteAcademy,
  getAcademyQnA,
  answerAcademyQnA,
  deleteAcademyQnA,
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner
} from '../services/adminService';
import type {
  CourseApprovalRequest,
  ReviewApprovalRequest,
  AdminUser,
  AdminAcademy,
  AcademyQnA,
  BannerData
} from '../data/mockAdminData';

type TabType = 'dashboard' | 'courses' | 'reviews' | 'users' | 'academies' | 'banners';

/**
 * 관리자 페이지 메인 컴포넌트
 * 과정, 리뷰, 회원, 훈련기관, 배너를 관리합니다.
 */
const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // AbortController를 저장하여 요청 취소 관리
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // 작업별 로딩 상태
  const [isProcessingCourseApproval, setIsProcessingCourseApproval] = useState(false);
  const [isProcessingReviewApproval, setIsProcessingReviewApproval] = useState(false);
  const [isProcessingCourseRestore, setIsProcessingCourseRestore] = useState(false);
  const [isProcessingUserStatus, setIsProcessingUserStatus] = useState(false);
  const [isProcessingUserDelete, setIsProcessingUserDelete] = useState(false);
  const [isProcessingAcademyDelete, setIsProcessingAcademyDelete] = useState(false);
  const [isProcessingBannerSave, setIsProcessingBannerSave] = useState(false);
  const [isProcessingBannerDelete, setIsProcessingBannerDelete] = useState(false);
  const [isProcessingBannerMove, setIsProcessingBannerMove] = useState(false);
  
  // 토스트 알림 상태
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // 과정 승인 요청
  const [courseRequests, setCourseRequests] = useState<CourseApprovalRequest[]>([]);
  const [courseFilter, setCourseFilter] = useState<'전체' | '대기' | '승인' | '거부'>('대기');

  // 리뷰 승인 요청
  const [reviewRequests, setReviewRequests] = useState<ReviewApprovalRequest[]>([]);
  const [reviewFilter, setReviewFilter] = useState<'전체' | '대기' | '승인' | '거부'>('대기');

  // 회원 관리
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'전체' | 'ADMIN' | 'USER' | 'ACADEMY'>('전체');
  const [userStatusFilter, setUserStatusFilter] = useState<'전체' | '활성' | '정지' | '탈퇴'>('전체');

  // 훈련기관 관리
  const [academies, setAcademies] = useState<AdminAcademy[]>([]);
  const [academySearchTerm, setAcademySearchTerm] = useState('');
  const [academyStatusFilter, setAcademyStatusFilter] = useState<'전체' | '활성' | '정지'>('전체');

  // 훈련기관 Q&A
  const [qnaList, setQnaList] = useState<AcademyQnA[]>([]);
  const [qnaStatusFilter, setQnaStatusFilter] = useState<'전체' | '대기' | '답변완료'>('전체');

  // 배너 관리
  const [banners, setBanners] = useState<BannerData[]>([]);
  const [bannerFilter, setBannerFilter] = useState<'전체' | '활성' | '비활성'>('전체');

  // 과정 상세 모달
  const [selectedCourse, setSelectedCourse] = useState<CourseApprovalRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 배너 편집 모달
  const [selectedBanner, setSelectedBanner] = useState<BannerData | null>(null);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [bannerFormData, setBannerFormData] = useState<Partial<BannerData>>({});
  const [imagePreview, setImagePreview] = useState<string>('');
  const [bannerValidationError, setBannerValidationError] = useState<string>('');

  // 토스트 알림 표시 헬퍼
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  // 토스트 자동 닫기
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // 데이터 로드
  useEffect(() => {
    loadData();
    
    // 클린업: 컴포넌트 언마운트 시 진행 중인 요청 취소
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [activeTab]);

  const loadData = async () => {
    // 이전 요청이 진행 중이면 취소
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // 새로운 AbortController 생성
    const controller = new AbortController();
    abortControllerRef.current = controller;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Note: 현재 서비스 함수들이 AbortSignal을 지원하지 않으므로
      // 응답 후 상태 업데이트 전에 취소 여부를 확인
      if (activeTab === 'courses') {
        const requests = await getCourseApprovalRequests();
        if (!controller.signal.aborted) {
          setCourseRequests(requests);
        }
      } else if (activeTab === 'reviews') {
        const requests = await getReviewApprovalRequests();
        if (!controller.signal.aborted) {
          setReviewRequests(requests);
        }
      } else if (activeTab === 'users') {
        const userList = await getAdminUsers();
        if (!controller.signal.aborted) {
          setUsers(userList);
        }
      } else if (activeTab === 'academies') {
        const academyList = await getAdminAcademies();
        const qna = await getAcademyQnA();
        if (!controller.signal.aborted) {
          setAcademies(academyList);
          setQnaList(qna);
        }
      } else if (activeTab === 'banners') {
        const bannerList = await getBanners();
        if (!controller.signal.aborted) {
          setBanners(bannerList);
        }
      } else if (activeTab === 'dashboard') {
        // 대시보드 데이터 로드
        const [courses, reviews, userList] = await Promise.all([
          getCourseApprovalRequests(),
          getReviewApprovalRequests(),
          getAdminUsers()
        ]);
        if (!controller.signal.aborted) {
          setCourseRequests(courses);
          setReviewRequests(reviews);
          setUsers(userList);
        }
      }
    } catch (error) {
      // AbortError는 무시 (정상적인 취소)
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      
      if (!controller.signal.aborted) {
        console.error('Failed to load admin data:', error);
        setError(error instanceof Error ? error.message : '관리자 데이터를 불러오는데 실패했습니다.');
      }
    } finally {
      // 취소되지 않은 경우에만 로딩 상태 해제
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  };

  // 과정 승인 처리
  const handleCourseApproval = async (requestId: number, action: '승인' | '거부'): Promise<boolean> => {
    if (isProcessingCourseApproval) return false;
    
    setIsProcessingCourseApproval(true);
    try {
      await processCourseApproval(requestId, action);
      await loadData();
      showToast(`과정이 ${action}되었습니다.`, 'success');
      return true;
    } catch (error) {
      console.error('Failed to process course approval:', error);
      showToast(error instanceof Error ? error.message : '과정 처리에 실패했습니다.', 'error');
      return false;
    } finally {
      setIsProcessingCourseApproval(false);
    }
  };

  // 리뷰 승인 처리
  const handleReviewApproval = async (requestId: number, action: '승인' | '거부'): Promise<boolean> => {
    if (isProcessingReviewApproval) return false;
    
    setIsProcessingReviewApproval(true);
    try {
      await processReviewApproval(requestId, action);
      await loadData();
      showToast(`리뷰가 ${action}되었습니다.`, 'success');
      return true;
    } catch (error) {
      console.error('Failed to process review approval:', error);
      showToast(error instanceof Error ? error.message : '리뷰 처리에 실패했습니다.', 'error');
      return false;
    } finally {
      setIsProcessingReviewApproval(false);
    }
  };

  // 과정 복구 처리
  const handleCourseRestore = async (requestId: number): Promise<boolean> => {
    if (isProcessingCourseRestore) return false;
    if (!confirm('이 과정을 복구하시겠습니까?')) return false;
    
    setIsProcessingCourseRestore(true);
    try {
      await restoreCourse(requestId);
      await loadData();
      showToast('과정이 복구되었습니다.', 'success');
      return true;
    } catch (error) {
      console.error('Failed to restore course:', error);
      showToast(error instanceof Error ? error.message : '과정 복구에 실패했습니다.', 'error');
      return false;
    } finally {
      setIsProcessingCourseRestore(false);
    }
  };

  // 회원 상태 변경
  const handleUserStatusChange = async (userId: number, status: '활성' | '정지' | '탈퇴') => {
    if (isProcessingUserStatus) return;
    
    setIsProcessingUserStatus(true);
    try {
      await updateUserStatus(userId, status);
      await loadData();
      showToast(`회원 상태가 '${status}'(으)로 변경되었습니다.`, 'success');
    } catch (error) {
      console.error('Failed to update user status:', error);
      showToast(error instanceof Error ? error.message : '회원 상태 변경에 실패했습니다.', 'error');
    } finally {
      setIsProcessingUserStatus(false);
    }
  };

  // 회원 삭제
  const handleUserDelete = async (userId: number) => {
    if (isProcessingUserDelete) return;
    if (!confirm('정말로 이 회원을 삭제하시겠습니까?')) return;
    
    setIsProcessingUserDelete(true);
    try {
      await deleteUser(userId);
      await loadData();
      showToast('회원이 삭제되었습니다.', 'success');
    } catch (error) {
      console.error('Failed to delete user:', error);
      showToast(error instanceof Error ? error.message : '회원 삭제에 실패했습니다.', 'error');
    } finally {
      setIsProcessingUserDelete(false);
    }
  };

  // 훈련기관 삭제
  const handleAcademyDelete = async (academyId: number) => {
    if (isProcessingAcademyDelete) return;
    if (!confirm('정말로 이 훈련기관을 삭제하시겠습니까?')) return;
    
    setIsProcessingAcademyDelete(true);
    try {
      await deleteAcademy(academyId);
      await loadData();
      showToast('훈련기관이 삭제되었습니다.', 'success');
    } catch (error) {
      console.error('Failed to delete academy:', error);
      showToast(error instanceof Error ? error.message : '훈련기관 삭제에 실패했습니다.', 'error');
    } finally {
      setIsProcessingAcademyDelete(false);
    }
  };

  // 과정 상세 보기
  const handleCourseDetail = (course: CourseApprovalRequest) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCourse(null);
  };

  // 배너 추가/편집 열기
  const handleBannerEdit = (banner?: BannerData) => {
    if (banner) {
      setSelectedBanner(banner);
      setBannerFormData(banner);
      setImagePreview(banner.imageUrl || '');
    } else {
      setSelectedBanner(null);
      // 새 배너는 자동으로 마지막 순서로 설정
      const safeBanners = banners || [];
      const maxOrder = safeBanners.length > 0 ? Math.max(...safeBanners.map(b => b.displayOrder)) : 0;
      setBannerFormData({
        title: '',
        description: '',
        linkUrl: '',
        displayOrder: maxOrder + 1,
        isActive: true
      });
      setImagePreview('');
    }
    setIsBannerModalOpen(true);
  };

  // 배너 모달 닫기
  const handleCloseBannerModal = () => {
    // 이미지 프리뷰 URL 정리
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    
    setIsBannerModalOpen(false);
    setSelectedBanner(null);
    setBannerFormData({});
    setImagePreview('');
    setBannerValidationError('');
  };

  // 이미지 프리뷰 정리 (컴포넌트 언마운트 시)
  useEffect(() => {
    return () => {
      // 컴포넌트 언마운트 시 blob URL 정리
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // 이미지 파일 선택 핸들러
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 이전 프리뷰 URL 정리
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
      
      setBannerFormData({ ...bannerFormData, imageFile: file });
      
      // 미리보기 생성 (ObjectURL 사용)
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  // 배너 유효성 검사
  const validateBannerForm = (): string | null => {
    const title = bannerFormData.title?.trim();
    const linkUrl = bannerFormData.linkUrl?.trim();
    
    // 제목 검증
    if (!title) {
      return '배너 제목을 입력해주세요.';
    }
    
    // 이미지 검증 (신규 등록 시 또는 수정 시 새 이미지 선택한 경우)
    if (!selectedBanner) {
      // 신규 등록: 이미지 파일 또는 URL 필수
      if (!bannerFormData.imageFile && !bannerFormData.imageUrl?.trim()) {
        return '배너 이미지를 선택해주세요.';
      }
    }
    // 수정 시에는 기존 imageUrl이 있으면 새 이미지 선택은 선택사항
    
    // 링크 URL 검증
    if (!linkUrl) {
      return '링크 URL을 입력해주세요.';
    }
    
    // URL 형식 검증
    try {
      new URL(linkUrl);
    } catch {
      // URL 형식이 아닌 경우 상대 경로로 간주하고 / 로 시작하는지 확인
      if (!linkUrl.startsWith('/') && !linkUrl.startsWith('http://') && !linkUrl.startsWith('https://')) {
        return '올바른 URL 형식이 아닙니다. (예: https://example.com 또는 /path)';
      }
    }
    
    return null;
  };

  // 배너 저장
  const handleSaveBanner = async () => {
    if (isProcessingBannerSave) return;
    
    // 유효성 검사
    const validationError = validateBannerForm();
    if (validationError) {
      setBannerValidationError(validationError);
      showToast(validationError, 'error');
      return;
    }
    
    setBannerValidationError('');
    setIsProcessingBannerSave(true);
    
    try {
      // 입력값 trim 처리
      const trimmedData = {
        ...bannerFormData,
        title: bannerFormData.title?.trim(),
        description: bannerFormData.description?.trim(),
        linkUrl: bannerFormData.linkUrl?.trim(),
        imageUrl: bannerFormData.imageUrl?.trim()
      };
      
      if (selectedBanner) {
        // 수정
        await updateBanner(selectedBanner.id, trimmedData);
        showToast('배너가 수정되었습니다.', 'success');
      } else {
        // 신규 등록
        await createBanner(trimmedData as Omit<BannerData, 'id' | 'createdDate'>);
        showToast('배너가 등록되었습니다.', 'success');
      }
      await loadData();
      handleCloseBannerModal();
    } catch (error) {
      console.error('Failed to save banner:', error);
      showToast(error instanceof Error ? error.message : '배너 저장에 실패했습니다.', 'error');
    } finally {
      setIsProcessingBannerSave(false);
    }
  };

  // 배너 삭제
  const handleBannerDelete = async (bannerId: number) => {
    if (isProcessingBannerDelete) return;
    if (!confirm('정말로 이 배너를 삭제하시겠습니까?')) return;
    
    setIsProcessingBannerDelete(true);
    try {
      await deleteBanner(bannerId);
      await loadData();
      showToast('배너가 삭제되었습니다.', 'success');
    } catch (error) {
      console.error('Failed to delete banner:', error);
      showToast(error instanceof Error ? error.message : '배너 삭제에 실패했습니다.', 'error');
    } finally {
      setIsProcessingBannerDelete(false);
    }
  };

  // 배너 순서 이동
  const handleBannerMove = async (bannerId: number, direction: 'up' | 'down') => {
    if (isProcessingBannerMove) return;
    
    const safeBanners = banners || [];
    if (safeBanners.length === 0) return;
    
    // displayOrder로 정렬된 배너 목록
    const sortedBanners = [...safeBanners].sort((a, b) => a.displayOrder - b.displayOrder);
    const currentIndex = sortedBanners.findIndex(b => b.id === bannerId);
    
    if (currentIndex === -1) return;
    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === sortedBanners.length - 1) return;
    
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const currentBanner = sortedBanners[currentIndex];
    const targetBanner = sortedBanners[targetIndex];
    
    setIsProcessingBannerMove(true);
    try {
      // UI 즉시 업데이트
      const updatedBanners = [...safeBanners].map(banner => {
        if (banner.id === currentBanner.id) {
          return { ...banner, displayOrder: targetBanner.displayOrder };
        }
        if (banner.id === targetBanner.id) {
          return { ...banner, displayOrder: currentBanner.displayOrder };
        }
        return banner;
      });
      setBanners(updatedBanners);
      
      // 서버에 순서 교환 요청
      await updateBanner(currentBanner.id, { displayOrder: targetBanner.displayOrder });
      await updateBanner(targetBanner.id, { displayOrder: currentBanner.displayOrder });
      showToast('배너 순서가 변경되었습니다.', 'success');
    } catch (error) {
      console.error('Failed to move banner:', error);
      showToast(error instanceof Error ? error.message : '배너 순서 변경에 실패했습니다.', 'error');
      // 에러 발생 시 원래 데이터로 복구
      await loadData();
    } finally {
      setIsProcessingBannerMove(false);
    }
  };

  // 배너 폼 유효성 검사 (실시간)
  const isBannerFormValid = useMemo(() => {
    const title = bannerFormData.title?.trim();
    const linkUrl = bannerFormData.linkUrl?.trim();
    
    // 제목 검증
    if (!title) return false;
    
    // 이미지 검증
    if (!selectedBanner) {
      // 신규 등록: 이미지 파일 또는 URL 필수
      if (!bannerFormData.imageFile && !bannerFormData.imageUrl?.trim()) {
        return false;
      }
    }
    
    // 링크 URL 검증
    if (!linkUrl) return false;
    
    // URL 형식 검증
    try {
      new URL(linkUrl);
      return true;
    } catch {
      // 상대 경로인 경우
      if (linkUrl.startsWith('/') || linkUrl.startsWith('http://') || linkUrl.startsWith('https://')) {
        return true;
      }
      return false;
    }
  }, [bannerFormData, selectedBanner]);

  // 필터링된 데이터
  const filteredCourseRequests = (courseRequests || []).filter(req =>
    courseFilter === '전체' ? true : req.status === courseFilter
  );

  const filteredReviewRequests = (reviewRequests || []).filter(req =>
    reviewFilter === '전체' ? true : req.status === reviewFilter
  );

  const filteredUsers = (users || []).filter(user => {
    const matchesRole = userRoleFilter === '전체' || user.accountType === userRoleFilter;
    const matchesStatus = userStatusFilter === '전체' || user.status === userStatusFilter;
    const matchesSearch = !userSearchTerm ||
      user.username.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearchTerm.toLowerCase());
    return matchesRole && matchesStatus && matchesSearch;
  });

  const filteredAcademies = (academies || []).filter(academy => {
    const matchesStatus = academyStatusFilter === '전체' || academy.status === academyStatusFilter;
    const matchesSearch = !academySearchTerm ||
      academy.name.toLowerCase().includes(academySearchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const filteredQnA = (qnaList || []).filter(qna =>
    qnaStatusFilter === '전체' ? true : qna.status === qnaStatusFilter
  );

  const filteredBanners = (banners || [])
    .filter(banner => {
      if (bannerFilter === '전체') return true;
      return bannerFilter === '활성' ? banner.isActive : !banner.isActive;
    })
    .sort((a, b) => a.displayOrder - b.displayOrder);

  // 대시보드 통계 (방어적으로 빈 배열 처리)
  const stats = {
    pendingCourses: (courseRequests || []).filter(r => r.status === '대기').length,
    pendingReviews: (reviewRequests || []).filter(r => r.status === '대기').length,
    totalUsers: (users || []).length,
    activeUsers: (users || []).filter(u => u.status === '활성').length,
    totalAcademies: (academies || []).length,
    activeBanners: (banners || []).filter(b => b.isActive).length
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex">
        {/* 사이드바 */}
        <aside className="w-64 min-h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">관리자 페이지</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Admin Dashboard</p>
          </div>
          
          <nav className="px-3 space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-primary text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              대시보드
            </button>
            
            <button
              onClick={() => setActiveTab('courses')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'courses'
                  ? 'bg-primary text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <BookOpenIcon className="w-5 h-5" />
              과정 관리
              {stats.pendingCourses > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {stats.pendingCourses}
                </span>
              )}
            </button>
            
            <button
              onClick={() => setActiveTab('reviews')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'reviews'
                  ? 'bg-primary text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <StarIcon className="w-5 h-5" />
              리뷰 관리
              {stats.pendingReviews > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {stats.pendingReviews}
                </span>
              )}
            </button>
            
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'users'
                  ? 'bg-primary text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <UsersIcon className="w-5 h-5" />
              회원 관리
            </button>
            
            <button
              onClick={() => setActiveTab('academies')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'academies'
                  ? 'bg-primary text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Building2 className="w-5 h-5" />
              훈련기관 관리
            </button>
            
            <button
              onClick={() => setActiveTab('banners')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'banners'
                  ? 'bg-primary text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <ImageIcon className="w-5 h-5" />
              배너 관리
            </button>
          </nav>
        </aside>

        {/* 메인 콘텐츠 */}
        <main className="flex-1 p-8">
          {/* 에러 메시지 */}
          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-red-800 dark:text-red-300">오류 발생</h3>
                  <p className="text-sm text-red-700 dark:text-red-400 mt-1">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
          
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500 dark:text-gray-400">로딩 중...</div>
            </div>
          ) : (
            <>
              {/* 대시보드 */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">대시보드</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">승인 대기 과정</p>
                          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                            {stats.pendingCourses}
                          </p>
                        </div>
                        <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                          <BookOpenIcon className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">승인 대기 리뷰</p>
                          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                            {stats.pendingReviews}
                          </p>
                        </div>
                        <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-lg">
                          <StarIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-300" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">전체 회원</p>
                          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                            {stats.totalUsers}
                          </p>
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                            활성: {stats.activeUsers}
                          </p>
                        </div>
                        <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                          <UsersIcon className="w-6 h-6 text-green-600 dark:text-green-300" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">훈련기관</p>
                          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                            {stats.totalAcademies}
                          </p>
                        </div>
                        <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
                          <Building2 className="w-6 h-6 text-purple-600 dark:text-purple-300" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">활성 배너</p>
                          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                            {stats.activeBanners}
                          </p>
                        </div>
                        <div className="bg-pink-100 dark:bg-pink-900 p-3 rounded-lg">
                          <ImageIcon className="w-6 h-6 text-pink-600 dark:text-pink-300" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 최근 승인 대기 항목 */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        최근 과정 승인 요청
                      </h3>
                      <div className="space-y-3">
                        {courseRequests.filter(r => r.status === '대기').slice(0, 5).map(request => (
                          <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {request.courseTitle}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {request.academyName} · {request.requestDate}
                              </p>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              request.requestType === '등록'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                            }`}>
                              {request.requestType}
                            </span>
                          </div>
                        ))}
                        {courseRequests.filter(r => r.status === '대기').length === 0 && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                            승인 대기 중인 요청이 없습니다.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        최근 리뷰 승인 요청
                      </h3>
                      <div className="space-y-3">
                        {reviewRequests.filter(r => r.status === '대기').slice(0, 5).map(request => (
                          <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {request.courseTitle}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {request.authorName} · {'⭐'.repeat(request.rating)}
                              </p>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              request.requestType === '등록'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                            }`}>
                              {request.requestType}
                            </span>
                          </div>
                        ))}
                        {reviewRequests.filter(r => r.status === '대기').length === 0 && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                            승인 대기 중인 요청이 없습니다.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 과정 관리 */}
              {activeTab === 'courses' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">과정 관리</h2>
                    <select
                      value={courseFilter}
                      onChange={(e) => setCourseFilter(e.target.value as any)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="전체">전체</option>
                      <option value="대기">대기</option>
                      <option value="승인">승인</option>
                      <option value="거부">거부</option>
                    </select>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">과정명</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">기관</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">요청유형</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">상태</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">액션</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredCourseRequests.map(request => (
                          <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4">
                              <button
                                onClick={() => handleCourseDetail(request)}
                                className="text-sm text-primary hover:text-primary-dark dark:text-blue-400 dark:hover:text-blue-300 font-medium underline"
                              >
                                {request.courseTitle}
                              </button>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {request.category} · {request.target} · {request.format}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{request.academyName}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${request.requestType === '등록' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>
                                {request.requestType}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${request.status === '대기' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' : request.status === '승인' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>
                                {request.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {request.status === '대기' ? (
                                <div className="flex items-center gap-2">
                                  <button 
                                    onClick={() => handleCourseApproval(request.id, '승인')}
                                    disabled={isProcessingCourseApproval}
                                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    승인
                                  </button>
                                  <button 
                                    onClick={() => handleCourseApproval(request.id, '거부')}
                                    disabled={isProcessingCourseApproval}
                                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    거부
                                  </button>
                                </div>
                              ) : request.status === '승인' && request.requestType === '삭제' ? (
                                <button 
                                  onClick={() => handleCourseRestore(request.id)}
                                  disabled={isProcessingCourseRestore}
                                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  복구
                                </button>
                              ) : null}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredCourseRequests.length === 0 && (
                      <div className="text-center py-12 text-gray-500 dark:text-gray-400">표시할 데이터가 없습니다.</div>
                    )}
                  </div>
                </div>
              )}

              {/* 리뷰 관리 */}
              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">리뷰 관리</h2>
                  <div className="grid gap-4">
                    {filteredReviewRequests.map(request => (
                      <div key={request.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{request.courseTitle}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{request.authorName} · {'⭐'.repeat(request.rating)}</p>
                            <p className="mt-3 text-gray-700 dark:text-gray-300">{request.content}</p>
                          </div>
                          {request.status === '대기' && (
                            <div className="flex gap-2 ml-6">
                              <button 
                                onClick={() => handleReviewApproval(request.id, '승인')}
                                disabled={isProcessingReviewApproval}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                승인
                              </button>
                              <button 
                                onClick={() => handleReviewApproval(request.id, '거부')}
                                disabled={isProcessingReviewApproval}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                거부
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 회원 관리 */}
              {activeTab === 'users' && (
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">회원 관리</h2>
                  
                  {/* 검색 및 필터 */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[250px]">
                      <input
                        type="text"
                        placeholder="회원 이름 또는 이메일로 검색..."
                        value={userSearchTerm}
                        onChange={(e) => setUserSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <select
                      value={userRoleFilter}
                      onChange={(e) => setUserRoleFilter(e.target.value as '전체' | 'ADMIN' | 'USER' | 'ACADEMY')}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="전체">전체 권한</option>
                      <option value="ADMIN">관리자</option>
                      <option value="USER">일반</option>
                      <option value="ACADEMY">기관</option>
                    </select>
                    <select
                      value={userStatusFilter}
                      onChange={(e) => setUserStatusFilter(e.target.value as '전체' | '활성' | '정지' | '탈퇴')}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="전체">전체 상태</option>
                      <option value="활성">활성</option>
                      <option value="정지">정지</option>
                      <option value="탈퇴">탈퇴</option>
                    </select>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">회원정보</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">권한</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">상태</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">가입일</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredUsers.map(user => (
                          <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{user.username}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{user.accountType === 'ADMIN' ? '관리자' : user.accountType === 'ACADEMY' ? '기관' : '일반'}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${user.status === '활성' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>
                                {user.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{user.registeredDate}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 훈련기관 관리 */}
              {activeTab === 'academies' && (
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">훈련기관 관리</h2>
                  <div className="grid gap-4">
                    {filteredAcademies.map(academy => (
                      <div key={academy.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{academy.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{academy.email} · {academy.phone}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{academy.address}</p>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${academy.status === '활성' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>
                            {academy.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 배너 관리 */}
              {activeTab === 'banners' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">배너 관리</h2>
                    <div className="flex items-center gap-4">
                      <select
                        value={bannerFilter}
                        onChange={(e) => setBannerFilter(e.target.value as any)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        <option value="전체">전체</option>
                        <option value="활성">활성</option>
                        <option value="비활성">비활성</option>
                      </select>
                      <button 
                        onClick={() => handleBannerEdit()}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors"
                      >
                        <PlusIcon className="w-5 h-5" />
                        배너 추가
                      </button>
                    </div>
                  </div>
                  <div className="grid gap-6">
                    {filteredBanners.map((banner, index) => {
                      // 전체 배너 목록에서의 실제 인덱스 계산
                      const safeBanners = banners || [];
                      const originalIndex = safeBanners.findIndex(b => b.id === banner.id);
                      const isFirst = originalIndex === 0;
                      const isLast = originalIndex === safeBanners.length - 1;
                      
                      return (
                      <div key={banner.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                        <div className="flex">
                          <div className="w-64 h-32 bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                            <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 text-xs font-semibold">
                                    {banner.displayOrder}
                                  </span>
                                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{banner.title}</h3>
                                </div>
                                {banner.description && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{banner.description}</p>
                                )}
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">링크: {banner.linkUrl}</p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                  {banner.startDate && banner.endDate ? (
                                    <span>기간: {banner.startDate} ~ {banner.endDate}</span>
                                  ) : (
                                    <span>기간: 무기한</span>
                                  )}
                                  <span className={`px-2 py-1 rounded-full ${banner.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                                    {banner.isActive ? '활성' : '비활성'}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 ml-4">
                                {/* 순서 이동 버튼 */}
                                <div className="flex flex-col gap-1">
                                  <button
                                    onClick={() => handleBannerMove(banner.id, 'up')}
                                    disabled={isFirst || isProcessingBannerMove}
                                    className={`p-1 rounded ${
                                      isFirst || isProcessingBannerMove
                                        ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                        : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                                    title="위로 이동"
                                  >
                                    <ChevronUp className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleBannerMove(banner.id, 'down')}
                                    disabled={isLast || isProcessingBannerMove}
                                    className={`p-1 rounded ${
                                      isLast || isProcessingBannerMove
                                        ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                        : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                                    title="아래로 이동"
                                  >
                                    <ChevronDown className="w-4 h-4" />
                                  </button>
                                </div>
                                <div className="h-12 w-px bg-gray-300 dark:bg-gray-600"></div>
                                <button
                                  onClick={() => handleBannerEdit(banner)}
                                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                  title="수정"
                                >
                                  <EditIcon className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleBannerDelete(banner.id)}
                                  disabled={isProcessingBannerDelete}
                                  className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="삭제"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* 과정 상세 모달 */}
      {isModalOpen && selectedCourse && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* 배경 오버레이 */}
            <div 
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75"
              onClick={handleCloseModal}
            />

            {/* 모달 센터링 */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

            {/* 모달 컨텐츠 */}
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              {/* 헤더 */}
              <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    과정 상세 정보
                  </h3>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    <XIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* 바디 */}
              <div className="px-6 py-4 space-y-4">
                <div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedCourse.courseTitle}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {selectedCourse.academyName}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">카테고리</p>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedCourse.category}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">대상</p>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedCourse.target}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">형식</p>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedCourse.format}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">요청 유형</p>
                    <p className="mt-1">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedCourse.requestType === '등록'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      }`}>
                        {selectedCourse.requestType}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">요청 상태</p>
                    <p className="mt-1">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedCourse.status === '대기'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                          : selectedCourse.status === '승인'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      }`}>
                        {selectedCourse.status}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">요청일</p>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedCourse.requestDate}</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">요청자</p>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {selectedCourse.requesterName} (ID: {selectedCourse.requesterId})
                    </p>
                  </div>
                </div>
              </div>

              {/* 푸터 */}
              {selectedCourse.status === '대기' ? (
                <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-end gap-3">
                  <button
                    onClick={async () => {
                      const success = await handleCourseApproval(selectedCourse.id, '승인');
                      if (success) {
                        handleCloseModal();
                      }
                    }}
                    disabled={isProcessingCourseApproval}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    승인
                  </button>
                  <button
                    onClick={async () => {
                      const success = await handleCourseApproval(selectedCourse.id, '거부');
                      if (success) {
                        handleCloseModal();
                      }
                    }}
                    disabled={isProcessingCourseApproval}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    거부
                  </button>
                </div>
              ) : selectedCourse.status === '승인' && selectedCourse.requestType === '삭제' ? (
                <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-end gap-3">
                  <button
                    onClick={async () => {
                      const success = await handleCourseRestore(selectedCourse.id);
                      if (success) {
                        handleCloseModal();
                      }
                    }}
                    disabled={isProcessingCourseRestore}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    복구
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* 배너 편집 모달 */}
      {isBannerModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* 배경 오버레이 */}
            <div 
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75"
              onClick={handleCloseBannerModal}
            />

            {/* 모달 센터링 */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

            {/* 모달 컨텐츠 */}
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              {/* 헤더 */}
              <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedBanner ? '배너 수정' : '배너 추가'}
                  </h3>
                  <button
                    onClick={handleCloseBannerModal}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    <XIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* 바디 */}
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    배너 제목 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={bannerFormData.title || ''}
                    onChange={(e) => {
                      setBannerFormData({ ...bannerFormData, title: e.target.value });
                      setBannerValidationError('');
                    }}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="배너 제목을 입력하세요"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    설명 (선택사항)
                  </label>
                  <textarea
                    value={bannerFormData.description || ''}
                    onChange={(e) => setBannerFormData({ ...bannerFormData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="배너에 표시할 설명을 입력하세요 (비어있으면 표시되지 않습니다)"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    배너 이미지 {!selectedBanner && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      handleImageFileChange(e);
                      setBannerValidationError('');
                    }}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300"
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <img 
                        src={imagePreview} 
                        alt="미리보기" 
                        className="w-full h-40 object-cover rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x400?text=Invalid+Image';
                        }}
                      />
                    </div>
                  )}
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {selectedBanner ? '새 이미지를 선택하면 기존 이미지가 교체됩니다.' : '이미지를 선택해주세요.'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    링크 URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={bannerFormData.linkUrl || ''}
                    onChange={(e) => {
                      setBannerFormData({ ...bannerFormData, linkUrl: e.target.value });
                      setBannerValidationError('');
                    }}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="https://example.com 또는 /path"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    전체 URL (https://...) 또는 상대 경로 (/...)를 입력하세요.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    활성 상태
                  </label>
                  <select
                    value={bannerFormData.isActive ? 'true' : 'false'}
                    onChange={(e) => setBannerFormData({ ...bannerFormData, isActive: e.target.value === 'true' })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  >
                    <option value="true">활성</option>
                    <option value="false">비활성</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    배너의 표시 순서는 목록에서 위/아래 버튼으로 조정할 수 있습니다.
                  </p>
                </div>

                <div>
                  <div className="flex items-center mb-3">
                    <input
                      type="checkbox"
                      id="unlimitedPeriod"
                      checked={!bannerFormData.startDate && !bannerFormData.endDate}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setBannerFormData({ ...bannerFormData, startDate: undefined, endDate: undefined });
                        } else {
                          const today = new Date().toISOString().split('T')[0];
                          const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                          setBannerFormData({ ...bannerFormData, startDate: today, endDate: nextMonth });
                        }
                      }}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label htmlFor="unlimitedPeriod" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      무기한 노출
                    </label>
                  </div>

                  {(bannerFormData.startDate || bannerFormData.endDate) && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          노출 시작일
                        </label>
                        <input
                          type="date"
                          value={bannerFormData.startDate || ''}
                          onChange={(e) => setBannerFormData({ ...bannerFormData, startDate: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          노출 종료일
                        </label>
                        <input
                          type="date"
                          value={bannerFormData.endDate || ''}
                          onChange={(e) => setBannerFormData({ ...bannerFormData, endDate: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 푸터 */}
              <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4">
                {/* 유효성 검사 에러 메시지 */}
                {bannerValidationError && (
                  <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700 dark:text-red-400">{bannerValidationError}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end gap-3">
                  <button
                    onClick={handleCloseBannerModal}
                    disabled={isProcessingBannerSave}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-900 dark:text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleSaveBanner}
                    disabled={isProcessingBannerSave || !isBannerFormValid}
                    className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title={!isBannerFormValid ? '필수 항목을 입력해주세요' : ''}
                  >
                    {isProcessingBannerSave ? '저장 중...' : '저장'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 토스트 알림 */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg ${
            toast.type === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <p className="text-sm font-medium">{toast.message}</p>
            <button
              onClick={() => setToast(null)}
              className="ml-2 hover:opacity-80"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
