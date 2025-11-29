import { AlertTriangle } from 'lucide-react';
import Modal from '../../../../components/ui/Modal';

interface DeleteAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isPending: boolean;
}

const DeleteAccountModal = ({ isOpen, onClose, onConfirm, isPending }: DeleteAccountModalProps) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="회원 탈퇴"
        >
            <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">
                    <AlertTriangle className="w-6 h-6 shrink-0" />
                    <p className="text-sm font-medium">
                        탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다. 정말로 탈퇴하시겠습니까?
                    </p>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                    >
                        취소
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isPending}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                        {isPending ? '처리 중...' : '탈퇴하기'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default DeleteAccountModal;
