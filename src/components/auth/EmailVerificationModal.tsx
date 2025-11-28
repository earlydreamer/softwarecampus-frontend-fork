import { useState, useEffect, useRef } from 'react';
import { X, Mail, Timer, AlertCircle, CheckCircle, RefreshCw, AlertTriangle } from 'lucide-react';

interface EmailVerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    email: string;
    onVerified: () => void;
}

type Step = 'SEND' | 'VERIFY';

const EmailVerificationModal = ({ isOpen, onClose, email, onVerified }: EmailVerificationModalProps) => {
    const [step, setStep] = useState<Step>('SEND');
    const [code, setCode] = useState('');
    const [timeLeft, setTimeLeft] = useState(180); // 3분
    const [resendCooldown, setResendCooldown] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [attempts, setAttempts] = useState(0);

    const inputRef = useRef<HTMLInputElement>(null);

    // 모달 초기화
    useEffect(() => {
        if (isOpen) {
            setStep('SEND');
            setCode('');
            setError('');
            setAttempts(0);
        }
    }, [isOpen]);

    // 타이머 로직
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isOpen && step === 'VERIFY' && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isOpen, step, timeLeft]);

    // 재발송 쿨다운 로직
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isOpen && resendCooldown > 0) {
            timer = setInterval(() => {
                setResendCooldown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isOpen, resendCooldown]);

    // 포커스 관리
    useEffect(() => {
        if (isOpen && step === 'VERIFY') {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [isOpen, step]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const handleSendCode = async () => {
        setIsLoading(true);
        setError('');

        try {
            // TODO: API 연동 (POST /api/auth/email/send-verification)
            console.log(`[DEV] Sending verification code to ${email}`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay

            setStep('VERIFY');
            setTimeLeft(180);
            setResendCooldown(30);
            setAttempts(prev => prev + 1);
        } catch (err) {
            setError('인증 코드 발송에 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify = async () => {
        if (code.length !== 6) {
            setError('6자리 인증 코드를 입력해주세요.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // TODO: API 연동 (POST /api/auth/email/verify)
            console.log(`[DEV] Verifying code ${code} for ${email}`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay

            // Mock 성공 처리
            onVerified();
            onClose();
        } catch (err) {
            setError('인증 코드가 일치하지 않습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* 헤더 */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Mail className="w-5 h-5 text-primary-600" />
                        이메일 인증
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
                    >
                        <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                    </button>
                </div>

                {/* 컨텐츠 */}
                <div className="p-6">
                    {step === 'SEND' ? (
                        <div className="text-center space-y-6">
                            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto">
                                <Mail className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                            </div>
                            <div>
                                <p className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                                    인증 코드를 발송합니다
                                </p>
                                <p className="text-slate-600 dark:text-slate-400">
                                    <span className="font-bold text-slate-900 dark:text-white">{email}</span>
                                    <br />
                                    위 이메일 주소로 6자리 인증 코드가 발송됩니다.
                                </p>
                            </div>

                            {/* 주의사항 박스 */}
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 text-left">
                                <div className="flex items-start gap-2">
                                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                                    <div className="text-base text-amber-800 dark:text-amber-300 space-y-1">
                                        <p className="font-semibold">주의사항</p>
                                        <ul className="list-disc list-inside space-y-1 text-sm opacity-90">
                                            <li>인증 코드는 3분간 유효합니다.</li>
                                            <li>최대 5회까지 시도 가능합니다.</li>
                                            <li>5회 초과 실패 시 30분간 인증이 차단됩니다.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleSendCode}
                                disabled={isLoading}
                                className="w-full py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        발송 중...
                                    </>
                                ) : (
                                    '인증 코드 발송'
                                )}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="text-center">
                                <p className="text-slate-600 dark:text-slate-400 mb-1">
                                    이메일로 전송된 인증 코드를 입력해주세요
                                </p>
                                <div className="flex items-center justify-center gap-2 text-lg font-medium">
                                    <Timer className="w-5 h-5 text-slate-400" />
                                    <span className={timeLeft < 60 ? 'text-red-500' : 'text-primary-600'}>
                                        남은 시간: {formatTime(timeLeft)}
                                    </span>
                                </div>
                            </div>

                            <div className="relative">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                                    className="w-full px-4 py-4 text-center text-2xl tracking-[0.5em] font-bold border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                                    placeholder="000000"
                                    disabled={isLoading || timeLeft === 0}
                                />
                            </div>

                            {error && (
                                <div className="flex items-center justify-center gap-2 text-red-600 dark:text-red-400 text-sm">
                                    <AlertCircle className="w-4 h-4" />
                                    {error}
                                </div>
                            )}

                            <button
                                onClick={handleVerify}
                                disabled={isLoading || code.length !== 6 || timeLeft === 0}
                                className="w-full py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        확인 중...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        인증 확인
                                    </>
                                )}
                            </button>

                            <div className="text-center">
                                <p className="text-base text-slate-500 dark:text-slate-400 mb-2">
                                    인증 코드를 받지 못하셨나요?
                                </p>
                                <button
                                    onClick={handleSendCode}
                                    disabled={resendCooldown > 0 || isLoading}
                                    className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline disabled:opacity-50 disabled:no-underline flex items-center justify-center gap-1 mx-auto"
                                >
                                    <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                                    {resendCooldown > 0 
                                        ? `${resendCooldown}초 후 재발송 가능` 
                                        : '인증 코드 재발송'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmailVerificationModal;
