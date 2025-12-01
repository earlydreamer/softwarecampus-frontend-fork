import { useEffect, useRef, useId } from 'react';
import { AlertCircle, CheckCircle, XCircle, Info } from 'lucide-react';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type?: AlertType;
}

const AlertModal = ({ isOpen, onClose, title, message, type = 'info' }: AlertModalProps) => {
    const titleId = useId();
    const descriptionId = useId();
    const modalRef = useRef<HTMLDivElement>(null);
    const closeBtnRef = useRef<HTMLButtonElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);

    const iconConfig = {
        success: {
            Icon: CheckCircle,
            bgColor: 'bg-green-100 dark:bg-green-900/30',
            iconColor: 'text-green-600 dark:text-green-400',
            btnColor: 'bg-green-600 hover:bg-green-700'
        },
        error: {
            Icon: XCircle,
            bgColor: 'bg-red-100 dark:bg-red-900/30',
            iconColor: 'text-red-600 dark:text-red-400',
            btnColor: 'bg-red-600 hover:bg-red-700'
        },
        warning: {
            Icon: AlertCircle,
            bgColor: 'bg-amber-100 dark:bg-amber-900/30',
            iconColor: 'text-amber-600 dark:text-amber-400',
            btnColor: 'bg-amber-600 hover:bg-amber-700'
        },
        info: {
            Icon: Info,
            bgColor: 'bg-blue-100 dark:bg-blue-900/30',
            iconColor: 'text-blue-600 dark:text-blue-400',
            btnColor: 'bg-blue-600 hover:bg-blue-700'
        }
    };

    const { Icon, bgColor, iconColor, btnColor } = iconConfig[type];

    useEffect(() => {
        if (isOpen) {
            // 이전 포커스 저장
            previousFocusRef.current = document.activeElement as HTMLElement;

            // 배경 콘텐츠 비활성화 (스크린 리더 및 키보드 접근 차단)
            const mainContent = document.getElementById('root');
            if (mainContent) {
                mainContent.setAttribute('aria-hidden', 'true');
                // mainContent.style.pointerEvents = 'none'; // 모달이 root 안에 있으면 모달도 클릭 불가능해짐
            }

            // 초기 포커스 설정
            const timer = setTimeout(() => {
                closeBtnRef.current?.focus();
            }, 0);

            /**
             * 모달 내부의 포커스 가능한 요소 찾기
             */
            const getFocusableElements = (): HTMLElement[] => {
                if (!modalRef.current) return [];

                const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
                const elements = Array.from(
                    modalRef.current.querySelectorAll<HTMLElement>(focusableSelectors)
                );

                return elements.filter(el => !el.hasAttribute('disabled') && el.offsetParent !== null);
            };

            /**
             * 포커스 트랩: Tab/Shift+Tab 처리
             */
            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Escape') {
                    e.preventDefault();
                    onClose();
                    return;
                }

                if (e.key === 'Tab') {
                    const focusableElements = getFocusableElements();
                    if (focusableElements.length === 0) return;

                    const firstElement = focusableElements[0];
                    const lastElement = focusableElements[focusableElements.length - 1];

                    if (e.shiftKey) {
                        // Shift+Tab: 첫 번째 요소에서 마지막 요소로 순환
                        if (document.activeElement === firstElement) {
                            e.preventDefault();
                            lastElement.focus();
                        }
                    } else {
                        // Tab: 마지막 요소에서 첫 번째 요소로 순환
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

                // 배경 콘텐츠 복원
                if (mainContent) {
                    mainContent.removeAttribute('aria-hidden');
                    // mainContent.style.pointerEvents = '';
                }

                // 이전 포커스 복원
                previousFocusRef.current?.focus();
            };
        }
    }, [isOpen, onClose]);

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
                        <div className={`w-12 h-12 rounded-full ${bgColor} flex items-center justify-center`}>
                            <Icon className={`w-6 h-6 ${iconColor}`} />
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
                        className="text-slate-600 dark:text-slate-300 mb-6 whitespace-pre-line"
                    >
                        {message}
                    </p>
                    <div className="flex justify-end">
                        <button
                            type="button"
                            ref={closeBtnRef}
                            onClick={onClose}
                            className={`px-6 py-2 ${btnColor} text-white rounded-lg font-medium transition-colors`}
                        >
                            확인
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AlertModal;
