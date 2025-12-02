import { useForm } from 'react-hook-form';
import { Lock, Camera } from 'lucide-react';
import Modal from '../../../../components/ui/Modal';
import { type UpdateProfileData, uploadFile } from '../../../../services/mypageService';
import type { Account } from '../../../../types';
import { useEffect, useState, useRef } from 'react';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: Account;
    onSubmit: (data: UpdateProfileData) => void;
    isPending: boolean;
    onPasswordChangeClick: () => void;
}

const EditProfileModal = ({ isOpen, onClose, user, onSubmit, isPending, onPasswordChangeClick }: EditProfileModalProps) => {
    const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm<UpdateProfileData>();
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user && isOpen) {
            reset({
                userName: user.userName,
                phoneNumber: user.phoneNumber,
                address: user.address || '',
                affiliation: user.affiliation || '',
                position: user.position || '',
                profileImage: user.profileImage
            });
            setPreviewImage(user.profileImage || null);
        }
    }, [user, isOpen, reset]);

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // 파일 타입 검증
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            alert('JPG, PNG, GIF, WEBP 형식의 이미지만 업로드 가능합니다.');
            return;
        }

        // 파일 크기 검증 (10MB)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            alert('이미지 크기는 10MB 이하여야 합니다.');
            return;
        }

        try {
            setIsUploading(true);
            const imageUrl = await uploadFile(file, 'profile', 'PROFILE');
            setPreviewImage(imageUrl);
            setValue('profileImage', imageUrl);
        } catch (error) {
            console.error('Failed to upload image:', error);
            alert('이미지 업로드에 실패했습니다.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="프로필 수정"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="flex justify-center mb-6">
                    <div 
                        role="button"
                        tabIndex={0}
                        aria-label="프로필 이미지 변경"
                        className="relative group cursor-pointer" 
                        onClick={handleImageClick}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleImageClick();
                            }
                        }}
                    >
                        <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center border-2 border-slate-100 dark:border-slate-600">
                            {previewImage ? (
                                <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-3xl font-bold text-slate-400">
                                    {user.userName.charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>
                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="w-8 h-8 text-white" />
                        </div>
                        {isUploading && (
                            <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            </div>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            aria-label="프로필 이미지 파일 선택"
                            onChange={handleFileChange}
                        />
                    </div>
                </div>

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
