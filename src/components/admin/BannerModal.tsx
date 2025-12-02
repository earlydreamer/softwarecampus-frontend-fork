import type * as React from 'react';
import { useState, useEffect, useRef, useId } from 'react';
import { X, Edit2, Upload } from 'lucide-react';
import type { BannerData } from '../../types';
import AlertModal from '../ui/AlertModal';

export interface BannerFormState extends Partial<BannerData> {
    imageFile?: File;
}

interface BannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: BannerFormState) => void;
    initialData?: BannerData | null;
}

const BannerModal: React.FC<BannerModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialData
}) => {
    const titleId = useId();
    const modalRef = useRef<HTMLDivElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);

    const [form, setForm] = useState<BannerFormState>({
        title: '',
        description: '',
        imageUrl: '',
        linkUrl: '',
        isActive: true
    });

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

    // blob URL을 추적하기 위한 ref
    const blobUrlRef = useRef<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            // 모달이 열릴 때 현재 포커스된 요소 저장
            previousFocusRef.current = document.activeElement as HTMLElement;

            // 모달 내부로 포커스 이동 (접근성)
            const timer = setTimeout(() => {
                modalRef.current?.focus();
            }, 0);

            if (initialData) {
                setForm({ ...initialData });
            } else {
                setForm({
                    title: '',
                    description: '',
                    imageUrl: '',
                    linkUrl: '',
                    isActive: true
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
    }, [isOpen, initialData, onClose]);

    // Cleanup blob URL on unmount only
    useEffect(() => {
        return () => {
            // unmount 시에만 ref에 저장된 blob URL revoke
            if (blobUrlRef.current) {
                URL.revokeObjectURL(blobUrlRef.current);
                blobUrlRef.current = null;
            }
        };
    }, []); // 빈 배열: unmount 시에만 실행

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // 파일 유효성 검사 (헬퍼 함수 사용)
            const validationError = validateImageFile(file);
            if (validationError) {
                showErrorModal(validationError);
                e.target.value = '';
                return;
            }

            // 이전 blob URL이 있으면 revoke (ref에 저장된 것만)
            if (blobUrlRef.current) {
                URL.revokeObjectURL(blobUrlRef.current);
            }

            const imageUrl = URL.createObjectURL(file);
            blobUrlRef.current = imageUrl; // ref에 새 blob URL 저장

            setForm(prev => ({
                ...prev,
                imageFile: file,
                imageUrl: imageUrl
            }));
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) {
            // 파일 유효성 검사 (헬퍼 함수 사용)
            const validationError = validateImageFile(file);
            if (validationError) {
                showErrorModal(validationError);
                return;
            }

            // 이전 blob URL이 있으면 revoke (ref에 저장된 것만)
            if (blobUrlRef.current) {
                URL.revokeObjectURL(blobUrlRef.current);
            }

            const imageUrl = URL.createObjectURL(file);
            blobUrlRef.current = imageUrl; // ref에 새 blob URL 저장

            setForm(prev => ({
                ...prev,
                imageFile: file,
                imageUrl: imageUrl
            }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(form);
    };

    if (!isOpen) return null;

    const isEditing = !!initialData;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            ref={modalRef}
            tabIndex={-1}
        >
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700">
                    <h3
                        id={titleId}
                        className="text-lg font-bold text-slate-900 dark:text-white"
                    >
                        {isEditing ? '배너 수정' : '배너 추가'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                        aria-label="배너 등록 모달 닫기"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* 배너 이미지 업로드 영역 */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            배너 이미지
                        </label>
                        <div
                            className={`relative w-full h-48 rounded-xl border-2 border-dashed transition-colors flex flex-col items-center justify-center cursor-pointer overflow-hidden ${form.imageUrl
                                ? 'border-primary-500 bg-slate-50'
                                : 'border-slate-300 hover:border-primary-400 bg-slate-50 hover:bg-slate-100'
                                }`}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById('banner-image-input')?.click()}
                        >
                            {form.imageUrl ? (
                                <>
                                    <img
                                        src={form.imageUrl}
                                        alt="배너 이미지 미리보기"
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
                                        클릭하여 업로드하거나 이미지를 드래그하세요
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        권장 사이즈: 1920x600 (JPG, PNG)
                                    </p>
                                </div>
                            )}
                            <input
                                id="banner-image-input"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            제목
                        </label>
                        <input
                            type="text"
                            value={form.title || ''}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary-500 outline-none"
                            placeholder="배너 제목을 입력하세요"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            설명
                        </label>
                        <input
                            type="text"
                            value={form.description || ''}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary-500 outline-none"
                            placeholder="배너 설명을 입력하세요"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            링크 URL
                        </label>
                        <input
                            type="text"
                            value={form.linkUrl || ''}
                            onChange={e => setForm({ ...form, linkUrl: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary-500 outline-none"
                            placeholder="/lectures 또는 https://..."
                            required
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={form.isActive || false}
                            onChange={e => setForm({ ...form, isActive: e.target.checked })}
                            className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                        />
                        <label htmlFor="isActive" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            활성 상태로 등록
                        </label>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
                        >
                            {isEditing ? '수정 완료' : '배너 추가'}
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

export default BannerModal;
