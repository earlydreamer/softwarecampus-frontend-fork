import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Lock, Eye, EyeOff, CheckCircle, Mail, ShieldCheck, AlertCircle } from 'lucide-react';
import Modal from '../ui/Modal';
import { verifyCurrentPassword, sendPasswordChangeCode, changePassword } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type Step = 1 | 2 | 3;

const ChangePasswordModal = ({ isOpen, onClose }: ChangePasswordModalProps) => {
    // 상태 관리
    const [step, setStep] = useState<Step>(1);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [timer, setTimer] = useState(180); // 3분
    const [verificationCode, setVerificationCode] = useState('');
    
    const { user } = useAuthStore();

    // Step 1: 현재 비밀번호 폼
    const step1Form = useForm({
        mode: 'onChange',
        defaultValues: { currentPassword: '' }
    });

    // Step 3: 새 비밀번호 폼
    const step3Form = useForm({
        mode: 'onChange',
        defaultValues: { newPassword: '', confirmPassword: '' }
    });

    const newPassword = step3Form.watch('newPassword');

    // 타이머 로직
    useEffect(() => {
        if (step === 2 && timer > 0) {
            const interval = setInterval(() => setTimer(t => t - 1), 1000);
            return () => clearInterval(interval);
        }
    }, [step, timer]);

    // 모달 닫기 시 상태 초기화
    const handleClose = () => {
        setStep(1);
        setError(null);
        setVerificationCode('');
        setTimer(180);
        setIsSuccess(false);
        step1Form.reset();
        step3Form.reset();
        onClose();
    };

    // Step 1: 현재 비밀번호 확인
    const handleVerifyPassword = async (data: { currentPassword: string }) => {
        setIsLoading(true);
        setError(null);
        try {
            await verifyCurrentPassword(data.currentPassword);
            // 성공 시 즉시 이메일 인증 코드 발송
            if (user?.email) {
                await sendPasswordChangeCode(user.email);
                setTimer(180);
                setStep(2);
            }
        } catch (err: any) {
            const errorMsg = err.response?.data?.detail || '비밀번호 확인에 실패했습니다.';
            setError(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    // Step 2: 인증 코드 재발송
    const handleResendCode = async () => {
        if (!user?.email) return;
        setIsLoading(true);
        setError(null);
        try {
            await sendPasswordChangeCode(user.email);
            setTimer(180);
        } catch (err: any) {
            setError(err.response?.data?.detail || '재발송에 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    // Step 2 → Step 3 진행
    const handleVerifyCode = () => {
        if (verificationCode.length === 6) {
            setError(null);
            setStep(3);
        }
    };

    // Step 3: 최종 비밀번호 변경
    const handleChangePassword = async (data: { newPassword: string; confirmPassword: string }) => {
        if (data.newPassword !== data.confirmPassword) {
            setError('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            await changePassword(verificationCode, data.newPassword);
            setIsSuccess(true);
            setTimeout(() => {
                handleClose();
            }, 2000);
        } catch (err: any) {
            const errorMsg = err.response?.data?.detail || '비밀번호 변경에 실패했습니다.';
            if (errorMsg.includes('만료')) {
                setStep(2);
                setTimer(0);
            }
            setError(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    // 비밀번호 강도 체크
    const passwordChecks = {
        length: (newPassword?.length || 0) >= 8,
        letter: /[A-Za-z]/.test(newPassword || ''),
        number: /\d/.test(newPassword || ''),
        special: /[!@#$%^&*()\-_=+[\]{}|;:'",.<>/?~]/.test(newPassword || ''),
    };

    // 성공 화면
    if (isSuccess) {
        return (
            <Modal isOpen={isOpen} onClose={handleClose} title="비밀번호 변경">
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">변경 완료!</h3>
                    <p className="text-slate-600 dark:text-slate-400">
                        비밀번호가 성공적으로 변경되었습니다.
                    </p>
                </div>
            </Modal>
        );
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="비밀번호 변경">
            {/* Step Indicator */}
            <div className="flex justify-center mb-6">
                <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 1 ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                        1
                    </div>
                    <div className={`w-12 h-1 ${step >= 2 ? 'bg-primary-600' : 'bg-slate-200'}`} />
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 2 ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                        2
                    </div>
                    <div className={`w-12 h-1 ${step >= 3 ? 'bg-primary-600' : 'bg-slate-200'}`} />
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 3 ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                        3
                    </div>
                </div>
            </div>

            {/* Step 1: 현재 비밀번호 확인 */}
            {step === 1 && (
                <form onSubmit={step1Form.handleSubmit(handleVerifyPassword)} className="space-y-4">
                    <div className="text-center mb-4">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                            <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">본인 확인</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            비밀번호를 변경하려면 현재 비밀번호를 입력해주세요.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            현재 비밀번호
                        </label>
                        <div className="relative">
                            <input
                                type={showCurrentPassword ? 'text' : 'password'}
                                {...step1Form.register('currentPassword', {
                                    required: '현재 비밀번호를 입력해주세요'
                                })}
                                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 pr-10 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                                placeholder="현재 비밀번호 입력"
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {step1Form.formState.errors.currentPassword && (
                            <p className="text-red-500 text-xs mt-1">{step1Form.formState.errors.currentPassword.message}</p>
                        )}
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <AlertCircle className="w-4 h-4 text-red-500" />
                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !step1Form.formState.isValid}
                            className="flex-1 py-2.5 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 transition"
                        >
                            {isLoading ? '확인 중...' : '확인'}
                        </button>
                    </div>
                </form>
            )}

            {/* Step 2: 이메일 인증 */}
            {step === 2 && (
                <div className="space-y-4">
                    <div className="text-center mb-4">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">이메일 인증</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            <span className="font-medium text-primary-600">{user?.email}</span>으로<br />
                            인증 코드를 발송했습니다.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            인증 코드 (6자리)
                        </label>
                        <input
                            type="text"
                            maxLength={6}
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                            className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-3 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 text-center text-xl tracking-widest font-mono"
                            placeholder="000000"
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <span className={`text-sm ${timer > 0 ? 'text-slate-600 dark:text-slate-400' : 'text-red-500'}`}>
                            ⏱️ {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')} 
                            {timer === 0 && ' (만료됨)'}
                        </span>
                        <button
                            type="button"
                            onClick={handleResendCode}
                            disabled={timer > 0 || isLoading}
                            className="text-sm text-primary-600 hover:text-primary-700 disabled:text-slate-400 disabled:cursor-not-allowed font-medium"
                        >
                            {isLoading ? '발송 중...' : '재발송'}
                        </button>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <AlertCircle className="w-4 h-4 text-red-500" />
                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                        >
                            취소
                        </button>
                        <button
                            type="button"
                            onClick={handleVerifyCode}
                            disabled={verificationCode.length !== 6}
                            className="flex-1 py-2.5 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 transition"
                        >
                            확인
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: 새 비밀번호 설정 */}
            {step === 3 && (
                <form onSubmit={step3Form.handleSubmit(handleChangePassword)} className="space-y-4">
                    <div className="text-center mb-4">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Lock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">새 비밀번호 설정</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            새로운 비밀번호를 입력해주세요.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            새 비밀번호
                        </label>
                        <div className="relative">
                            <input
                                type={showNewPassword ? 'text' : 'password'}
                                {...step3Form.register('newPassword', {
                                    required: '새 비밀번호를 입력해주세요',
                                    minLength: {
                                        value: 8,
                                        message: '비밀번호는 8자 이상이어야 합니다'
                                    },
                                    pattern: {
                                        value: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+[\]{}|;:'",.<>/?~])[A-Za-z\d!@#$%^&*()\-_=+[\]{}|;:'",.<>/?~]{8,20}$/,
                                        message: '영문, 숫자, 특수문자를 포함해야 합니다'
                                    }
                                })}
                                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 pr-10 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                                placeholder="새 비밀번호 입력"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        
                        {/* 비밀번호 강도 체크 */}
                        <div className="flex flex-wrap gap-2 mt-2">
                            <span className={`text-xs px-2 py-0.5 rounded ${passwordChecks.length ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}`}>
                                ✓ 8자 이상
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded ${passwordChecks.letter ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}`}>
                                ✓ 영문
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded ${passwordChecks.number ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}`}>
                                ✓ 숫자
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded ${passwordChecks.special ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}`}>
                                ✓ 특수문자
                            </span>
                        </div>
                        
                        {step3Form.formState.errors.newPassword && (
                            <p className="text-red-500 text-xs mt-1">{step3Form.formState.errors.newPassword.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            새 비밀번호 확인
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                {...step3Form.register('confirmPassword', {
                                    required: '비밀번호를 다시 입력해주세요',
                                    validate: (value) => value === newPassword || '비밀번호가 일치하지 않습니다'
                                })}
                                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 pr-10 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                                placeholder="새 비밀번호 재입력"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {step3Form.formState.errors.confirmPassword && (
                            <p className="text-red-500 text-xs mt-1">{step3Form.formState.errors.confirmPassword.message}</p>
                        )}
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <AlertCircle className="w-4 h-4 text-red-500" />
                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !step3Form.formState.isValid}
                            className="flex-1 py-2.5 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 transition"
                        >
                            {isLoading ? '변경 중...' : '변경 완료'}
                        </button>
                    </div>
                </form>
            )}
        </Modal>
    );
};

export default ChangePasswordModal;
