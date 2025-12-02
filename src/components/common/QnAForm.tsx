import { useState } from 'react';
import TiptapEditor from '../editor/TiptapEditor';
import type { AttachedFile } from '../editor/TiptapEditor';
import AlertModal from '../ui/AlertModal';

interface QnAFormProps {
    onSubmit: (title: string, content: string, fileDetails: { id: number; originName: string; fileUrl: string }[]) => void;
    onCancel: () => void;
    onFileUpload?: (file: File) => Promise<{ id: number; originName: string; fileUrl: string }>;
}

const QnAForm = ({ onSubmit, onCancel, onFileUpload }: QnAFormProps) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
    // 실제 서버에 업로드된 파일의 정보 매핑 (임시 ID -> 서버 파일 정보)
    const [uploadedFileMap, setUploadedFileMap] = useState<Record<string, { id: number; originName: string; fileUrl: string }>>({});

    const [alertModal, setAlertModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'success' | 'warning' | 'error' | 'info';
    }>({ isOpen: false, title: '', message: '', type: 'info' });

    const handleFilesChange = async (files: AttachedFile[]) => {
        if (!onFileUpload) return;

        // 새로 추가된 파일 찾기 (아직 업로드되지 않은 파일)
        const newFiles = files.filter(f => !attachedFiles.find(prev => prev.id === f.id));

        // 삭제된 파일 처리
        const removedFiles = attachedFiles.filter(prev => !files.find(curr => curr.id === prev.id));
        if (removedFiles.length > 0) {
            setUploadedFileMap(prevMap => {
                const newMap = { ...prevMap };
                removedFiles.forEach(f => {
                    delete newMap[f.id];
                });
                return newMap;
            });
        }

        // 상태 업데이트 (UI 반영)
        setAttachedFiles(files);

        // 새 파일 병렬 업로드 (Promise.allSettled로 성능 개선)
        if (newFiles.length > 0) {
            const uploadResults = await Promise.allSettled(
                newFiles.filter((file) => file.file !== undefined).map(async (file) => {
                    const result = await onFileUpload(file.file!);
                    return { file, result };
                })
            );

            uploadResults.forEach((outcome) => {
                if (outcome.status === 'fulfilled') {
                    const { file, result } = outcome.value;
                    setUploadedFileMap(prev => ({
                        ...prev,
                        [file.id]: result
                    }));
                } else {
                    // 실패한 파일 처리
                    console.error('File upload failed:', outcome.reason);
                    // 실패한 파일 정보를 추출하기 어려우므로 일반 에러 메시지 표시
                    setAlertModal({
                        isOpen: true,
                        title: '업로드 실패',
                        message: '일부 파일 업로드에 실패했습니다.',
                        type: 'error'
                    });
                }
            });

            // 실패한 파일들 제거 (업로드되지 않은 파일)
            const failedFileIds = uploadResults
                .map((outcome, index) => outcome.status === 'rejected' ? newFiles[index].id : null)
                .filter((id): id is string => id !== null);

            if (failedFileIds.length > 0) {
                setAttachedFiles(prev => prev.filter(f => !failedFileIds.includes(f.id)));
            }
        }
    };

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

        // 현재 첨부된 파일들의 서버 정보 목록 추출 (타입 가드로 타입 안전성 보장)
        const fileDetails = attachedFiles
            .map(f => uploadedFileMap[f.id])
            .filter((detail): detail is { id: number; originName: string; fileUrl: string } => detail !== undefined);

        onSubmit(title, content, fileDetails);
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
                    <TiptapEditor
                        content={content}
                        onChange={setContent}
                        enableFileAttachment={!!onFileUpload}
                        attachedFiles={attachedFiles}
                        onFilesChange={handleFilesChange}
                    />
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
