import { useState, useEffect, useRef, useId } from 'react';
import { X, Upload, Trash2, FileText, Building, Camera, User, Eye, Image } from 'lucide-react';

/**
 * 기관 등록 폼 데이터 타입
 */
export interface AcademyFormData {
    name: string;
    address: string;
    businessNumber: string;
    email: string;
    phoneNumber: string;
    website: string;
    files: File[];
}

/**
 * 기관 수정용 데이터 타입 (수정 모드에서 초기값으로 사용)
 */
export interface AcademyEditData {
    id: number;
    name: string;
    address: string;
    businessNumber: string;
    email: string;
    phoneNumber?: string;
    website?: string;
    logoUrl?: string;  // 기존 프로필 이미지 URL (작성일: 2025-12-03)
}

interface AcademyCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: AcademyFormData) => Promise<void>;
    /** 수정 모드용 - 기존 기관 데이터 */
    editData?: AcademyEditData | null;
    /** 수정 모드용 - 수정 제출 핸들러 */
    onEdit?: (id: number, data: Omit<AcademyFormData, 'files'>) => Promise<void>;
    /** 프로필 이미지 업로드 핸들러 (작성일: 2025-12-03) */
    onUploadProfileImage?: (academyId: number, image: File) => Promise<void>;
    /** 프로필 이미지 삭제 핸들러 (작성일: 2025-12-03) */
    onDeleteProfileImage?: (academyId: number) => Promise<void>;
}

/**
 * 기관 등록/수정 모달 컴포넌트
 * 관리자가 새로운 훈련기관을 등록하거나 기존 기관을 수정할 때 사용합니다.
 * 수정일: 2025-12-03 - 수정 모드 지원 추가, 프로필 이미지 업로드 기능 추가
 */
