import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import Modal from '../ui/Modal';
import { updatePassword } from '../../services/mypageService';

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ChangePasswordModal = ({ isOpen, onClose }: ChangePasswordModalProps) => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, watch, formState: { errors }, reset } = useForm({
        mode: 'onChange'
    });

    const newPassword = watch('newPassword');

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        try {
            await updatePassword(data.newPassword);
            setIsSuccess(true);
            setTimeout(() => {
                onClose();
                setIsSuccess(false);
                reset();
            }, 2000);
        } catch (error) {
            console.error(error);
            // Handle error
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <Modal isOpen={isOpen} onClose={onClose} title="비밀번호 변경">
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
        <Modal isOpen={isOpen} onClose={onClose} title="새 비밀번호 설정">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        새 비밀번호
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            {...register('newPassword', {
                                required: '새 비밀번호를 입력해주세요',
                                minLength: {
                                    value: 8,
                                    message: '비밀번호는 8자 이상이어야 합니다'
                                },
                                pattern: {
                                    value: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
                                    message: '영문, 숫자, 특수문자를 포함해야 합니다'
                                }
                            })}
                            className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 pr-10 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                            placeholder="새 비밀번호 입력"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    {errors.newPassword && (
                        <p className="text-red-500 text-xs mt-1">{errors.newPassword.message as string}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        새 비밀번호 확인
                    </label>
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            {...register('confirmPassword', {
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
                    {errors.confirmPassword && (
                        <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message as string}</p>
                    )}
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-2.5 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
                    >
                        {isLoading ? '변경 중...' : '비밀번호 변경'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default ChangePasswordModal;
