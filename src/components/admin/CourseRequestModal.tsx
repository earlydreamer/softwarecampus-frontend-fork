import type * as React from 'react';
import { useState, useEffect, useRef, useId, useCallback } from 'react';
import { X, Edit2, Upload, RefreshCw, Image as ImageIcon, Trash2 } from 'lucide-react';
import type { CourseApprovalRequest, CourseTarget, CategoryType, AdminAcademy } from '../../types';
import { getCourseCategories, getAdminAcademies, type CourseCategoryResponse } from '../../services/adminService';
import AlertModal from '../ui/AlertModal';
import TiptapEditor from '../editor/TiptapEditor';
import { sanitizeUrl } from '../../utils/security';
import { targetToCategoryType } from '../../utils/categoryType';

/**
 * 이미지 상태 관리를 위한 인터페이스
 * - file: 새로 업로드할 파일 (있으면 업로드 필요)
 * - previewUrl: 미리보기 URL (blob URL 또는 서버 URL)
 * - serverUrl: 서버에 저장된 원본 URL (수정 시 기존 이미지)
 * - imageId: 서버에 저장된 이미지 ID (삭제 API 호출용)
 * - isChanged: 이미지가 변경되었는지 여부 (삭제 또는 새 업로드)
 * - isDeleted: 기존 이미지를 삭제할 것인지 여부
 */
export interface ImageState {
    file?: File;
    previewUrl?: string;
    serverUrl?: string;
    imageId?: number;
    isChanged: boolean;
    isDeleted: boolean;
}

export interface CourseFormState extends Partial<CourseApprovalRequest> {
    thumbnailImage: ImageState;    // 썸네일 이미지 상태
    headerImage: ImageState;       // 헤더 이미지 상태
    selectedAcademyId?: number;    // 관리자가 선택한 기관 ID
    
    // 하위 호환을 위한 필드 (deprecated, 점진적으로 제거 예정)
    /** @deprecated thumbnailImage.file 사용 */
    imageFile?: File;
    /** @deprecated thumbnailImage.previewUrl 사용 */
    imageUrl?: string;
    /** @deprecated headerImage.file 사용 */
    headerImageFile?: File;
    /** @deprecated headerImage.previewUrl 사용 */
    headerImageUrl?: string;
}

/**
 * 빈 ImageState 생성 헬퍼 함수
 */
const createEmptyImageState = (): ImageState => ({
    file: undefined,
    previewUrl: undefined,
    serverUrl: undefined,
    imageId: undefined,
    isChanged: false,
    isDeleted: false,
});

interface CourseRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CourseFormState) => void;
    initialData?: CourseApprovalRequest | null;
    isAdmin?: boolean; // 관리자 여부
    defaultAcademyId?: number; // 기관 회원일 경우 기본 기관 ID
}

