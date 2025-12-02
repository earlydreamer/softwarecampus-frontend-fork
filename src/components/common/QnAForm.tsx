import { useState } from 'react';
import TiptapEditor from '../editor/TiptapEditor';
import AlertModal from '../ui/AlertModal';

interface QnAFormProps {
    onSubmit: (title: string, content: string) => void;
    onCancel: () => void;
}

const QnAForm = ({ onSubmit, onCancel }: QnAFormProps) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [alertModal, setAlertModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'success' | 'warning' | 'error' | 'info';
    }>({ isOpen: false, title: '', message: '', type: 'info' });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            setAlertModal({
                isOpen: true,
                title: '입력 오류',
                message: '제목과 내용을 모두 입력해주세요.',
                type: 'warning'
            });
            return;
        }
        onSubmit(title, content);
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
                        제목
                    </label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                        placeholder="질문 제목을 입력하세요"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        내용
                    </label>
                    <TiptapEditor content={content} onChange={setContent} />
                </div>
                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                    >
                        취소
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                    >
                        등록하기
                    </button>
                </div>
            </form>

            {/* Alert Modal */}
            <AlertModal
                isOpen={alertModal.isOpen}
                onClose={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
                title={alertModal.title}
                message={alertModal.message}
                type={alertModal.type}
            />
        </>
    );
};

export default QnAForm;
