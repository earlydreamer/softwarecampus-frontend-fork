import { useState, useEffect, useRef, useId } from 'react';
import { createPortal } from 'react-dom';
import { X, Link as LinkIcon, Check, Copy } from 'lucide-react';
import AlertModal from './AlertModal';

interface ShareModalProps {
    url: string;
    title: string;
    onClose: () => void;
}

const ShareModal = ({ url, title, onClose }: ShareModalProps) => {
    const [copied, setCopied] = useState(false);
    const [alertModal, setAlertModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'success' | 'warning' | 'error' | 'info';
    }>({ isOpen: false, title: '', message: '', type: 'info' });
    const titleId = useId();
    const modalRef = useRef<HTMLDivElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);

    // 포커스 관리 및 키보드 핸들링
    useEffect(() => {
        // 이전 포커스 저장
        previousFocusRef.current = document.activeElement as HTMLElement;

        // 모달 내부로 포커스 이동
        const timer = setTimeout(() => {
            modalRef.current?.focus();
        }, 0);

        const handleKeyDown = (e: KeyboardEvent) => {
            // Escape 키 처리
            if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
                return;
            }

            // Tab 키로 포커스 트랩
            if (e.key === 'Tab' && modalRef.current) {
                const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );

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
            // 포커스 복원
            previousFocusRef.current?.focus();
        };
    }, [onClose]);

    // copied 상태가 true가 되면 2초 후 자동으로 false로 리셋
    useEffect(() => {
        if (!copied) return;

        const timer = setTimeout(() => {
            setCopied(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, [copied]);

    const handleCopyLink = async () => {
        // Clipboard API 지원 여부 확인
        if (!navigator.clipboard) {
            setAlertModal({
                isOpen: true,
                title: '지원되지 않는 기능',
                message: '이 브라우저는 클립보드 복사를 지원하지 않습니다.',
                type: 'warning'
            });
            return;
        }

        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
            console.error('Failed to copy link:', errorMessage);
            setAlertModal({
                isOpen: true,
                title: '복사 실패',
                message: '링크 복사에 실패했습니다.',
                type: 'error'
            });
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 헤더 */}
                <div className="flex items-center justify-between mb-6">
                    <h3 id={titleId} className="text-xl font-bold text-slate-900 dark:text-white">공유하기</h3>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
                        aria-label="닫기"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* 과정 제목 */}
                <div className="mb-6">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">공유할 과정</p>
                    <p className="text-base font-medium text-slate-900 dark:text-white">{title}</p>
                </div>

                {/* 링크 복사 */}
                <div className="mb-6">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                        링크
                    </label>
                    <div className="flex gap-2">
                        <div className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-600 dark:text-slate-400 overflow-x-auto">
                            {url}
                        </div>
                        <button
                            onClick={handleCopyLink}
                            className={`px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-2 whitespace-nowrap ${copied
                                    ? 'bg-green-500 text-white'
                                    : 'bg-primary-600 hover:bg-primary-700 text-white'
                                }`}
                            aria-label="링크 복사"
                        >
                            {copied ? (
                                <>
                                    <Check className="w-4 h-4" />
                                    복사됨
                                </>
                            ) : (
                                <>
                                    <Copy className="w-4 h-4" />
                                    복사
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* SNS 공유 버튼 */}
                <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                        SNS로 공유
                    </p>
                    <div className="grid grid-cols-4 gap-3">
                        <button
                            onClick={() => {
                                const win = window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                                if (win) win.opener = null;
                            }}
                            className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                            aria-label="페이스북 공유"
                        >
                            <div className="w-12 h-12 rounded-full bg-[#1877F2] flex items-center justify-center text-white">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                            </div>
                            <span className="text-xs text-slate-600 dark:text-slate-400">페이스북</span>
                        </button>
                        <button
                            onClick={() => {
                                const win = window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
                                if (win) win.opener = null;
                            }}
                            className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                            aria-label="트위터 공유"
                        >
                            <div className="w-12 h-12 rounded-full bg-[#1DA1F2] flex items-center justify-center text-white">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                                </svg>
                            </div>
                            <span className="text-xs text-slate-600 dark:text-slate-400">트위터</span>
                        </button>
                        <button
                            onClick={() => {
                                const win = window.open(`https://telegram.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
                                if (win) win.opener = null;
                            }}
                            className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                            aria-label="텔레그램 공유"
                        >
                            <div className="w-12 h-12 rounded-full bg-[#0088cc] flex items-center justify-center text-white">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                                </svg>
                            </div>
                            <span className="text-xs text-slate-600 dark:text-slate-400">텔레그램</span>
                        </button>
                        <button
                            onClick={handleCopyLink}
                            className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                            aria-label="링크 복사"
                        >
                            <div className="w-12 h-12 rounded-full bg-slate-600 flex items-center justify-center text-white">
                                <LinkIcon className="w-6 h-6" />
                            </div>
                            <span className="text-xs text-slate-600 dark:text-slate-400">링크</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Alert Modal - Portal로 document.body에 렌더링하여 z-index 스택킹 컨텍스트 문제 해결 */}
            {createPortal(
                <AlertModal
                    isOpen={alertModal.isOpen}
                    onClose={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
                    title={alertModal.title}
                    message={alertModal.message}
                    type={alertModal.type}
                />,
                document.body
            )}
        </div>
    );
};

export default ShareModal;
