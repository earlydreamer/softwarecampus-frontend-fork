import type * as React from 'react';
import { useState, useEffect, useRef, useId } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Search, Building2, MapPin, Phone, Mail } from 'lucide-react';
import type { Academy } from '../../types';
import { getApprovedAcademies, createAcademy } from '../../services/academyService';
import AlertModal from '../ui/AlertModal';

interface AcademySelectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (academy: Academy) => void;
}

const AcademySelectModal = ({ isOpen, onClose, onSelect }: AcademySelectModalProps) => {
    const titleId = useId();
    const modalRef = useRef<HTMLDivElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [showRegisterForm, setShowRegisterForm] = useState(false);
    const [alertModal, setAlertModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'success' | 'warning' | 'error' | 'info';
        onCloseCallback?: () => void;
    }>({ isOpen: false, title: '', message: '', type: 'info' });

    // useQuery로 아카데미 목록 가져오기
    const { data: academies = [], isLoading, isError } = useQuery({
        queryKey: ['approvedAcademies'],
        queryFn: () => getApprovedAcademies(true),
        enabled: isOpen,
    });

    // Registration Form State
    const [regName, setRegName] = useState('');
    const [regBusinessNumber, setRegBusinessNumber] = useState('');
    const [regAddress, setRegAddress] = useState('');
    const [regEmail, setRegEmail] = useState('');

    interface UploadedFile {
        id: string;
        file: File;
    }

    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [filePreviewUrls, setFilePreviewUrls] = useState<{ [key: string]: string }>({});
    const [isDragging, setIsDragging] = useState(false);

    // 모달 열릴 때 body 스크롤 방지 및 포커스 관리
    useEffect(() => {
        if (isOpen) {
            // 이전 포커스 저장
            previousFocusRef.current = document.activeElement as HTMLElement;
            document.body.style.overflow = 'hidden';

            // 모달 내부로 포커스 이동
            const timer = setTimeout(() => {
                modalRef.current?.focus();
            }, 0);

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
                document.body.style.overflow = 'unset';
                // 포커스 복원
                previousFocusRef.current?.focus();
            };
        } else {
            document.body.style.overflow = 'unset';
            setShowRegisterForm(false);
            setSearchTerm('');
            setUploadedFiles([]);
            setFilePreviewUrls({});
            // Reset form
            setRegName('');
            setRegBusinessNumber('');
            setRegAddress('');
            setRegEmail('');
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const filteredAcademies = academies.filter((academy) =>
        academy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (academy.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        academy.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (academy: Academy) => {
        onSelect(academy);
        onClose();
    };

    const handleRegister = async () => {
        if (!regName || !regBusinessNumber || !regAddress || !regEmail) {
            setAlertModal({
                isOpen: true,
                title: '입력 오류',
                message: '모든 필수 정보를 입력해주세요.',
                type: 'warning'
            });
            return;
        }

        if (uploadedFiles.length === 0) {
            setAlertModal({
                isOpen: true,
                title: '파일 필요',
                message: '사업자등록증 파일을 첨부해주세요.',
                type: 'warning'
            });
            return;
        }

        // 사업자등록번호 형식 검증 (xxx-xx-xxxxx)
        const businessNumberRegex = /^\d{3}-\d{2}-\d{5}$/;
        if (!businessNumberRegex.test(regBusinessNumber)) {
            setAlertModal({
                isOpen: true,
                title: '형식 오류',
                message: '사업자등록번호 형식이 올바르지 않습니다.\n(예: 123-45-67890)',
                type: 'warning'
            });
            return;
        }

        try {
            const formData = new FormData();
            formData.append('name', regName);
            formData.append('businessNumber', regBusinessNumber);
            formData.append('address', regAddress);
            formData.append('email', regEmail);
            
            // 모든 첨부 파일 추가
            uploadedFiles.forEach(({ file }) => {
                formData.append('files', file);
            });

            await createAcademy(formData);
            
            setAlertModal({
                isOpen: true,
                title: '등록 요청 완료',
                message: '기관 등록 요청이 성공적으로 제출되었습니다.\n관리자 승인 후 이메일로 결과를 알려드립니다.',
                type: 'success',
                onCloseCallback: onClose
            });
        } catch (error) {
            console.error('Registration failed:', error);
            setAlertModal({
                isOpen: true,
                title: '등록 실패',
                message: '기관 등록 요청 중 오류가 발생했습니다.',
                type: 'error'
            });
        }
    };

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files).map(file => ({
                id: Math.random().toString(36).substr(2, 9),
                file
            }));

            newFiles.forEach(({ id, file }) => {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        setFilePreviewUrls(prev => ({
                            ...prev,
                            [id]: reader.result as string
                        }));
                    };
                    reader.readAsDataURL(file);
                }
            });

            setUploadedFiles(prev => [...prev, ...newFiles]);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files) {
            const newFiles = Array.from(e.dataTransfer.files).map(file => ({
                id: Math.random().toString(36).substr(2, 9),
                file
            }));

            newFiles.forEach(({ id, file }) => {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        setFilePreviewUrls(prev => ({
                            ...prev,
                            [id]: reader.result as string
                        }));
                    };
                    reader.readAsDataURL(file);
                }
            });

            setUploadedFiles(prev => [...prev, ...newFiles]);
        }
    };

    const handleRemoveFile = (id: string) => {
        setUploadedFiles(prev => prev.filter(item => item.id !== id));
        setFilePreviewUrls(prev => {
            const newUrls = { ...prev };
            delete newUrls[id];
            return newUrls;
        });
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const isImageFile = (file: File): boolean => {
        return file.type.startsWith('image/');
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleBackdropClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            ref={modalRef}
            tabIndex={-1}
        >
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col">
                {/* 헤더 */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                    <div>
                        <h2
                            id={titleId}
                            className="text-2xl font-bold text-slate-900 dark:text-white"
                        >
                            {showRegisterForm ? '기관 등록 요청' : '소속 기관 선택'}
                        </h2>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            {showRegisterForm
                                ? '소속된 교육기관 정보를 입력해주세요'
                                : '소속된 교육기관을 선택해주세요'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
                        aria-label="모달 닫기"
                    >
                        <X className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                    </button>
                </div>

                {showRegisterForm ? (
                    /* 기관 등록 폼 */
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="max-w-2xl mx-auto space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    기관명 *
                                </label>
                                <input
                                    type="text"
                                    value={regName}
                                    onChange={(e) => setRegName(e.target.value)}
                                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                                    placeholder="교육기관 이름"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    사업자등록번호 *
                                </label>
                                <input
                                    type="text"
                                    value={regBusinessNumber}
                                    onChange={(e) => setRegBusinessNumber(e.target.value)}
                                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                                    placeholder="000-00-00000"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    주소 *
                                </label>
                                <input
                                    type="text"
                                    value={regAddress}
                                    onChange={(e) => setRegAddress(e.target.value)}
                                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                                    placeholder="서울시 강남구..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    이메일 *
                                </label>
                                <input
                                    type="email"
                                    value={regEmail}
                                    onChange={(e) => setRegEmail(e.target.value)}
                                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                                    placeholder="info@academy.com"
                                />
                            </div>

                            {/* 첨부파일 */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    첨부파일 * (사업자등록증, 교육기관 인증서 등)
                                </label>

                                {/* 파일 업로드 영역 */}
                                <div
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    className={`border-2 border-dashed rounded-lg p-6 text-center transition ${isDragging
                                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                        : 'border-slate-300 dark:border-slate-600 hover:border-primary-400'
                                        }`}
                                >
                                    <input
                                        type="file"
                                        id="file-upload"
                                        multiple
                                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                    <label
                                        htmlFor="file-upload"
                                        className="cursor-pointer flex flex-col items-center gap-2"
                                    >
                                        <svg
                                            className="w-12 h-12 text-slate-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                            />
                                        </svg>
                                        <div>
                                            <span className="text-primary-600 dark:text-primary-400 font-semibold">
                                                파일 선택
                                            </span>
                                            <span className="text-slate-600 dark:text-slate-400"> 또는 드래그 앤 드롭</span>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            PDF, JPG, PNG, DOC (최대 10MB)
                                        </p>
                                    </label>
                                </div>

                                {/* 업로드된 파일 목록 */}
                                {uploadedFiles.length > 0 && (
                                    <div className="mt-4 space-y-2">
                                        {uploadedFiles.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700"
                                            >
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    {/* 이미지 미리보기 또는 파일 아이콘 */}
                                                    {isImageFile(item.file) && filePreviewUrls[item.id] ? (
                                                        <img
                                                            src={filePreviewUrls[item.id]}
                                                            alt={item.file.name}
                                                            className="w-16 h-16 object-cover rounded-md flex-shrink-0 border border-slate-200 dark:border-slate-600"
                                                        />
                                                    ) : (
                                                        <svg
                                                            className="w-8 h-8 text-slate-400 flex-shrink-0"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                            />
                                                        </svg>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                                            {item.file.name}
                                                        </p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                                            {formatFileSize(item.file.size)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveFile(item.id)}
                                                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition"
                                                    aria-label={`${item.file.name} 파일 삭제`}
                                                >
                                                    <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm text-blue-900 dark:text-blue-300">
                                <p className="font-semibold mb-1">안내사항</p>
                                <p>등록 요청은 관리자 승인 후 처리됩니다. 승인까지 1~2영업일이 소요될 수 있습니다.</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* 검색 */}
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="기관명, 주소, 설명으로 검색..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-slate-900 dark:text-white outline-none"
                                />
                            </div>
                        </div>

                        {/* 기관 목록 */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {isLoading ? (
                                <div className="text-center py-12">
                                    <p className="text-slate-600 dark:text-slate-400">로딩 중...</p>
                                </div>
                            ) : isError ? (
                                <div className="text-center py-12">
                                    <Building2 className="w-16 h-16 mx-auto text-red-300 dark:text-red-600 mb-4" />
                                    <p className="text-red-600 dark:text-red-400 mb-2">데이터를 불러오는데 실패했습니다</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-500">
                                        잠시 후 다시 시도해주세요
                                    </p>
                                </div>
                            ) : filteredAcademies.length === 0 ? (
                                <div className="text-center py-12">
                                    <Building2 className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                                    <p className="text-slate-600 dark:text-slate-400 mb-2">검색 결과가 없습니다</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-500">
                                        다른 검색어를 입력해보세요
                                    </p>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {filteredAcademies.map((academy) => (
                                        <button
                                            key={academy.id}
                                            onClick={() => handleSelect(academy)}
                                            className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-primary-500 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition text-left group"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="w-20 h-20 bg-slate-200 dark:bg-slate-700 rounded-lg flex-shrink-0 flex items-center justify-center">
                                                    <Building2 className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2 mb-2">
                                                        <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-primary-600 transition">
                                                            {academy.name}
                                                        </h3>
                                                        {academy.rating && (
                                                            <div className="flex items-center gap-1 text-sm flex-shrink-0">
                                                                <span className="text-yellow-500">★</span>
                                                                <span className="font-medium text-slate-900 dark:text-white">
                                                                    {academy.rating.toFixed(1)}
                                                                </span>
                                                                <span className="text-slate-400">({academy.reviewCount})</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                                                        {academy.description}
                                                    </p>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-500 dark:text-slate-400">
                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="w-4 h-4 flex-shrink-0" />
                                                            <span className="truncate">{academy.address}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Phone className="w-4 h-4 flex-shrink-0" />
                                                            <span>{academy.phone}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Mail className="w-4 h-4 flex-shrink-0" />
                                                            <span className="truncate">{academy.email}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1.5 mt-3">
                                                        {academy.fields?.slice(0, 3).map((field, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="px-2 py-1 bg-primary-600/10 text-primary-600 text-xs rounded-md"
                                                            >
                                                                {field}
                                                            </span>
                                                        ))}
                                                        {(academy.fields?.length ?? 0) > 3 && (
                                                            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs rounded-md">
                                                                +{(academy.fields?.length ?? 0) - 3}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* 푸터 */}
                <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-b-2xl">
                    <div className="flex items-center justify-between">
                        {showRegisterForm ? (
                            <>
                                <button
                                    onClick={() => setShowRegisterForm(false)}
                                    className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition font-medium text-sm"
                                >
                                    ← 목록으로 돌아가기
                                </button>
                                <button
                                    onClick={handleRegister}
                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium text-sm"
                                >
                                    등록 요청
                                </button>
                            </>
                        ) : (
                            <>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    찾으시는 기관이 없나요?
                                </p>
                                <button
                                    onClick={() => setShowRegisterForm(true)}
                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium text-sm"
                                >
                                    기관 등록하기
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Alert Modal */}
            <AlertModal
                isOpen={alertModal.isOpen}
                onClose={() => {
                    setAlertModal(prev => ({ ...prev, isOpen: false }));
                    alertModal.onCloseCallback?.();
                }}
                title={alertModal.title}
                message={alertModal.message}
                type={alertModal.type}
            />
        </div>
    );
};

export default AcademySelectModal;
