import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import type { Step3FormData } from './useChangePassword';

interface PasswordChecks {
    length: boolean;
    letter: boolean;
    number: boolean;
    special: boolean;
}

interface StepNewPasswordProps {
    form: UseFormReturn<Step3FormData>;
    newPassword: string;
    passwordChecks: PasswordChecks;
    isLoading: boolean;
    error: string | null;
    onSubmit: (data: Step3FormData) => Promise<void>;
    onClose: () => void;
}

const StepNewPassword = ({
    form,
    newPassword,
    passwordChecks,
    isLoading,
    error,
    onSubmit,
    onClose,
}: StepNewPasswordProps) => {
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                        {...form.register('newPassword', {
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
                        aria-label={showNewPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
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
                
                {form.formState.errors.newPassword && (
                    <p className="text-red-500 text-xs mt-1">{form.formState.errors.newPassword.message}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    새 비밀번호 확인
                </label>
                <div className="relative">
                    <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        {...form.register('confirmPassword', {
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
                        aria-label={showConfirmPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                    >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>
                {form.formState.errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">{form.formState.errors.confirmPassword.message}</p>
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
                    onClick={onClose}
                    className="flex-1 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                >
                    취소
                </button>
                <button
                    type="submit"
                    disabled={isLoading || !form.formState.isValid}
                    className="flex-1 py-2.5 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 transition"
                >
                    {isLoading ? '변경 중...' : '변경 완료'}
                </button>
            </div>
        </form>
    );
};

export default StepNewPassword;