const AcademyCreateModal = ({ 
    isOpen, 
    onClose, 
    onSubmit, 
    editData, 
    onEdit,
    onUploadProfileImage,
    onDeleteProfileImage 
}: AcademyCreateModalProps) => {
    const titleId = useId();
    const modalRef = useRef<HTMLDivElement>(null);
    const firstInputRef = useRef<HTMLInputElement>(null);
    const profileInputRef = useRef<HTMLInputElement>(null);
    
    // 수정 모드 여부
    const isEditMode = !!editData;

    // 폼 상태
    const [formData, setFormData] = useState<AcademyFormData>({
        name: '',
        address: '',
        businessNumber: '',
        email: '',
        phoneNumber: '',
        website: '',
        files: [],
    });

    // 첨부파일 미리보기 상태
    const [previewFile, setPreviewFile] = useState<{ url: string; name: string; type: string } | null>(null);

    // 프로필 이미지 상태 (작성일: 2025-12-03)
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
    const [existingLogoUrl, setExistingLogoUrl] = useState<string | null>(null);
    const [isUploadingProfile, setIsUploadingProfile] = useState(false);

    const [errors, setErrors] = useState<Partial<Record<keyof AcademyFormData, string>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 모달 열릴 때 초기화 및 포커스
    useEffect(() => {
        if (isOpen) {
            // 수정 모드: 기존 데이터로 초기화
            if (editData) {
                setFormData({
                    name: editData.name || '',
                    address: editData.address || '',
                    businessNumber: editData.businessNumber || '',
                    email: editData.email || '',
                    phoneNumber: editData.phoneNumber || '',
                    website: editData.website || '',
                    files: [], // 수정 모드에서는 파일 새로 첨부 가능 (선택)
                });
                // 기존 프로필 이미지 설정 (작성일: 2025-12-03)
                setExistingLogoUrl(editData.logoUrl || null);
                setProfileImagePreview(editData.logoUrl || null);
            } else {
                // 등록 모드: 빈 폼으로 초기화
                setFormData({
                    name: '',
                    address: '',
                    businessNumber: '',
                    email: '',
                    phoneNumber: '',
                    website: '',
                    files: [],
                });
                setExistingLogoUrl(null);
                setProfileImagePreview(null);
            }
            setPreviewFile(null);
            setProfileImage(null);
            setErrors({});
            setIsSubmitting(false);

            // 첫 번째 입력 필드에 포커스
            setTimeout(() => {
                firstInputRef.current?.focus();
            }, 100);
        }
    }, [isOpen, editData]);

    // ESC 키 및 포커스 트랩
    useEffect(() => {
        if (!isOpen) return;

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
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // 입력값 변경 핸들러
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        // 사업자등록번호 자동 포맷팅 (000-00-00000)
        if (name === 'businessNumber') {
            const numbers = value.replace(/[^0-9]/g, '');
            let formatted = numbers;
            if (numbers.length > 3) {
                formatted = numbers.slice(0, 3) + '-' + numbers.slice(3);
            }
            if (numbers.length > 5) {
                formatted = numbers.slice(0, 3) + '-' + numbers.slice(3, 5) + '-' + numbers.slice(5, 10);
            }
            setFormData(prev => ({ ...prev, [name]: formatted }));
        } else if (name === 'phoneNumber') {
            // 전화번호 자동 포맷팅 (00-0000-0000 또는 000-0000-0000)
            const numbers = value.replace(/[^0-9]/g, '');
            let formatted = numbers;
            if (numbers.startsWith('02')) {
                // 서울 지역번호
                if (numbers.length > 2) {
                    formatted = numbers.slice(0, 2) + '-' + numbers.slice(2);
                }
                if (numbers.length > 6) {
                    formatted = numbers.slice(0, 2) + '-' + numbers.slice(2, 6) + '-' + numbers.slice(6, 10);
                }
            } else {
                // 그 외 지역번호 또는 휴대폰
                if (numbers.length > 3) {
                    formatted = numbers.slice(0, 3) + '-' + numbers.slice(3);
                }
                if (numbers.length > 7) {
                    formatted = numbers.slice(0, 3) + '-' + numbers.slice(3, 7) + '-' + numbers.slice(7, 11);
                }
            }
            setFormData(prev => ({ ...prev, [name]: formatted }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }

        // 에러 클리어
        if (errors[name as keyof AcademyFormData]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    // 파일 업로드 핸들러
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newFiles = Array.from(e.target.files || []);
        if (newFiles.length > 0) {
            setFormData(prev => ({
                ...prev,
                files: [...prev.files, ...newFiles],
            }));
            if (errors.files) {
                setErrors(prev => ({ ...prev, files: undefined }));
            }
        }
        // input 초기화 (같은 파일 재선택 가능)
        e.target.value = '';
    };

    // 파일 삭제 핸들러
    const handleFileRemove = (index: number) => {
        setFormData(prev => ({
            ...prev,
            files: prev.files.filter((_, i) => i !== index),
        }));
    };

    // 프로필 이미지 선택 핸들러 (작성일: 2025-12-03)
    const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // 이미지 타입 검증
        if (!file.type.startsWith('image/')) {
            alert('이미지 파일만 업로드 가능합니다.');
            return;
        }

        // 파일 크기 검증 (5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('파일 크기는 5MB 이하여야 합니다.');
            return;
        }

        setProfileImage(file);
        
        // 미리보기 생성
        const reader = new FileReader();
        reader.onload = (event) => {
            setProfileImagePreview(event.target?.result as string);
        };
        reader.readAsDataURL(file);

        // 수정 모드에서는 즉시 업로드
        if (isEditMode && editData && onUploadProfileImage) {
            setIsUploadingProfile(true);
            try {
                await onUploadProfileImage(editData.id, file);
            } catch (error) {
                console.error('프로필 이미지 업로드 실패:', error);
                // 실패 시 이전 상태로 복원
                setProfileImagePreview(existingLogoUrl);
                setProfileImage(null);
            } finally {
                setIsUploadingProfile(false);
            }
        }

        // input 초기화
        e.target.value = '';
    };

    // 프로필 이미지 삭제 핸들러 (작성일: 2025-12-03)
    const handleProfileImageDelete = async () => {
        if (isEditMode && editData && onDeleteProfileImage) {
            setIsUploadingProfile(true);
            try {
                await onDeleteProfileImage(editData.id);
                setProfileImagePreview(null);
                setExistingLogoUrl(null);
                setProfileImage(null);
            } catch (error) {
                console.error('프로필 이미지 삭제 실패:', error);
            } finally {
                setIsUploadingProfile(false);
            }
        } else {
            // 등록 모드에서는 로컬 상태만 초기화
            setProfileImagePreview(null);
            setProfileImage(null);
        }
    };

    // 폼 유효성 검사
    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof AcademyFormData, string>> = {};

        if (!formData.name.trim()) {
            newErrors.name = '기관명을 입력해주세요.';
        }

        if (!formData.address.trim()) {
            newErrors.address = '주소를 입력해주세요.';
        }

        if (!formData.businessNumber.trim()) {
            newErrors.businessNumber = '사업자등록번호를 입력해주세요.';
        } else if (!/^\d{3}-\d{2}-\d{5}$/.test(formData.businessNumber)) {
            newErrors.businessNumber = '올바른 형식으로 입력해주세요. (예: 123-45-67890)';
        }

        if (!formData.email.trim()) {
            newErrors.email = '이메일을 입력해주세요.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = '올바른 이메일 형식으로 입력해주세요.';
        }

        // 파일 첨부는 선택 사항 (2025-12-03 수정)
        // 필요 시 아래 주석을 해제하여 필수로 변경 가능
        // if (formData.files.length === 0) {
        //     newErrors.files = '사업자등록증 등 증빙 파일을 1개 이상 첨부해주세요.';
        // }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // 폼 제출 핸들러
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            if (isEditMode && onEdit && editData) {
                // 수정 모드
                await onEdit(editData.id, {
                    name: formData.name,
                    address: formData.address,
                    businessNumber: formData.businessNumber,
                    email: formData.email,
                    phoneNumber: formData.phoneNumber,
                    website: formData.website,
                });
            } else {
                // 등록 모드
                await onSubmit(formData);
                // 등록 모드에서 선택한 프로필 이미지가 있으면 로그 (추후 등록 후 업로드로 확장 가능)
                if (profileImage) {
                    console.log('프로필 이미지 선택됨 (등록 후 업로드 필요):', profileImage.name);
                }
            }
        } catch {
            // 에러 처리는 부모 컴포넌트에서 처리
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            ref={modalRef}
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 헤더 */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                            <Building className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        </div>
                        <h2 id={titleId} className="text-xl font-bold text-slate-900 dark:text-white">
                            {isEditMode ? '기관 수정' : '기관 등록'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        aria-label="닫기"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* 폼 */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-180px)]">
                    {/* 프로필 이미지 (작성일: 2025-12-03) */}
                    <div className="flex justify-center">
                        <div className="relative">
                            <div 
                                className={`w-24 h-24 rounded-full overflow-hidden border-2 border-dashed ${
                                    profileImagePreview 
                                        ? 'border-primary-500' 
                                        : 'border-slate-300 dark:border-slate-600'
                                } bg-slate-100 dark:bg-slate-700 flex items-center justify-center cursor-pointer hover:border-primary-400 transition-colors`}
                                onClick={() => profileInputRef.current?.click()}
                            >
                                {isUploadingProfile ? (
                                    <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                                ) : profileImagePreview ? (
                                    <img 
                                        src={profileImagePreview} 
                                        alt="기관 프로필" 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <User className="w-10 h-10 text-slate-400" />
                                )}
                            </div>
                            
                            {/* 프로필 이미지 변경/삭제 버튼 */}
                            <div className="absolute -bottom-1 -right-1 flex gap-1">
                                <button
                                    type="button"
                                    onClick={() => profileInputRef.current?.click()}
                                    disabled={isUploadingProfile}
                                    className="w-7 h-7 rounded-full bg-primary-500 hover:bg-primary-600 text-white flex items-center justify-center shadow-md transition-colors disabled:opacity-50"
                                    title="이미지 변경"
                                >
                                    <Camera className="w-3.5 h-3.5" />
                                </button>
                                {profileImagePreview && (
                                    <button
                                        type="button"
                                        onClick={handleProfileImageDelete}
                                        disabled={isUploadingProfile}
                                        className="w-7 h-7 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-md transition-colors disabled:opacity-50"
                                        title="이미지 삭제"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                            
                            {/* 숨겨진 파일 입력 */}
                            <input
                                ref={profileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/gif,image/webp"
                                className="hidden"
                                onChange={handleProfileImageChange}
                            />
                        </div>
                    </div>
                    <p className="text-center text-xs text-slate-500 dark:text-slate-400 -mt-2">
                        기관 프로필 이미지 (선택)
                    </p>

                    {/* 기관명 */}
                    <div>
                        <label htmlFor="academy-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            기관명 <span className="text-red-500">*</span>
                        </label>
                        <input
                            ref={firstInputRef}
                            type="text"
                            id="academy-name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="예: 소프트캠퍼스"
                            className={`w-full px-4 py-2.5 rounded-lg border ${
                                errors.name 
                                    ? 'border-red-500 focus:ring-red-500' 
                                    : 'border-slate-200 dark:border-slate-600 focus:border-primary-500 focus:ring-primary-500'
                            } dark:bg-slate-700 dark:text-white outline-none transition-colors focus:ring-2`}
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                        )}
                    </div>

                    {/* 주소 */}
                    <div>
                        <label htmlFor="academy-address" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            주소 <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="academy-address"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            placeholder="예: 서울시 강남구 테헤란로 123"
                            className={`w-full px-4 py-2.5 rounded-lg border ${
                                errors.address 
                                    ? 'border-red-500 focus:ring-red-500' 
                                    : 'border-slate-200 dark:border-slate-600 focus:border-primary-500 focus:ring-primary-500'
                            } dark:bg-slate-700 dark:text-white outline-none transition-colors focus:ring-2`}
                        />
                        {errors.address && (
                            <p className="mt-1 text-sm text-red-500">{errors.address}</p>
                        )}
                    </div>

                    {/* 사업자등록번호 */}
                    <div>
                        <label htmlFor="academy-businessNumber" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            사업자등록번호 <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="academy-businessNumber"
                            name="businessNumber"
                            value={formData.businessNumber}
                            onChange={handleInputChange}
                            placeholder="123-45-67890"
                            maxLength={12}
                            className={`w-full px-4 py-2.5 rounded-lg border ${
                                errors.businessNumber 
                                    ? 'border-red-500 focus:ring-red-500' 
                                    : 'border-slate-200 dark:border-slate-600 focus:border-primary-500 focus:ring-primary-500'
                            } dark:bg-slate-700 dark:text-white outline-none transition-colors focus:ring-2`}
                        />
                        {errors.businessNumber && (
                            <p className="mt-1 text-sm text-red-500">{errors.businessNumber}</p>
                        )}
                    </div>

                    {/* 이메일 */}
                    <div>
                        <label htmlFor="academy-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            이메일 <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            id="academy-email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="contact@example.com"
                            className={`w-full px-4 py-2.5 rounded-lg border ${
                                errors.email 
                                    ? 'border-red-500 focus:ring-red-500' 
                                    : 'border-slate-200 dark:border-slate-600 focus:border-primary-500 focus:ring-primary-500'
                            } dark:bg-slate-700 dark:text-white outline-none transition-colors focus:ring-2`}
                        />
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                        )}
                    </div>

                    {/* 전화번호 */}
                    <div>
                        <label htmlFor="academy-phoneNumber" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            전화번호
                        </label>
                        <input
                            type="text"
                            id="academy-phoneNumber"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            placeholder="02-1234-5678"
                            maxLength={13}
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 focus:border-primary-500 focus:ring-primary-500 dark:bg-slate-700 dark:text-white outline-none transition-colors focus:ring-2"
                        />
                    </div>

                    {/* 홈페이지 주소 */}
                    <div>
                        <label htmlFor="academy-website" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            홈페이지 주소
                        </label>
                        <input
                            type="url"
                            id="academy-website"
                            name="website"
                            value={formData.website}
                            onChange={handleInputChange}
                            placeholder="https://www.example.com"
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 focus:border-primary-500 focus:ring-primary-500 dark:bg-slate-700 dark:text-white outline-none transition-colors focus:ring-2"
                        />
                    </div>

                    {/* 첨부파일 */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            첨부파일
                            <span className="font-normal text-slate-500 dark:text-slate-400 ml-2">
                                (사업자등록증, 교육기관 인증서 등 - 선택사항)
                            </span>
                        </label>

                        {/* 수정 모드: 기존 파일 안내 메시지 */}
                        {isEditMode && (
                            <p className="text-xs text-amber-600 dark:text-amber-400 mb-2">
                                ※ 수정 시 새 파일을 추가하면 기존 파일과 함께 저장됩니다.
                            </p>
                        )}

                        {/* 파일 업로드 영역 */}
                        <label
                            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                                errors.files
                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
                                    : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                        >
                            <div className="flex flex-col items-center justify-center py-4">
                                <Upload className="w-8 h-8 text-slate-400 mb-2" />
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    클릭하여 파일 선택
                                </p>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                    PDF, JPG, PNG (최대 10MB)
                                </p>
                            </div>
                            <input
                                type="file"
                                className="hidden"
                                multiple
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={handleFileChange}
                            />
                        </label>
                        {errors.files && (
                            <p className="mt-1 text-sm text-red-500">{errors.files}</p>
                        )}

                        {/* 업로드된 파일 목록 */}
                        {formData.files.length > 0 && (
                            <div className="mt-3 space-y-2">
                                {formData.files.map((file, index) => {
                                    const isImage = file.type.startsWith('image/');
                                    const previewUrl = isImage ? URL.createObjectURL(file) : null;
                                    
                                    return (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600"
                                        >
                                            <div className="flex items-center gap-2 min-w-0">
                                                {/* 이미지 미리보기 또는 파일 아이콘 */}
                                                {isImage && previewUrl ? (
                                                    <img 
                                                        src={previewUrl} 
                                                        alt={file.name}
                                                        className="w-10 h-10 rounded object-cover shrink-0 border border-slate-200 dark:border-slate-600"
                                                        onLoad={() => URL.revokeObjectURL(previewUrl)}
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded bg-slate-200 dark:bg-slate-600 flex items-center justify-center shrink-0">
                                                        <FileText className="w-5 h-5 text-slate-400" />
                                                    </div>
                                                )}
                                                <div className="min-w-0">
                                                    <span className="text-sm text-slate-700 dark:text-slate-300 truncate block">
                                                        {file.name}
                                                    </span>
                                                    <span className="text-xs text-slate-400">
                                                        {(file.size / 1024).toFixed(1)} KB
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0">
                                                {/* 이미지 미리보기 버튼 */}
                                                {isImage && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const url = URL.createObjectURL(file);
                                                            setPreviewFile({ url, name: file.name, type: file.type });
                                                        }}
                                                        className="p-1.5 text-slate-400 hover:text-primary-500 transition-colors"
                                                        title="미리보기"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => handleFileRemove(index)}
                                                    className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                                                    aria-label={`${file.name} 삭제`}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </form>

                {/* 첨부파일 미리보기 모달 */}
                {previewFile && (
                    <div 
                        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
                        onClick={() => {
                            URL.revokeObjectURL(previewFile.url);
                            setPreviewFile(null);
                        }}
                    >
                        <div 
                            className="relative max-w-4xl max-h-[90vh] bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                                <div className="flex items-center gap-2">
                                    <Image className="w-5 h-5 text-slate-400" />
                                    <span className="font-medium text-slate-900 dark:text-white truncate max-w-[300px]">
                                        {previewFile.name}
                                    </span>
                                </div>
                                <button
                                    onClick={() => {
                                        URL.revokeObjectURL(previewFile.url);
                                        setPreviewFile(null);
                                    }}
                                    className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-4 flex items-center justify-center max-h-[calc(90vh-80px)] overflow-auto">
                                <img 
                                    src={previewFile.url} 
                                    alt={previewFile.name}
                                    className="max-w-full max-h-[70vh] object-contain rounded-lg"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* 푸터 (버튼) */}
                <div className="flex justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="px-4 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                        취소
                    </button>
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                {isEditMode ? '수정 중...' : '등록 중...'}
                            </>
                        ) : (
                            isEditMode ? '수정' : '등록'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AcademyCreateModal;
