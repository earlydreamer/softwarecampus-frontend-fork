import { useState, useEffect, lazy, Suspense } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, X, Download, FileIcon } from 'lucide-react';
import { fetchBoardPost, updateBoardPost, downloadBoardAttachment } from '../services/communityService';
import type { BoardCategory, BoardAttachment } from '../types';
import { BOARD_CATEGORY_LABELS } from '../types';
import ConfirmModal from '../components/common/ConfirmModal';
import AlertModal from '../components/ui/AlertModal';
import FileUpload from '../components/common/FileUpload';
import { useAuthStore } from '../store/authStore';
import { formatFileSize, getTextContent } from '../utils/formatUtils';

// Tiptap 에디터를 lazy load
const TiptapEditor = lazy(() => import('../components/editor/TiptapEditor'));

const CommunityEditPage = () => {
    const { postId } = useParams<{ postId: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user, isAuthenticated } = useAuthStore();

    const [title, setTitle] = useState('');
    const [text, setText] = useState('');
    const [category, setCategory] = useState<BoardCategory | null>(null);
    const [isSecret, setIsSecret] = useState(false);
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [existingAttachments, setExistingAttachments] = useState<BoardAttachment[]>([]);
    const [deleteAttachIds, setDeleteAttachIds] = useState<number[]>([]);
    const [titleError, setTitleError] = useState<string | null>(null);
    const [contentError, setContentError] = useState<string | null>(null);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // 게시글 데이터 가져오기
    const { data: post, isLoading, error } = useQuery({
        queryKey: ['boardPost', postId],
        queryFn: () => fetchBoardPost(Number(postId)),
        enabled: !!postId && isAuthenticated,
    });

    // 게시글 데이터로 폼 초기화
    useEffect(() => {
        if (post && !isInitialized) {
            setTitle(post.title);
            setText(post.text);
            setCategory(post.category);
            setIsSecret(post.secret);
            setExistingAttachments(post.attachments || []);
            setIsInitialized(true);
        }
    }, [post, isInitialized]);

    // 비로그인 시 로그인 페이지로 리다이렉트
    useEffect(() => {
        if (!isAuthenticated) {
            // 로그인 페이지로 리다이렉트 (로그인 페이지에서 안내 표시)
            navigate('/login', { state: { from: `/community/${postId}/edit`, message: '로그인이 필요한 서비스입니다.' } });
        }
    }, [isAuthenticated, navigate, postId]);

    // 작성자 본인 확인
    useEffect(() => {
        if (post && user && post.account.id !== user.id) {
            // 권한 없음 - 상세 페이지로 리다이렉트
            navigate(`/community/${postId}`, { state: { error: '본인이 작성한 글만 수정할 수 있습니다.' } });
        }
    }, [post, user, navigate, postId]);

    // 수정된 내용이 있는지 확인
    const hasUnsavedChanges = () => {
        if (!post) return false;
        const textContent = getTextContent(text).trim();
        const originalTextContent = getTextContent(post.text).trim();
        return (
            title !== post.title ||
            textContent !== originalTextContent ||
            category !== post.category ||
            isSecret !== post.secret ||
            newFiles.length > 0 ||
            deleteAttachIds.length > 0
        );
    };

    // 브라우저 새로고침/탭 닫기 시 경고
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges()) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [title, text, category, isSecret, newFiles, deleteAttachIds, post]);

    // 게시글 수정 mutation
    const updatePostMutation = useMutation({
        mutationFn: () => updateBoardPost(
            Number(postId),
            { title, text, category, secret: isSecret },
            newFiles.length > 0 ? newFiles : undefined,
            deleteAttachIds.length > 0 ? deleteAttachIds : undefined
        ),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['boardPosts'] });
            queryClient.invalidateQueries({ queryKey: ['boardPost', postId] });
            navigate(`/community/${postId}`);
        },
        onError: (error: Error) => {
            console.error('게시글 수정 실패:', error);
            // 사용자에게 상세한 에러 메시지 표시
            const errorMessage = error.message || '게시글 수정에 실패했습니다.';
            setContentError(`오류: ${errorMessage} 다시 시도해주세요.`);
        },
    });

    // 기존 첨부파일 삭제 표시
    const handleMarkForDeletion = (attachId: number) => {
        setDeleteAttachIds(prev => [...prev, attachId]);
    };

    // 삭제 표시 취소
    const handleCancelDeletion = (attachId: number) => {
        setDeleteAttachIds(prev => prev.filter(id => id !== attachId));
    };

    // 첨부파일 다운로드
    const handleDownload = async (attachment: BoardAttachment) => {
        try {
            const blob = await downloadBoardAttachment(Number(postId), attachment.id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = attachment.originName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('다운로드 실패:', error);
            setContentError('파일 다운로드에 실패했습니다. 다시 시도해주세요.');
        }
    };

    // 폼 제출
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        setTitleError(null);
        setContentError(null);

        if (!isAuthenticated || !user) {
            setContentError('로그인이 필요한 서비스입니다.');
            return;
        }

        if (!title.trim()) {
            setTitleError('제목을 입력해주세요.');
            return;
        }

        if (title.length > 255) {
            setTitleError('제목은 255자를 초과할 수 없습니다.');
            return;
        }

        const textContent = getTextContent(text).trim();
        if (!textContent || textContent === '') {
            setContentError('내용을 입력해주세요.');
            return;
        }

        if (textContent.length < 10) {
            setContentError('내용은 최소 10자 이상 입력해주세요.');
            return;
        }

        // 총 첨부파일 개수 확인 (기존 - 삭제 + 새로운)
        const remainingAttachments = existingAttachments.filter(a => !deleteAttachIds.includes(a.id));
        const totalFiles = remainingAttachments.length + newFiles.length;
        if (totalFiles > 5) {
            setContentError(`첨부파일은 최대 5개까지 가능합니다. (현재: ${totalFiles}개)`);
            return;
        }

        updatePostMutation.mutate();
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="flex justify-center items-center min-h-[400px]">
                        <div className="text-center">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
                            <p className="text-slate-600 dark:text-slate-400 font-medium">게시글 불러오는 중...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="glass-panel p-8 rounded-2xl text-center">
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">
                            게시글을 찾을 수 없습니다
                        </h2>
                        <button
                            onClick={() => navigate('/community')}
                            className="text-blue-600 hover:underline"
                        >
                            목록으로 돌아가기
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // 삭제 표시되지 않은 기존 첨부파일
    const visibleAttachments = existingAttachments.filter(a => !deleteAttachIds.includes(a.id));
    // 삭제 표시된 첨부파일
    const markedForDeletion = existingAttachments.filter(a => deleteAttachIds.includes(a.id));
    // 새 파일 추가 가능 개수
    const maxNewFiles = 5 - visibleAttachments.length;

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
                                navigate(`/community/${postId}`);
                            }
                        }}
                        className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 mb-4 transition-colors cursor-pointer bg-transparent border-none"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">돌아가기</span>
                    </button>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                        글 수정
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        게시글을 수정합니다.
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

                        {/* 기존 첨부파일 */}
                        {existingAttachments.length > 0 && (
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                                    기존 첨부파일 ({visibleAttachments.length}개)
                                </label>
                                <div className="space-y-2">
                                    {visibleAttachments.map((attachment) => (
                                        <div
                                            key={attachment.id}
                                            className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <FileIcon className="w-5 h-5 text-slate-500 flex-shrink-0" />
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                                                        {attachment.originName}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {formatFileSize(attachment.fileSize)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleDownload(attachment)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                                    title="다운로드"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleMarkForDeletion(attachment.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                    title="삭제"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* 삭제 표시된 파일 */}
                                {markedForDeletion.length > 0 && (
                                    <div className="mt-4">
                                        <p className="text-sm text-red-600 dark:text-red-400 mb-2">
                                            삭제 예정 ({markedForDeletion.length}개)
                                        </p>
                                        <div className="space-y-2">
                                            {markedForDeletion.map((attachment) => (
                                                <div
                                                    key={attachment.id}
                                                    className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 opacity-60"
                                                >
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <FileIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
                                                        <span className="text-sm text-red-700 dark:text-red-300 line-through truncate">
                                                            {attachment.originName}
                                                        </span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCancelDeletion(attachment.id)}
                                                        className="text-xs text-blue-600 hover:underline"
                                                    >
                                                        취소
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 새 첨부파일 추가 */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                                새 첨부파일 추가 (최대 {maxNewFiles}개 추가 가능)
                            </label>
                            {maxNewFiles > 0 ? (
                                <FileUpload
                                    files={newFiles}
                                    onFilesChange={setNewFiles}
                                    maxFiles={maxNewFiles}
                                    maxSizeMB={50}
                                />
                            ) : (
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    첨부파일이 최대 개수(5개)에 도달했습니다. 기존 파일을 삭제해야 새 파일을 추가할 수 있습니다.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* 버튼 */}
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                if (hasUnsavedChanges()) {
                                    setShowCancelModal(true);
                                } else {
                                    navigate(`/community/${postId}`);
                                }
                            }}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl transition-all duration-200 font-medium"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            disabled={updatePostMutation.isPending}
                            className="flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl disabled:hover:shadow-lg"
                        >
                            {updatePostMutation.isPending ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                    수정 중...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    수정 완료
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
                        navigate(`/community/${postId}`);
                    }}
                    title="수정 취소"
                    message="수정 중인 내용이 있습니다. 정말 취소하시겠습니까? 변경한 내용은 저장되지 않습니다."
                />
            </div>
        </div>
    );
};

export default CommunityEditPage;
