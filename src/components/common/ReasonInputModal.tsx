import { useState, useEffect, useRef, useId } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ReasonInputModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    title: string;
    message: string;
    placeholder?: string;
    confirmText?: string;
    cancelText?: string;
}

/**
 * 거부 사유 등 텍스트 입력이 필요한 확인 모달
 * window.prompt() 대체용 커스텀 모달 컴포넌트
 */
const ReasonInputModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    placeholder = '사유를 입력하세요',
    confirmText = '확인',
    cancelText = '취소'
}: ReasonInputModalProps) => {
    const titleId = useId();
    const descriptionId = useId();
    const modalRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);

    const [reason, setReason] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            // 모달이 열릴 때 현재 포커스된 요소 저장
            previousFocusRef.current = document.activeElement as HTMLElement;

            // 입력 필드에 초기 포커스 설정
            const timer = setTimeout(() => {
                inputRef.current?.focus();
            }, 0);

            // 상태 초기화
            setReason('');
            setError(null);

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
    }, [isOpen, onClose]);

    const handleConfirm = () => {
        const trimmedReason = reason.trim();
        if (!trimmedReason) {
            setError('사유를 입력해주세요.');
            inputRef.current?.focus();
            return;
        }
        onConfirm(trimmedReason);
        setReason('');
        setError(null);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // Ctrl+Enter로 제출
        if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            handleConfirm();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            ref={modalRef}
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                            <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <h3
                            id={titleId}
                            className="text-lg font-bold text-slate-900 dark:text-white"
                        >
                            {title}
                        </h3>
                    </div>
                    <p
                        id={descriptionId}
                        className="text-slate-600 dark:text-slate-300 mb-4"
                    >
                        {message}
                    </p>
                    <div className="mb-4">
                        <textarea
                            ref={inputRef}
                            value={reason}
                            onChange={(e) => {
                                setReason(e.target.value);
                                if (error) setError(null);
                            }}
                            onKeyDown={handleKeyPress}
                            placeholder={placeholder}
                            className={`w-full px-4 py-3 rounded-lg border ${
                                error 
                                    ? 'border-red-500 focus:ring-red-500' 
                                    : 'border-slate-200 dark:border-slate-700 focus:ring-primary-500'
                            } bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 outline-none transition-colors resize-none`}
                            rows={3}
                        />
                        {error && (
                            <p className="mt-1 text-sm text-red-500">{error}</p>
                        )}
                        <p className="mt-1 text-xs text-slate-400">Ctrl + Enter로 제출</p>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors"
                        >
                            {cancelText}
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirm}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReasonInputModal;
