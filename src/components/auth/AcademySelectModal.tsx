import { useState, useEffect } from 'react';
import { X, Search, Building2, MapPin, Phone, Mail } from 'lucide-react';
import type { Academy } from '../../types';
import { mockAcademies } from '../../services/mockAcademyData';

interface AcademySelectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (academy: Academy) => void;
}

const AcademySelectModal = ({ isOpen, onClose, onSelect }: AcademySelectModalProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showRegisterForm, setShowRegisterForm] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [filePreviewUrls, setFilePreviewUrls] = useState<{ [key: number]: string }>({});
    const [isDragging, setIsDragging] = useState(false);

    // 모달 열릴 때 body 스크롤 방지
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            setShowRegisterForm(false);
            setSearchTerm('');
            setUploadedFiles([]);
            setFilePreviewUrls({});
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Escape 키로 모달 닫기
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const filteredAcademies = mockAcademies.filter((academy) =>
        academy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (academy.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        academy.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (academy: Academy) => {
        onSelect(academy);
        onClose();
    };

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            const startIndex = uploadedFiles.length;

            newFiles.forEach((file, index) => {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        setFilePreviewUrls(prev => ({
                            ...prev,
                            [startIndex + index]: reader.result as string
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
            const newFiles = Array.from(e.dataTransfer.files);
            const startIndex = uploadedFiles.length;

            newFiles.forEach((file, index) => {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        setFilePreviewUrls(prev => ({
                            ...prev,
                            [startIndex + index]: reader.result as string
                        }));
                    };
                    reader.readAsDataURL(file);
                }
            });

            setUploadedFiles(prev => [...prev, ...newFiles]);
        }
    };

    const handleRemoveFile = (index: number) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
        setFilePreviewUrls(prev => {
            const newUrls = { ...prev };
            delete newUrls[index];
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
        >
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col">
                {/* 헤더 */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
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
                                        {uploadedFiles.map((file, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700"
                                            >
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    {/* 이미지 미리보기 또는 파일 아이콘 */}
                                                    {isImageFile(file) && filePreviewUrls[index] ? (
                                                        <img
                                                            src={filePreviewUrls[index]}
                                                            alt={file.name}
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
                                                            {file.name}
                                                        </p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                                            {formatFileSize(file.size)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveFile(index)}
                                                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition"
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
                            {filteredAcademies.length === 0 ? (
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
                                    onClick={() => {
                                        alert('목업: 기관 등록 요청이 제출되었습니다.');
                                        onClose();
                                    }}
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
        </div>
    );
};

export default AcademySelectModal;
