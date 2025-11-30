import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { Eye, EyeOff, Mail, ShieldCheck, AlertCircle } from 'lucide-react';
import type { Step1FormData } from './useChangePassword';

interface StepVerifyPasswordProps {
    form: UseFormReturn<Step1FormData>;
    isLoading: boolean;
    error: string | null;
    onSubmit: (data: Step1FormData) => Promise<void>;
    onClose: () => void;
}

const StepVerifyPassword = ({
    form,
    isLoading,
    error,
    onSubmit,
    onClose,
}: StepVerifyPasswordProps) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="text-center mb-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">본인 확인</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    비밀번호를 변경하려면 현재 비밀번호를 입력 후<br />
                    이메일 인증을 진행해주세요.
                </p>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    현재 비밀번호
                </label>
                <div className="relative">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        {...form.register('currentPassword', {
                            required: '현재 비밀번호를 입력해주세요'
                        })}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 pr-10 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                        placeholder="현재 비밀번호 입력"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                    >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>
                {form.formState.errors.currentPassword && (
                    <p className="text-red-500 text-xs mt-1">{form.formState.errors.currentPassword.message}</p>
                )}
            </div>

            {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
            )}

            <button
                type="submit"
                disabled={isLoading || !form.formState.isValid}
                className="w-full py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
            >
                <Mail className="w-5 h-5" />
                {isLoading ? '인증 코드 발송 중...' : '이메일 인증'}
            </button>

            <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            >
                취소
            </button>
        </form>
    );
};

export default StepVerifyPassword;