const CourseRequestModal: React.FC<CourseRequestModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    isAdmin = false,
    defaultAcademyId
}) => {
    const titleId = useId();
    const modalRef = useRef<HTMLDivElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);

    const [form, setForm] = useState<CourseFormState>({
        courseName: '',
        category: '',
        target: '취업예정자',
        format: '온라인',
        recruitStart: '',
        recruitEnd: '',
        courseStart: '',
        courseEnd: '',
        cost: 0,
        capacity: 30, // 기본값: 30명
        classDay: '평일', // 기본값: 평일
        isKdt: false,
        isNailbaeum: false,
        isOffline: false,
        location: '',
        description: '',
        thumbnailImage: createEmptyImageState(),
        headerImage: createEmptyImageState(),
        selectedAcademyId: defaultAcademyId
    });
    // 폼 유효성 검사 에러 상태 (필드별 분리)
    const [formErrors, setFormErrors] = useState<{
        courseName?: string;
        category?: string;
        academy?: string;
        recruitStart?: string;
        recruitEnd?: string;
        courseStart?: string;
        courseEnd?: string;
        general?: string; // 일반 에러 (폼 최상단에 표시)
    }>({});

    // AlertModal 상태
    const [alertModal, setAlertModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'error' | 'warning' | 'info';
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info'
    });

    /**
     * 이미지 파일 유효성 검증 헬퍼 함수
     * @param file - 검증할 파일
     * @returns 오류 메시지 또는 null (유효한 경우)
     */
    const validateImageFile = (file: File): string | null => {
        if (!file.type.startsWith('image/')) {
            return '이미지 파일만 업로드 가능합니다.';
        }
        if (file.size > 5 * 1024 * 1024) {
            return '파일 크기는 5MB를 초과할 수 없습니다.';
        }
        return null;
    };

    /**
     * 오류 모달 표시 헬퍼 함수
     */
    const showErrorModal = (message: string) => {
        setAlertModal({
            isOpen: true,
            title: '파일 업로드 오류',
            message,
            type: 'error'
        });
    };

    // 카테고리 목록 상태
    const [categories, setCategories] = useState<CourseCategoryResponse[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(false);
    const [categoryLoadError, setCategoryLoadError] = useState<string | null>(null);

    // 기관 목록 상태 (관리자용)
    const [academies, setAcademies] = useState<AdminAcademy[]>([]);
    const [isLoadingAcademies, setIsLoadingAcademies] = useState(false);
    const [academyLoadError, setAcademyLoadError] = useState<string | null>(null);

    // blob URL을 추적하기 위한 ref (썸네일, 헤더)
    const thumbnailBlobUrlRef = useRef<string | null>(null);
    const headerBlobUrlRef = useRef<string | null>(null);

    /**
     * 기관 목록 로드 함수 (관리자용)
     */
    const loadAcademies = useCallback(async () => {
        setIsLoadingAcademies(true);
        setAcademyLoadError(null);
        try {
            const result = await getAdminAcademies('APPROVED');
            // 배열인지 확인 (API 오류 시 빈 배열 반환됨)
            const academiesList = Array.isArray(result.academies) ? result.academies : [];
            setAcademies(academiesList);
            // 첫 번째 기관을 기본값으로 설정 (함수형 업데이트로 stale closure 방지)
            if (academiesList.length > 0) {
                setForm(prev => prev.selectedAcademyId ? prev : { ...prev, selectedAcademyId: academiesList[0].id });
            }
        } catch (err) {
            console.error('기관 목록 로드 실패:', err);
            setAcademyLoadError('기관 목록을 불러오는데 실패했습니다.');
        } finally {
            setIsLoadingAcademies(false);
        }
    }, []);

    // 기관 목록 로드 (관리자일 경우에만)
    useEffect(() => {
        if (isOpen && isAdmin) {
            loadAcademies();
        }
    }, [isOpen, isAdmin, loadAcademies]);

    // 카테고리 목록 로드
    useEffect(() => {
        if (isOpen) {
            const loadCategories = async () => {
                setIsLoadingCategories(true);
                setCategoryLoadError(null);
                try {
                    // 대상(target)에 따라 카테고리 타입 결정
                    // targetToCategoryType: 중앙화된 변환 함수로 유효성 검증 및 기본값 처리
                    const categoryType: CategoryType = targetToCategoryType(form.target);
                    const data = await getCourseCategories(categoryType);
                    
                    // 배열인지 확인 (API 오류 시 빈 배열 반환됨)
                    const categoriesData = Array.isArray(data) ? data : [];
                    setCategories(categoriesData);

                    // 첫 번째 카테고리를 기본값으로 설정 (함수형 업데이트 사용)
                    if (categoriesData.length > 0) {
                        setForm(prev => {
                            // 이미 카테고리가 설정되어 있고, 해당 카테고리가 새 목록에도 존재하면 유지
                            const currentCategoryExists = categoriesData.some(c => c.categoryName === prev.category);
                            if (prev.category && currentCategoryExists) {
                                return prev;
                            }
                            // 아니면 첫 번째 카테고리로 설정
                            return { ...prev, category: categoriesData[0].categoryName };
                        });
                    }
                } catch (err) {
                    console.error('카테고리 로드 실패:', err);
                    setCategoryLoadError('카테고리 목록을 불러오는데 실패했습니다.');
                } finally {
                    setIsLoadingCategories(false);
                }
            };
            loadCategories();
        }
    }, [isOpen, form.target]);

    useEffect(() => {
        if (isOpen) {
            // 모달이 열릴 때 현재 포커스된 요소 저장
            previousFocusRef.current = document.activeElement as HTMLElement;

            // 모달 내부로 포커스 이동 (접근성)
            const timer = setTimeout(() => {
                modalRef.current?.focus();
            }, 0);

            if (initialData) {
                // 수정 모드: 기존 데이터로 초기화
                setForm({
                    ...initialData,
                    selectedAcademyId: initialData.academyId,
                    thumbnailImage: {
                        file: undefined,
                        previewUrl: initialData.imageUrl || undefined,
                        serverUrl: initialData.imageUrl || undefined,
                        imageId: initialData.thumbnailImageId,
                        isChanged: false,
                        isDeleted: false,
                    },
                    headerImage: {
                        file: undefined,
                        previewUrl: initialData.headerImageUrl || undefined,
                        serverUrl: initialData.headerImageUrl || undefined,
                        imageId: initialData.headerImageId,
                        isChanged: false,
                        isDeleted: false,
                    },
                });
            } else {
                // 신규 등록 모드: 초기화
                setForm({
                    courseName: '',
                    category: '',
                    target: '취업예정자',
                    format: '온라인',
                    recruitStart: '',
                    recruitEnd: '',
                    courseStart: '',
                    courseEnd: '',
                    cost: 0,
                    capacity: 30, // 기본값: 30명
                    classDay: '평일', // 기본값
                    isKdt: false,
                    isNailbaeum: false,
                    isOffline: false,
                    location: '',
                    description: '',
                    thumbnailImage: createEmptyImageState(),
                    headerImage: createEmptyImageState(),
                    selectedAcademyId: defaultAcademyId
                });
            }

            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Escape') {
                    e.preventDefault();
                    onClose();
                }

                if (e.key === 'Tab' && modalRef.current) {
                    const focusableElements = modalRef.current.querySelectorAll(
                        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                    );

                    if (focusableElements.length === 0) return;

                    const firstElement = focusableElements[0] as HTMLElement;
                    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

                    if (e.shiftKey) {
                        if (document.activeElement === firstElement) {
                            e.preventDefault();
                            lastElement.focus();
                        }
                    } else {
                        if (document.activeElement === lastElement) {
                            e.preventDefault();
                            firstElement.focus();
                        }
                    }
                }
            };

            document.addEventListener('keydown', handleKeyDown);

            return () => {
                clearTimeout(timer);
                document.removeEventListener('keydown', handleKeyDown);
                // 모달이 닫힐 때 이전 포커스 복원
                previousFocusRef.current?.focus();
            };
        }
    }, [isOpen, initialData, onClose, defaultAcademyId]);

    // Cleanup blob URL on unmount only
    useEffect(() => {
        return () => {
            // unmount 시에만 ref에 저장된 blob URL revoke
            if (thumbnailBlobUrlRef.current) {
                URL.revokeObjectURL(thumbnailBlobUrlRef.current);
                thumbnailBlobUrlRef.current = null;
            }
            if (headerBlobUrlRef.current) {
                URL.revokeObjectURL(headerBlobUrlRef.current);
                headerBlobUrlRef.current = null;
            }
        };
    }, []); // 빈 배열: unmount 시에만 실행

    /**
     * 썸네일 이미지 파일 변경 핸들러
     */
    const handleThumbnailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // 파일 유효성 검사 (헬퍼 함수 사용)
            const validationError = validateImageFile(file);
            if (validationError) {
                showErrorModal(validationError);
                e.target.value = ''; // 입력 초기화
                return;
            }

            // 이전 blob URL이 있으면 revoke (ref에 저장된 것만)
            if (thumbnailBlobUrlRef.current) {
                URL.revokeObjectURL(thumbnailBlobUrlRef.current);
            }

            const previewUrl = URL.createObjectURL(file);
            thumbnailBlobUrlRef.current = previewUrl; // ref에 새 blob URL 저장

            setForm(prev => ({
                ...prev,
                thumbnailImage: {
                    file,
                    previewUrl,
                    serverUrl: prev.thumbnailImage?.serverUrl,
                    isChanged: true,
                    isDeleted: false,
                },
                // 하위 호환
                imageFile: file,
                imageUrl: previewUrl,
            }));
        }
    }, []);

    /**
     * 썸네일 이미지 삭제 핸들러
     */
    const handleThumbnailDelete = useCallback(() => {
        // blob URL revoke
        if (thumbnailBlobUrlRef.current) {
            URL.revokeObjectURL(thumbnailBlobUrlRef.current);
            thumbnailBlobUrlRef.current = null;
        }

        setForm(prev => ({
            ...prev,
            thumbnailImage: {
                file: undefined,
                previewUrl: undefined,
                serverUrl: prev.thumbnailImage?.serverUrl,
                isChanged: true,
                isDeleted: true,
            },
            // 하위 호환
            imageFile: undefined,
            imageUrl: '',
        }));
    }, []);

    /**
     * 헤더 이미지 파일 변경 핸들러
     */
    const handleHeaderImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // 파일 유효성 검사 (헬퍼 함수 사용)
            const validationError = validateImageFile(file);
            if (validationError) {
                showErrorModal(validationError);
                e.target.value = ''; // 입력 초기화
                return;
            }

            // 이전 blob URL이 있으면 revoke (ref에 저장된 것만)
            if (headerBlobUrlRef.current) {
                URL.revokeObjectURL(headerBlobUrlRef.current);
            }

            const previewUrl = URL.createObjectURL(file);
            headerBlobUrlRef.current = previewUrl; // ref에 새 blob URL 저장

            setForm(prev => ({
                ...prev,
                headerImage: {
                    file,
                    previewUrl,
                    serverUrl: prev.headerImage?.serverUrl,
                    isChanged: true,
                    isDeleted: false,
                },
                // 하위 호환
                headerImageFile: file,
                headerImageUrl: previewUrl,
            }));
        }
    }, []);

    /**
     * 헤더 이미지 삭제 핸들러
     */
    const handleHeaderImageDelete = useCallback(() => {
        // blob URL revoke
        if (headerBlobUrlRef.current) {
            URL.revokeObjectURL(headerBlobUrlRef.current);
            headerBlobUrlRef.current = null;
        }

        setForm(prev => ({
            ...prev,
            headerImage: {
                file: undefined,
                previewUrl: undefined,
                serverUrl: prev.headerImage?.serverUrl,
                isChanged: true,
                isDeleted: true,
            },
            // 하위 호환
            headerImageFile: undefined,
            headerImageUrl: '',
        }));
    }, []);

    /**
     * 과정 설명(Tiptap 에디터) 변경 핸들러
     */
    const handleDescriptionChange = useCallback((content: string) => {
        setForm(prev => ({ ...prev, description: content }));
    }, []);

    /**
     * 날짜 문자열이 유효한지 검증
     * @param dateStr - 검증할 날짜 문자열 (YYYY-MM-DD 형식)
     * @returns 유효한 날짜면 true, 그렇지 않으면 false
     */
    const isValidDate = (dateStr: string | undefined): boolean => {
        if (!dateStr || dateStr.trim() === '') return false;
        const timestamp = Date.parse(dateStr);
        return !isNaN(timestamp);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // 모든 필드를 한 번에 검증하여 에러 수집
        const errors: typeof formErrors = {};
        
        // 필수 텍스트 필드 검증
        if (!form.courseName || form.courseName.trim() === '') {
            errors.courseName = '과정명을 입력해주세요.';
        }
        if (!form.category || form.category.trim() === '') {
            errors.category = '카테고리를 선택해주세요.';
        }
        if (isAdmin && !form.selectedAcademyId) {
            errors.academy = '기관을 선택해주세요.';
        }
        
        // 날짜 필드 검증
        // 1. 필수 날짜 필드 존재 및 파싱 가능 여부
        if (!isValidDate(form.recruitStart)) {
            errors.recruitStart = '모집 시작일을 입력해주세요.';
        }
        if (!isValidDate(form.recruitEnd)) {
            errors.recruitEnd = '모집 종료일을 입력해주세요.';
        }
        if (!isValidDate(form.courseStart)) {
            errors.courseStart = '교육 시작일을 입력해주세요.';
        }
        if (!isValidDate(form.courseEnd)) {
            errors.courseEnd = '교육 종료일을 입력해주세요.';
        }
        
        // 2. 날짜 순서 검증 (모든 날짜가 유효할 때만)
        if (isValidDate(form.recruitStart) && isValidDate(form.recruitEnd)) {
            const recruitStartDate = new Date(form.recruitStart!);
            const recruitEndDate = new Date(form.recruitEnd!);
            if (recruitStartDate > recruitEndDate) {
                errors.recruitEnd = '모집 종료일은 시작일 이후여야 합니다.';
            }
        }
        
        if (isValidDate(form.courseStart) && isValidDate(form.courseEnd)) {
            const courseStartDate = new Date(form.courseStart!);
            const courseEndDate = new Date(form.courseEnd!);
            if (courseStartDate > courseEndDate) {
                errors.courseEnd = '교육 종료일은 시작일 이후여야 합니다.';
            }
        }
        
        // 3. 모집 종료일이 교육 시작일 이후가 아닌지 검증
        if (isValidDate(form.recruitEnd) && isValidDate(form.courseStart)) {
            const recruitEndDate = new Date(form.recruitEnd!);
            const courseStartDate = new Date(form.courseStart!);
            if (recruitEndDate > courseStartDate) {
                errors.recruitEnd = '모집 종료일은 교육 시작일 이전이어야 합니다.';
            }
        }
        
        // 에러가 있으면 상태 업데이트 후 반환
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }
        
        setFormErrors({});
        onSubmit(form);
    };

    if (!isOpen) return null;

    const isEditing = !!initialData;
    
    // 제출 버튼 비활성화 조건
    const isSubmitDisabled = 
        isLoadingCategories || 
        categories.length === 0 || 
        (isAdmin && (isLoadingAcademies || academies.length === 0));

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            ref={modalRef}
            tabIndex={-1}
        >
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
                    <h3
                        id={titleId}
                        className="text-lg font-bold text-slate-900 dark:text-white"
                    >
                        {isEditing ? '과정 수정 요청' : '과정 등록 요청'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Thumbnail Image Upload */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            과정 대표 이미지 (썸네일)
                        </label>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                            목록에서 보이는 대표 이미지입니다.
                        </p>
                        <div className="relative">
                            <div
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        document.getElementById('course-thumbnail-input')?.click();
                                    }
                                }}
                                className={`relative w-full h-48 rounded-xl border-2 border-dashed transition-colors flex flex-col items-center justify-center cursor-pointer overflow-hidden ${form.thumbnailImage?.previewUrl
                                    ? 'border-primary-500 bg-slate-50'
                                    : 'border-slate-300 hover:border-primary-400 bg-slate-50 hover:bg-slate-100'
                                    }`}
                                onClick={() => document.getElementById('course-thumbnail-input')?.click()}
                            >
                                {form.thumbnailImage?.previewUrl ? (
                                    <>
                                        <img
                                            src={sanitizeUrl(form.thumbnailImage.previewUrl, true) || ''}
                                            alt="썸네일 미리보기"
                                            className="absolute inset-0 w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                            <p className="text-white font-medium flex items-center gap-2">
                                                <Edit2 className="w-4 h-4" /> 이미지 변경
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center p-4">
                                        <div className="w-12 h-12 rounded-full bg-primary-50 text-primary-500 flex items-center justify-center mx-auto mb-3">
                                            <Upload className="w-6 h-6" />
                                        </div>
                                        <p className="text-sm font-medium text-slate-700">
                                            클릭하여 업로드
                                        </p>
                                    </div>
                                )}
                                <input
                                    id="course-thumbnail-input"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    aria-label="과정 썸네일 이미지 업로드"
                                    onChange={handleThumbnailChange}
                                />
                            </div>
                            {/* 썸네일 삭제 버튼 */}
                            {form.thumbnailImage?.previewUrl && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleThumbnailDelete();
                                    }}
                                    className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors z-10"
                                    title="이미지 삭제"
                                    aria-label="썸네일 이미지 삭제"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Header Image Upload */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            헤더 배경 이미지
                        </label>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                            과정 상세 페이지 상단에 표시되는 배경 이미지입니다. (권장: 1920x400 이상)
                        </p>
                        <div className="relative">
                            <div
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        document.getElementById('course-header-image-input')?.click();
                                    }
                                }}
                                className={`relative w-full h-32 rounded-xl border-2 border-dashed transition-colors flex flex-col items-center justify-center cursor-pointer overflow-hidden ${form.headerImage?.previewUrl
                                    ? 'border-blue-500 bg-slate-50'
                                    : 'border-slate-300 hover:border-blue-400 bg-slate-50 hover:bg-slate-100'
                                    }`}
                                onClick={() => document.getElementById('course-header-image-input')?.click()}
                            >
                                {form.headerImage?.previewUrl ? (
                                    <>
                                        <img
                                            src={sanitizeUrl(form.headerImage.previewUrl, true) || ''}
                                            alt="헤더 배경 미리보기"
                                            className="absolute inset-0 w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                            <p className="text-white font-medium flex items-center gap-2">
                                                <Edit2 className="w-4 h-4" /> 헤더 이미지 변경
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center p-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mx-auto mb-2">
                                            <ImageIcon className="w-5 h-5" />
                                        </div>
                                        <p className="text-sm font-medium text-slate-700">
                                            헤더 배경 이미지 업로드
                                        </p>
                                    </div>
                                )}
                                <input
                                    id="course-header-image-input"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    aria-label="헤더 배경 이미지 업로드"
                                    onChange={handleHeaderImageChange}
                                />
                            </div>
                            {/* 헤더 이미지 삭제 버튼 */}
                            {form.headerImage?.previewUrl && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleHeaderImageDelete();
                                    }}
                                    className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors z-10"
                                    title="이미지 삭제"
                                    aria-label="헤더 배경 이미지 삭제"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* 기관 선택 (관리자만 표시) */}
                    {isAdmin && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                훈련기관 <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={form.selectedAcademyId || ''}
                                onChange={e => {
                                    setForm({ ...form, selectedAcademyId: Number(e.target.value) });
                                    if (formErrors.academy) setFormErrors(prev => ({ ...prev, academy: undefined }));
                                }}
                                disabled={isLoadingAcademies}
                                className={`w-full px-4 py-2 rounded-lg border ${academyLoadError || formErrors.academy ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary-500 outline-none disabled:opacity-50`}
                            >
                                {isLoadingAcademies ? (
                                    <option value="">로딩 중...</option>
                                ) : academyLoadError ? (
                                    <option value="">기관 목록 로드 실패</option>
                                ) : academies.length === 0 ? (
                                    <option value="">승인된 기관이 없습니다</option>
                                ) : (
                                    academies.map(academy => (
                                        <option key={academy.id} value={academy.id}>
                                            {academy.name}
                                        </option>
                                    ))
                                )}
                            </select>
                            {academyLoadError && (
                                <div className="mt-1 flex items-center justify-between">
                                    <p className="text-sm text-red-500">{academyLoadError}</p>
                                    <button
                                        type="button"
                                        onClick={loadAcademies}
                                        disabled={isLoadingAcademies}
                                        className="text-xs text-primary-600 hover:underline flex items-center gap-1 disabled:opacity-50"
                                    >
                                        <RefreshCw className={`w-3 h-3 ${isLoadingAcademies ? 'animate-spin' : ''}`} />
                                        다시 시도
                                    </button>
                                </div>
                            )}
                            {formErrors.academy && !academyLoadError && (
                                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                                    <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                                    {formErrors.academy}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                과정명 <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={form.courseName || ''}
                                onChange={e => {
                                    setForm({ ...form, courseName: e.target.value });
                                    if (formErrors.courseName) setFormErrors(prev => ({ ...prev, courseName: undefined }));
                                }}
                                className={`w-full px-4 py-2 rounded-lg border ${formErrors.courseName ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:ring-primary-500'
                                    } bg-white dark:bg-slate-900 focus:ring-2 outline-none transition-colors`}
                                placeholder="과정명을 입력하세요"
                            />
                            {formErrors.courseName && (
                                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                                    <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                                    {formErrors.courseName}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                대상
                            </label>
                            <select
                                value={form.target || '취업예정자'}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                    const newTarget = e.target.value as CourseTarget;
                                    setForm({ ...form, target: newTarget, category: '' });
                                }}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary-500 outline-none"
                            >
                                <option value="취업예정자">취업예정자</option>
                                <option value="재직자">재직자</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                카테고리
                            </label>
                            <select
                                value={form.category || ''}
                                onChange={e => {
                                    setForm({ ...form, category: e.target.value });
                                    if (formErrors.category) setFormErrors(prev => ({ ...prev, category: undefined }));
                                }}
                                disabled={isLoadingCategories}
                                className={`w-full px-4 py-2 rounded-lg border ${categoryLoadError || formErrors.category ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary-500 outline-none disabled:opacity-50`}
                            >
                                {isLoadingCategories ? (
                                    <option value="">로딩 중...</option>
                                ) : categoryLoadError ? (
                                    <option value="">카테고리 로드 실패</option>
                                ) : categories.length === 0 ? (
                                    <option value="">카테고리 없음</option>
                                ) : (
                                    <>
                                        {/* form.category가 비어있을 때 선택 유도 옵션 표시 */}
                                        {!form.category && <option value="">카테고리 선택</option>}
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.categoryName}>
                                                {cat.categoryName}
                                            </option>
                                        ))}
                                    </>
                                )}
                            </select>
                            {categoryLoadError && (
                                <p className="mt-1 text-sm text-red-500">{categoryLoadError}</p>
                            )}
                            {formErrors.category && !categoryLoadError && (
                                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                                    <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                                    {formErrors.category}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                모집 시작일 <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={form.recruitStart || ''}
                                onChange={e => {
                                    setForm({ ...form, recruitStart: e.target.value });
                                    if (formErrors.recruitStart) setFormErrors(prev => ({ ...prev, recruitStart: undefined }));
                                }}
                                className={`w-full px-4 py-2 rounded-lg border ${formErrors.recruitStart ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:ring-primary-500'} bg-white dark:bg-slate-900 focus:ring-2 outline-none`}
                            />
                            {formErrors.recruitStart && (
                                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                                    <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                                    {formErrors.recruitStart}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                모집 종료일 <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={form.recruitEnd || ''}
                                onChange={e => {
                                    setForm({ ...form, recruitEnd: e.target.value });
                                    if (formErrors.recruitEnd) setFormErrors(prev => ({ ...prev, recruitEnd: undefined }));
                                }}
                                className={`w-full px-4 py-2 rounded-lg border ${formErrors.recruitEnd ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:ring-primary-500'} bg-white dark:bg-slate-900 focus:ring-2 outline-none`}
                            />
                            {formErrors.recruitEnd && (
                                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                                    <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                                    {formErrors.recruitEnd}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                교육 시작일 <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={form.courseStart || ''}
                                onChange={e => {
                                    setForm({ ...form, courseStart: e.target.value });
                                    if (formErrors.courseStart) setFormErrors(prev => ({ ...prev, courseStart: undefined }));
                                }}
                                className={`w-full px-4 py-2 rounded-lg border ${formErrors.courseStart ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:ring-primary-500'} bg-white dark:bg-slate-900 focus:ring-2 outline-none`}
                            />
                            {formErrors.courseStart && (
                                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                                    <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                                    {formErrors.courseStart}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                교육 종료일 <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={form.courseEnd || ''}
                                onChange={e => {
                                    setForm({ ...form, courseEnd: e.target.value });
                                    if (formErrors.courseEnd) setFormErrors(prev => ({ ...prev, courseEnd: undefined }));
                                }}
                                className={`w-full px-4 py-2 rounded-lg border ${formErrors.courseEnd ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:ring-primary-500'} bg-white dark:bg-slate-900 focus:ring-2 outline-none`}
                            />
                            {formErrors.courseEnd && (
                                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                                    <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                                    {formErrors.courseEnd}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Cost & Options */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                수강료 (원)
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={form.cost || 0}
                                onChange={e => {
                                    const parsed = parseInt(e.target.value, 10);
                                    const cost = Math.max(0, isNaN(parsed) ? 0 : parsed);
                                    setForm({ ...form, cost });
                                }}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                모집 정원 (명)
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={form.capacity || 30}
                                onChange={e => {
                                    const parsed = parseInt(e.target.value, 10);
                                    const capacity = Math.max(1, isNaN(parsed) ? 30 : parsed);
                                    setForm({ ...form, capacity });
                                }}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary-500 outline-none"
                                placeholder="30"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                수업 요일
                            </label>
                            <select
                                value={form.classDay || '평일'}
                                onChange={e => setForm({ ...form, classDay: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary-500 outline-none"
                            >
                                <option value="평일">평일</option>
                                <option value="주말">주말</option>
                                <option value="평일+주말">평일+주말</option>
                                <option value="월수금">월수금</option>
                                <option value="화목">화목</option>
                                <option value="자유 선택">자유 선택</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2 flex flex-col gap-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.isKdt || false}
                                    onChange={e => setForm({ ...form, isKdt: e.target.checked })}
                                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                                />
                                <span className="text-sm text-slate-700 dark:text-slate-300">K-Digital Training</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.isNailbaeum || false}
                                    onChange={e => setForm({ ...form, isNailbaeum: e.target.checked })}
                                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                                />
                                <span className="text-sm text-slate-700 dark:text-slate-300">국민내일배움카드</span>
                            </label>
                        </div>
                    </div>

                    {/* Offline & Location */}
                    <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.isOffline || false}
                                onChange={e => setForm({ ...form, isOffline: e.target.checked, format: e.target.checked ? '오프라인' : '온라인' })}
                                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                            />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">오프라인 과정</span>
                        </label>
                        {form.isOffline && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    강의 장소
                                </label>
                                <input
                                    type="text"
                                    value={form.location || ''}
                                    onChange={e => setForm({ ...form, location: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary-500 outline-none"
                                    placeholder="상세 주소를 입력하세요"
                                />
                            </div>
                        )}
                    </div>

                    {/* Description - TiptapEditor */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            과정 설명
                        </label>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                            서식, 이미지, 링크 등을 포함한 상세 설명을 작성할 수 있습니다.
                        </p>
                        <TiptapEditor
                            content={form.description || ''}
                            onChange={handleDescriptionChange}
                            enableFileAttachment={false}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitDisabled}
                            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isEditing ? '수정 요청' : '등록 요청'}
                        </button>
                    </div>
                </form>
            </div>

            {/* 파일 업로드 오류 모달 */}
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

export default CourseRequestModal;
