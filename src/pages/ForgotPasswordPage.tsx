import { useState, useId } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, Mail, KeyRound, CheckCircle, ArrowLeft } from 'lucide-react';
import { sendPasswordResetCode, verifyPasswordResetCode } from '../services/authService';
import apiClient from '../services/api/client';
import { validatePassword, PASSWORD_MIN_LENGTH } from '../utils/validation';

type Step = 'email' | 'verify' | 'newPassword' | 'complete';

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<Step>('email');
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const emailId = useId();
    const codeId = useId();
    const newPasswordId = useId();
    const confirmPasswordId = useId();

    // Step 1: 이메일 입력 후 인증 코드 발송
    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await sendPasswordResetCode(email);
            setStep('verify');
        } catch (err: unknown) {
            // 보안상 이메일 존재 여부를 노출하지 않음
            // 실제로는 존재하지 않아도 "발송했습니다" 메시지 표시
            const error = err as { response?: { data?: { message?: string } } };
            if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else {
                setStep('verify'); // 에러가 나도 다음 단계로 (보안)
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Step 2: 인증 코드 확인
    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await verifyPasswordResetCode(email, code);
            setStep('newPassword');
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || '인증 코드가 올바르지 않습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    // Step 3: 새 비밀번호 설정
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // 비밀번호 유효성 검사 (유틸리티 함수 사용)
        const validation = validatePassword(newPassword, confirmPassword);
        if (!validation.isValid) {
            setError(validation.error!);
            return;
        }

        setIsLoading(true);

        try {
            // 비밀번호 재설정 API 호출
            await apiClient.post('/api/auth/reset-password', {
                email,
                code,
                newPassword
            });
            setStep('complete');
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || '비밀번호 변경에 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    // 인증 코드 재발송
    const handleResendCode = async () => {
        setError('');
        setIsLoading(true);
        try {
            await sendPasswordResetCode(email);
            setError(''); // 에러 초기화
            alert('인증 코드가 재발송되었습니다.');
        } catch {
            setError('인증 코드 발송에 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 py-20">
            <div className="glass-panel p-8 rounded-2xl w-full max-w-md">
                {/* 헤더 */}
                <div className="mb-8">
                    <Link 
                        to="/login" 
                        className="inline-flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        로그인으로 돌아가기
                    </Link>
                    <h1 className="text-3xl font-bold text-center text-slate-900 dark:text-white">
                        비밀번호 찾기
                    </h1>
                    <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-2">
                        {step === 'email' && '가입한 이메일 주소를 입력해주세요.'}
                        {step === 'verify' && '이메일로 발송된 인증 코드를 입력해주세요.'}
                        {step === 'newPassword' && '새로운 비밀번호를 설정해주세요.'}
                        {step === 'complete' && '비밀번호가 성공적으로 변경되었습니다.'}
                    </p>
                </div>

                {/* 진행 상태 표시 */}
                {step !== 'complete' && (
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                            step === 'email' ? 'bg-primary-600 text-white' : 'bg-primary-100 text-primary-600 dark:bg-primary-900/30'
                        }`}>
                            1
                        </div>
                        <div className={`w-12 h-1 ${step !== 'email' ? 'bg-primary-600' : 'bg-slate-200 dark:bg-slate-700'}`} />
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                            step === 'verify' ? 'bg-primary-600 text-white' : 
                            step === 'newPassword' ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30' : 
                            'bg-slate-200 text-slate-400 dark:bg-slate-700'
                        }`}>
                            2
                        </div>
                        <div className={`w-12 h-1 ${step === 'newPassword' ? 'bg-primary-600' : 'bg-slate-200 dark:bg-slate-700'}`} />
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                            step === 'newPassword' ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-400 dark:bg-slate-700'
                        }`}>
                            3
                        </div>
                    </div>
                )}

                {/* 에러 메시지 */}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-400 text-sm">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Step 1: 이메일 입력 */}
                {step === 'email' && (
                    <form onSubmit={handleSendCode} className="space-y-6">
                        <div>
                            <label htmlFor={emailId} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                이메일
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="email"
                                    id={emailId}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                    placeholder="가입한 이메일 주소"
                                    required
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading || !email}
                            className="w-full btn-primary py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? '발송 중...' : '인증 코드 발송'}
                        </button>
                    </form>
                )}

                {/* Step 2: 인증 코드 확인 */}
                {step === 'verify' && (
                    <form onSubmit={handleVerifyCode} className="space-y-6">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <p className="text-sm text-blue-700 dark:text-blue-400">
                                <strong>{email}</strong>로 인증 코드가 발송되었습니다.
                            </p>
                        </div>
                        <div>
                            <label htmlFor={codeId} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                인증 코드
                            </label>
                            <input
                                type="text"
                                id={codeId}
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-center text-xl tracking-widest"
                                placeholder="000000"
                                maxLength={6}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading || code.length !== 6}
                            className="w-full btn-primary py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? '확인 중...' : '인증 확인'}
                        </button>
                        <div className="text-center">
                            <button
                                type="button"
                                onClick={handleResendCode}
                                disabled={isLoading}
                                className="text-sm text-primary-600 dark:text-primary-400 hover:underline disabled:opacity-50"
                            >
                                인증 코드 재발송
                            </button>
                        </div>
                    </form>
                )}

                {/* Step 3: 새 비밀번호 설정 */}
                {step === 'newPassword' && (
                    <form onSubmit={handleResetPassword} className="space-y-6">
                        <div>
                            <label htmlFor={newPasswordId} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                새 비밀번호
                            </label>
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="password"
                                    id={newPasswordId}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                    placeholder="8자 이상 입력"
                                    minLength={8}
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor={confirmPasswordId} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                비밀번호 확인
                            </label>
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="password"
                                    id={confirmPasswordId}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                    placeholder="비밀번호 재입력"
                                    minLength={8}
                                    required
                                />
                            </div>
                            {confirmPassword && newPassword !== confirmPassword && (
                                <p className="mt-1 text-xs text-red-500">비밀번호가 일치하지 않습니다.</p>
                            )}
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading || newPassword.length < PASSWORD_MIN_LENGTH || newPassword !== confirmPassword}
                            className="w-full btn-primary py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? '변경 중...' : '비밀번호 변경'}
                        </button>
                    </form>
                )}

                {/* Step 4: 완료 */}
                {step === 'complete' && (
                    <div className="text-center space-y-6">
                        <div className="flex justify-center">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                비밀번호 변경 완료
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                새로운 비밀번호로 로그인해주세요.
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full btn-primary py-3 rounded-lg"
                        >
                            로그인하기
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
