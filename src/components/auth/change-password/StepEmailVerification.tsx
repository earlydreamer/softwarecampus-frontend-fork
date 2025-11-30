import { Mail, AlertCircle } from 'lucide-react';

interface StepEmailVerificationProps {
    email: string;
    verificationCode: string;
    timer: number;
    isLoading: boolean;
    error: string | null;
    onCodeChange: (code: string) => void;
    onResend: () => Promise<void>;
    onVerify: () => void;
    onClose: () => void;
}

const StepEmailVerification = ({
    email,
    verificationCode,
    timer,
    isLoading,
    error,
    onCodeChange,
    onResend,
    onVerify,
    onClose,
}: StepEmailVerificationProps) => {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onCodeChange(e.target.value.replace(/\D/g, ''));
    };

    return (
        <div className="space-y-4">
            <div className="text-center mb-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">이메일 인증</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    <span className="font-medium text-primary-600">{email}</span>으로<br />
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
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-3 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 text-center text-xl tracking-widest font-mono"
                    placeholder="000000"
                    aria-label="6자리 인증 코드"
                />
            </div>

            <div className="flex items-center justify-between">
                <span className={`text-sm ${timer > 0 ? 'text-slate-600 dark:text-slate-400' : 'text-red-500'}`}>
                    ⏱️ {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')} 
                    {timer === 0 && ' (만료됨)'}
                </span>
                <button
                    type="button"
                    onClick={onResend}
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
                    onClick={onClose}
                    className="flex-1 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                >
                    취소
                </button>
                <button
                    type="button"
                    onClick={onVerify}
                    disabled={verificationCode.length !== 6}
                    className="flex-1 py-2.5 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 transition"
                >
                    확인
                </button>
            </div>
        </div>
    );
};

export default StepEmailVerification;
