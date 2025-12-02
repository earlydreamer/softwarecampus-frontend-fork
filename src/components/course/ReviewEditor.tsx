import React, { useState, useRef, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Star, X, FileText, AlertCircle } from 'lucide-react';
import { REVIEW_SECTION_LABELS, type ReviewSection } from '../../types';

interface ReviewEditorProps {
    onSubmit: (data: { comment: string; sections: ReviewSection[]; file?: File }) => Promise<void>;
    onCancel: () => void;
    isSubmitting?: boolean;
    initialData?: {
        comment: string;
        sections: ReviewSection[];
    };
}

const ReviewEditor: React.FC<ReviewEditorProps> = ({ onSubmit, onCancel, isSubmitting = false, initialData }) => {
    const [sections, setSections] = useState<ReviewSection[]>(
        initialData?.sections || [
            { sectionType: 'CURRICULUM', score: 5 },
            { sectionType: 'COURSEWARE', score: 5 },
            { sectionType: 'INSTRUCTOR', score: 5 },
            { sectionType: 'EQUIPMENT', score: 5 },
        ]
    );
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: '수강 후기를 자세히 작성해주세요. (최소 10자 이상)',
            }),
        ],
        content: initialData?.comment || '',
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4 border rounded-md',
            },
        },
    });

    // initialData가 변경되면 에디터 내용 업데이트
    useEffect(() => {
        if (editor && initialData?.comment) {
            editor.commands.setContent(initialData.comment);
        }
    }, [editor, initialData?.comment]);

    const handleScoreChange = (index: number, score: number) => {
        const newSections = [...sections];
        newSections[index].score = score;
        setSections(newSections);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];

            // 파일 크기 제한 (10MB)
            if (selectedFile.size > 10 * 1024 * 1024) {
                setError('파일 크기는 10MB를 초과할 수 없습니다.');
                if (fileInputRef.current) fileInputRef.current.value = '';
                return;
            }

            // 파일 타입 제한
            const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
            if (!allowedTypes.includes(selectedFile.type)) {
                setError('JPG, PNG, PDF 파일만 업로드 가능합니다.');
                if (fileInputRef.current) fileInputRef.current.value = '';
                return;
            }

            setFile(selectedFile);
            setError(null);

            // 이미지 미리보기
            if (selectedFile.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviewUrl(reader.result as string);
                };
                reader.readAsDataURL(selectedFile);
            } else {
                setPreviewUrl(null);
            }
        }
    };

    const removeFile = () => {
        setFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async () => {
        if (!editor) return;

        const comment = editor.getHTML();
        const plainText = editor.getText();

        if (plainText.length < 10) {
            setError('후기 내용은 최소 10자 이상 작성해주세요.');
            return;
        }

        try {
            await onSubmit({
                comment,
                sections,
                file: file || undefined,
            });
        } catch (err: any) {
            console.error(err);
            const errorMessage = err.response?.data?.message || '후기 작성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
            setError(errorMessage);
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">상세 평가</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {sections.map((section, index) => (
                        <div key={section.sectionType} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="font-medium text-gray-700">{REVIEW_SECTION_LABELS[section.sectionType]}</span>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => handleScoreChange(index, star)}
                                        aria-label={`${REVIEW_SECTION_LABELS[section.sectionType]} ${star}점`}
                                        className={`p-1 transition-colors ${star <= section.score ? 'text-yellow-400' : 'text-gray-300'
                                            }`}
                                    >
                                        <Star className="w-5 h-5 fill-current" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">후기 내용</label>
                <EditorContent editor={editor} />
            </div>

            <div className="space-y-2">
                <label htmlFor="certificate-upload" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">수료증 첨부 (선택)</label>
                <div className="flex items-start gap-4">
                    <div className="flex-1">
                        <input
                            id="certificate-upload"
                            ref={fileInputRef}
                            type="file"
                            accept=".jpg,.jpeg,.png,.pdf"
                            onChange={handleFileChange}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            JPG, PNG, PDF 파일 (최대 10MB)
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="relative w-full rounded-lg border border-red-200 bg-red-50 p-4 text-red-600 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-red-600 pl-11">
                        <AlertCircle className="h-4 w-4" />
                        <div className="text-sm [&_p]:leading-relaxed">{error}</div>
                    </div>
                )}

                {file && (
                    <div className="mt-2 relative overflow-hidden w-full sm:w-64 rounded-lg border bg-card text-card-foreground shadow-sm">
                        <button
                            type="button"
                            className="absolute top-1 right-1 h-6 w-6 bg-white/80 hover:bg-white rounded-full z-10 flex items-center justify-center transition-colors"
                            onClick={removeFile}
                            aria-label="첨부 파일 삭제"
                        >
                            <X className="h-4 w-4" />
                        </button>
                        <div className="p-2 flex flex-col items-center justify-center min-h-[100px] bg-gray-50">
                            {previewUrl ? (
                                <img src={previewUrl} alt="Preview" className="max-h-32 object-contain rounded" />
                            ) : (
                                <div className="flex flex-col items-center text-gray-500">
                                    <FileText className="h-8 w-8 mb-2" />
                                    <span className="text-xs truncate max-w-full px-2">{file.name}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                >
                    취소
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 bg-slate-900 text-white hover:bg-slate-800"
                >
                    {isSubmitting ? (initialData ? '수정 중...' : '작성 중...') : (initialData ? '수정 완료' : '작성 완료')}
                </button>
            </div>
        </div>
    );
};

export default ReviewEditor;
