import { useState, useEffect, lazy, Suspense } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { createBoardPost } from '../services/communityService';
import type { BoardCategory } from '../types';
import { BOARD_CATEGORY_LABELS } from '../types';
import ConfirmModal from '../components/common/ConfirmModal';
import AlertModal from '../components/ui/AlertModal';
import { useAuthStore } from '../store/authStore';
import { getTextContent } from '../utils/formatUtils';
import type { AttachedFile } from '../components/editor/TiptapEditor';

// Tiptap 에디터를 lazy load
const TiptapEditor = lazy(() => import('../components/editor/TiptapEditor'));

const CommunityWritePage = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user, isAuthenticated } = useAuthStore();
    const [searchParams] = useSearchParams();

    // URL에서 카테고리 읽기, 유효하지 않으면 기본값 'CODING_STORY'
    const getInitialCategory = (): BoardCategory => {
        const urlCategory = searchParams.get('category') as BoardCategory;
        const validCategories: BoardCategory[] = ['NOTICE', 'QUESTION', 'COURSE_STORY', 'CODING_STORY'];
        return validCategories.includes(urlCategory) ? urlCategory : 'CODING_STORY';
    };

    // 비로그인 시 로그인 페이지로 리다이렉트
    useEffect(() => {
        if (!isAuthenticated) {
            // 로그인 페이지로 리다이렉트 (로그인 페이지에서 안내 표시)
            navigate('/login', { state: { from: '/community/write', message: '로그인이 필요한 서비스입니다.' } });
        }
    }, [isAuthenticated, navigate]);

    const [title, setTitle] = useState('');
    const [text, setText] = useState('');
    const [category, setCategory] = useState<BoardCategory>(getInitialCategory());
    const [titleError, setTitleError] = useState<string | null>(null);
    const [contentError, setContentError] = useState<string | null>(null);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);

    // 작성 중인 내용이 있는지 확인
    const hasUnsavedChanges = () => {
        const textContent = getTextContent(text).trim();
        return title.trim() !== '' || textContent !== '' || attachedFiles.length > 0;
    };

    // 브라우저 새로고침/탭 닫기 시 경고
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges()) {
                e.preventDefault();
                e.returnValue = ''; // Chrome requires returnValue to be set
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [title, text, attachedFiles]);

    // 게시글 작성 mutation
    const createPostMutation = useMutation({
        mutationFn: ({ data, files }: {
            data: {
                title: string;
                text: string;
                category: BoardCategory;
                account?: { id: number; userName: string; };
                isSecret: boolean;
                hasAttachment?: boolean;
            };
            files?: File[];
        }) => createBoardPost(data, files),
        onSuccess: (newPost) => {
            queryClient.invalidateQueries({ queryKey: ['boardPosts'] });
            navigate(`/community/${newPost.id}`);
        },
        onError: (error: Error) => {
            console.error('게시글 작성 실패:', error);
            setContentError(error.message || '게시글 작성에 실패했습니다.');
        },
    });

    // 폼 제출
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // 에러 초기화
        setTitleError(null);
        setContentError(null);

        if (!isAuthenticated || !user) {
            setContentError('로그인이 필요한 서비스입니다.');
            setTimeout(() => navigate('/login', { state: { from: '/community/write' } }), 1500);
            return;
        }

        // 제목 검증
        if (!title.trim()) {
            setTitleError('제목을 입력해주세요.');
            return;
        }

        if (title.length > 255) {
            setTitleError('제목은 255자를 초과할 수 없습니다.');
            return;
        }

        // 내용 검증 (HTML 태그 제거 후 실제 텍스트 확인)
        const textContent = getTextContent(text).trim();
        if (!textContent || textContent === '') {
            setContentError('내용을 입력해주세요.');
            return;
        }

        if (textContent.length < 10) {
            setContentError('내용은 최소 10자 이상 입력해주세요.');
            return;
        }

        // 첨부파일에서 File 객체만 추출
        const files = attachedFiles.map(f => f.file);

        createPostMutation.mutate({
            data: {
                title,
                text,
                category,
                account: {
                    id: user.id,
                    userName: user.userName,
                },
                isSecret: false,
                hasAttachment: files.length > 0,
            },
            files: files.length > 0 ? files : undefined,
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8">
            <div className="max-w-5xl mx-auto px-4">
                {/* 헤더 */}
                <div className="mb-6">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            if (hasUnsavedChanges()) {
                                setShowCancelModal(true);
                            } else {
                                navigate('/community');
                            }
                        }}
                        className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 mb-4 transition-colors cursor-pointer bg-transparent border-none"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">목록으로</span>
                    </button>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                        글쓰기
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        커뮤니티에 새로운 글을 작성합니다.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="glass-panel p-6 md:p-8 rounded-2xl mb-6 shadow-xl">
                        {/* 카테고리 선택 */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                                카테고리
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {(Object.keys(BOARD_CATEGORY_LABELS) as BoardCategory[]).map((cat) => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setCategory(cat)}
                                        aria-pressed={category === cat}
                                        className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 ${category === cat
                                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105'
                                            : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'
                                            }`}
                                    >
                                        {BOARD_CATEGORY_LABELS[cat]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 제목 입력 */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    제목
                                </label>
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                    {title.length}/255
                                </span>
                            </div>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => {
                                    setTitle(e.target.value);
                                    if (titleError) setTitleError(null);
                                }}
                                placeholder="제목을 입력하세요"
                                maxLength={255}
                                className={`w-full px-4 py-3 border-2 ${titleError ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-600 focus:ring-blue-500'
                                    } rounded-xl focus:ring-2 focus:border-transparent dark:bg-slate-800 dark:text-white transition-all text-lg font-medium`}
                            />
                            {titleError && (
                                <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                                    <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                                    {titleError}
                                </p>
                            )}
                        </div>

                        {/* 내용 입력 (Tiptap 에디터) */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                                내용
                            </label>
                            <div className={contentError ? 'ring-2 ring-red-500 rounded-xl' : ''}>
                                <Suspense
                                    fallback={
                                        <div className="border-2 border-slate-200 dark:border-slate-600 rounded-xl overflow-hidden bg-white dark:bg-slate-900 min-h-[400px] flex items-center justify-center shadow-lg">
                                            <div className="text-center">
                                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
                                                <p className="text-slate-600 dark:text-slate-400 font-medium">에디터 로딩 중...</p>
                                            </div>
                                        </div>
                                    }
                                >
                                    <TiptapEditor
                                        content={text}
                                        onChange={(value) => {
                                            setText(value);
                                            if (contentError) setContentError(null);
                                        }}
                                        enableFileAttachment={true}
                                        attachedFiles={attachedFiles}
                                        onFilesChange={setAttachedFiles}
                                    />
                                </Suspense>
                            </div>
                            {contentError && (
                                <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                                    <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                                    {contentError}
                                </p>
                            )}
                        </div>

                        {/* 첨부파일 */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                                첨부파일
                            </label>
                            <FileUpload
                                files={files}
                                onFilesChange={setFiles}
                                maxFiles={5}
                                maxSizeMB={50}
                            />
                        </div>
                    </div>

                    {/* 버튼 */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={createPostMutation.isPending}
                            className="flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl disabled:hover:shadow-lg"
                        >
                            {createPostMutation.isPending ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                    작성 중...
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    작성 완료
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* 취소 확인 모달 */}
                <ConfirmModal
                    isOpen={showCancelModal}
                    onClose={() => setShowCancelModal(false)}
                    onConfirm={() => {
                        setShowCancelModal(false);
                        navigate('/community');
                    }}
                    title="작성 취소"
                    message="작성 중인 내용이 있습니다. 정말 취소하시겠습니까? 작성한 내용은 저장되지 않습니다."
                />
            </div>
        </div>
    );
};

export default CommunityWritePage;
