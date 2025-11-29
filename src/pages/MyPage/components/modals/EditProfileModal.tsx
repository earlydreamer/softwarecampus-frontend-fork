import { useForm } from 'react-hook-form';
import { Lock } from 'lucide-react';
import Modal from '../../../../components/ui/Modal';
import type { UpdateProfileData } from '../../../../services/mypageService';
import type { Account } from '../../../../types';
import { useEffect } from 'react';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: Account;
    onSubmit: (data: UpdateProfileData) => void;
    isPending: boolean;
    onPasswordChangeClick: () => void;
}

const EditProfileModal = ({ isOpen, onClose, user, onSubmit, isPending, onPasswordChangeClick }: EditProfileModalProps) => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<UpdateProfileData>();

    useEffect(() => {
        if (user && isOpen) {
            reset({
                userName: user.userName,
                phoneNumber: user.phoneNumber,
                address: user.address || '',
                affiliation: user.affiliation || '',
                position: user.position || ''
            });
        }
    }, [user, isOpen, reset]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="프로필 수정"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">이름</label>
                    <input
                        {...register('userName', { required: '이름을 입력해주세요' })}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                    />
                    {errors.userName && <p className="text-red-500 text-xs mt-1">{errors.userName.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">전화번호</label>
                    <input
                        {...register('phoneNumber', { required: '전화번호를 입력해주세요' })}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                    />
                    {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">주소</label>
                    <input
                        {...register('address')}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">소속</label>
                    <input
                        {...register('affiliation')}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">직책</label>
                    <input
                        {...register('position')}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                    />
                </div>

                <div className="pt-2">
                    <button
                        type="button"
                        onClick={onPasswordChangeClick}
                        className="w-full py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 transition flex items-center justify-center gap-2"
                    >
                        <Lock className="w-4 h-4" />
                        비밀번호 변경
                    </button>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                    >
                        취소
                    </button>
                    <button
                        type="submit"
                        disabled={isPending}
                        className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50"
                    >
                        {isPending ? '저장 중...' : '저장'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default EditProfileModal;
