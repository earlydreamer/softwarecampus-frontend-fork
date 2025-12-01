import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Eye, MessageSquare, ThumbsUp, Paperclip, Send, Pencil, Trash2, ArrowLeft, Download, FileIcon } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import type { Comment, BoardAttachment } from '../types';
import { BOARD_CATEGORY_LABELS } from '../types';
import {
    fetchBoardPost,
    recommendBoardPost,
    createComment,
    updateComment,
    deleteComment,
    deleteBoardPost,
    downloadBoardAttachment,
} from '../services/communityService';
import { sanitizeInput } from '../utils/security';

// 파일 크기를 읽기 쉬운 형식으로 변환
const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const CommunityDetailPage = () => {
    const { postId } = useParams<{ postId?: string }>();
    const postIdNumber = postId ? parseInt(postId, 10) : NaN;
    const isValidPostId = !isNaN(postIdNumber) && postIdNumber > 0;

    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user, isAuthenticated } = useAuthStore();

    const [commentContent, setCommentContent] = useState('');
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
    const [editingContent, setEditingContent] = useState('');

    // 게시글 조회
    const { data: post, isLoading: postLoading, error: postError, refetch: refetchPost } = useQuery({
        queryKey: ['boardPost', postIdNumber],
        queryFn: () => fetchBoardPost(postIdNumber),
        enabled: isValidPostId,
    });

    // 댓글 데이터는 게시글 데이터에 포함됨
    const comments = post?.comments || [];
    const commentsLoading = postLoading;

    // 추천 mutation
    const recommendMutation = useMutation({
        mutationFn: () => {
            if (!isAuthenticated) {
                throw new Error('로그인이 필요한 서비스입니다.');
            }
            return recommendBoardPost(postIdNumber);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['boardPost', postIdNumber] });
        },
        onError: (error: Error) => {
            alert(error.message);
        },
    });

    // 댓글 작성 mutation
    const createCommentMutation = useMutation({
        mutationFn: (content: string) => createComment(postIdNumber, content),
        onSuccess: () => {
            // 게시글 데이터를 다시 불러와서 댓글 목록 갱신
            queryClient.invalidateQueries({ queryKey: ['boardPost', postIdNumber] });
            setCommentContent('');
        },
        onError: (error: Error) => {
            alert(error.message || '댓글 작성에 실패했습니다.');
        },
    });

    // 댓글 수정 mutation
    const updateCommentMutation = useMutation({
        mutationFn: ({ commentId, text }: { commentId: number; text: string }) =>
            updateComment(commentId, postIdNumber, text),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['boardPost', postIdNumber] });
            setEditingCommentId(null);
            setEditingContent('');
        },
        onError: (error: Error) => {
            alert(error.message || '댓글 수정에 실패했습니다.');
        },
    });

    // 댓글 삭제 mutation
    const deleteCommentMutation = useMutation({
        mutationFn: (commentId: number) => deleteComment(commentId, postIdNumber),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['boardPost', postIdNumber] });
        },
    });

    // 게시글 삭제 mutation
    const deleteBoardMutation = useMutation({
        mutationFn: () => deleteBoardPost(postIdNumber),
        onSuccess: () => {
            alert('게시글이 삭제되었습니다.');
            navigate('/community');
        },
        onError: (error: Error) => {
            alert(error.message || '게시글 삭제에 실패했습니다.');
        },
    });

    // 게시글 삭제 핸들러
    const handleDeletePost = () => {
        if (window.confirm('정말 이 게시글을 삭제하시겠습니까?\n삭제된 게시글은 복구할 수 없습니다.')) {
            deleteBoardMutation.mutate();
        }
    };

    // 첨부파일 다운로드 핸들러
    const handleDownload = async (attachment: BoardAttachment) => {
        try {
            const blob = await downloadBoardAttachment(postIdNumber, attachment.id);
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
            alert('파일 다운로드에 실패했습니다.');
        }
    };

    // 현재 사용자가 게시글 작성자인지 확인
    const isAuthor = useMemo(() => {
        if (!user || !post) return false;
        return user.id === post.account.id;
    }, [user, post]);

    // 날짜 포맷팅
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return '방금 전';
        if (minutes < 60) return `${minutes}분 전`;
        if (hours < 24) return `${hours}시간 전`;
        if (days < 7) return `${days}일 전`;

        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    // 댓글 작성 핸들러
    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (commentContent.trim()) {
            if (commentContent.length > 500) {
                alert('댓글은 500자를 초과할 수 없습니다.');
                return;
            }
            createCommentMutation.mutate(commentContent);
        }
    };

    // 댓글 수정 시작
    const handleEditStart = (comment: Comment) => {
        setEditingCommentId(comment.id);
        setEditingContent(comment.text);
    };

    // 댓글 수정 제출
    const handleEditSubmit = (commentId: number) => {
        if (editingContent.trim()) {
            updateCommentMutation.mutate({ commentId, text: editingContent });
        }
    };

    if (!isValidPostId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
                <div className="text-center glass-panel p-8 rounded-2xl max-w-md mx-4">
                    <p className="text-red-600 dark:text-red-400 mb-4 text-lg font-medium">유효하지 않은 게시글 ID입니다.</p>
                    <Link
                        to="/community"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        목록으로 돌아가기
                    </Link>
                </div>
            </div>
        );
    }

    if (postError) {
        const errorMessage = postError instanceof Error
            ? postError.message
            : '게시글을 불러오는 중 오류가 발생했습니다.';

        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
                <div className="max-w-md w-full mx-4">
                    <div className="glass-panel p-8 rounded-2xl border-2 border-red-200 dark:border-red-800">
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
                                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-red-800 dark:text-red-200 mb-2">
                                게시글 로드 실패
                            </h3>
                            <p className="text-red-700 dark:text-red-300 mb-6">
                                {errorMessage}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => refetchPost()}
                                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors font-medium"
                            >
                                다시 시도
                            </button>
                            <Link
                                to="/community"
                                className="flex-1 px-4 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-xl transition-colors text-center font-medium"
                            >
                                목록으로
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (postLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                    <p className="mt-4 text-slate-600 dark:text-slate-400 font-medium">로딩 중...</p>
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
                <div className="text-center glass-panel p-8 rounded-2xl max-w-md mx-4">
                    <p className="text-red-600 dark:text-red-400 mb-4 text-lg">게시글을 찾을 수 없습니다.</p>
                    <Link
                        to="/community"
                        className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        목록으로 돌아가기
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* 상단 버튼 영역 */}
                <div className="flex justify-between items-center mb-6">
                    <Link
                        to="/community"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        목록으로
                    </Link>
                    {isAuthor && (
                        <div className="flex gap-3">
                            <button
                                onClick={handleDeletePost}
                                disabled={deleteBoardMutation.isPending}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Trash2 className="w-4 h-4" />
                                {deleteBoardMutation.isPending ? '삭제 중...' : '삭제'}
                            </button>
                            <button
                                onClick={() => navigate(`/community/edit/${postIdNumber}`)}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                            >
                                <Pencil className="w-4 h-4" />
                                수정
                            </button>
                        </div>
                    )}
                </div>

                {/* 게시글 헤더 */}
                <div className="glass-panel p-6 md:p-8 rounded-2xl mb-4 shadow-xl">
                    <div className="mb-4">
                        <span
                            className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold ${post.category === 'NOTICE'
                                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white'
                                : post.category === 'QUESTION'
                                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                                    : post.category === 'COURSE_STORY'
                                        ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white'
                                        : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                                }`}
                        >
                            {BOARD_CATEGORY_LABELS[post.category]}
                        </span>
                    </div>

                    <h1 className="text-2xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6 flex items-start gap-3">
                        {post.title}
                        {post.hasAttachment && (
                            <Paperclip className="w-6 h-6 text-slate-400 flex-shrink-0 mt-1" />
                        )}
                    </h1>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400 pb-6 border-b border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                {post.account.userName.charAt(0)}
                            </div>
                            <span className="font-semibold text-slate-900 dark:text-white">{post.account.userName}</span>
                        </div>
                        <span className="hidden sm:inline">•</span>
                        <span>{formatDate(post.createdAt)}</span>
                        <span className="hidden sm:inline">•</span>
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1.5">
                                <Eye className="w-4 h-4" />
                                {post.hits.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <MessageSquare className="w-4 h-4" />
                                {post.commentCount || 0}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <ThumbsUp className="w-4 h-4" />
                                {post.likeCount || 0}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 게시글 본문 */}
                <div className="glass-panel p-6 md:p-8 rounded-2xl mb-4 shadow-xl">
                    <div className="prose prose-slate dark:prose-invert max-w-none">
                        <div
                            className="text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap"
                            dangerouslySetInnerHTML={{ __html: sanitizeInput(post.text) }}
                        />
                    </div>
                </div>

                {/* 첨부파일 */}
                {post.attachments && post.attachments.length > 0 && (
                    <div className="glass-panel p-6 md:p-8 rounded-2xl mb-4 shadow-xl">
                        <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white mb-4">
                            <Paperclip className="w-5 h-5 text-blue-600" />
                            첨부파일 <span className="text-blue-600">({post.attachments.length})</span>
                        </h3>
                        <div className="space-y-2">
                            {post.attachments.map((attachment) => (
                                <div
                                    key={attachment.id}
                                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
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
                                    <button
                                        type="button"
                                        onClick={() => handleDownload(attachment)}
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 dark:bg-blue-900/30 dark:hover:bg-blue-600 rounded-lg transition-all duration-200"
                                    >
                                        <Download className="w-4 h-4" />
                                        다운로드
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 추천 버튼 */}
                <div className="glass-panel p-6 rounded-2xl mb-6 shadow-xl">
                    <div className="flex justify-center">
                        <button
                            onClick={() => {
                                if (!isAuthenticated) {
                                    alert('로그인이 필요한 서비스입니다.');
                                    navigate('/login', { state: { from: `/community/${postIdNumber}` } });
                                    return;
                                }
                                if (!post.like) {
                                    recommendMutation.mutate();
                                }
                            }}
                            disabled={post.like || recommendMutation.isPending}
                            className={`group flex flex-col items-center gap-3 px-12 py-6 rounded-2xl transition-all duration-300 ${post.like
                                ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/50'
                                : 'bg-slate-100 hover:bg-gradient-to-br hover:from-blue-500 hover:to-indigo-600 dark:bg-slate-700 dark:hover:from-blue-600 dark:hover:to-indigo-700 text-slate-700 dark:text-slate-300 hover:text-white dark:hover:text-white hover:shadow-lg hover:shadow-blue-500/50 hover:scale-105'
                                }`}
                        >
                            <ThumbsUp className={`w-10 h-10 ${!post.like && 'group-hover:animate-bounce'}`} />
                            <div className="text-center">
                                <div className="font-bold text-lg">
                                    {post.like ? '추천했습니다' : '추천하기'}
                                </div>
                                <div className="text-2xl font-bold mt-1">{post.likeCount || 0}</div>
                            </div>
                        </button>
                    </div>
                </div>

                {/* 댓글 섹션 */}
                <div className="glass-panel p-6 md:p-8 rounded-2xl shadow-xl">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <MessageSquare className="w-6 h-6 text-blue-600" />
                        댓글 <span className="text-blue-600">{comments.length}</span>
                    </h2>

                    {/* 댓글 작성 폼 */}
                    {isAuthenticated ? (
                        <form onSubmit={handleCommentSubmit} className="mb-8">
                            <div className="mb-3">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        댓글 작성
                                    </label>
                                    <span className="text-xs text-slate-500">
                                        {commentContent.length}/500
                                    </span>
                                </div>
                                <textarea
                                    value={commentContent}
                                    onChange={(e) => setCommentContent(e.target.value)}
                                    placeholder="댓글을 입력하세요..."
                                    maxLength={500}
                                    className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-white resize-none transition-all"
                                    rows={4}
                                />
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={!commentContent.trim() || createCommentMutation.isPending}
                                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl"
                                >
                                    <Send className="w-4 h-4" />
                                    댓글 작성
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="mb-8 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-center">
                            <p className="text-slate-600 dark:text-slate-400 mb-3">
                                댓글을 작성하려면 로그인이 필요합니다.
                            </p>
                            <Link
                                to="/login"
                                state={{ from: `/community/${postIdNumber}` }}
                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                            >
                                로그인하기
                            </Link>
                        </div>
                    )}

                    {/* 댓글 목록 */}
                    {commentsLoading && (
                        <div className="text-center py-8">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
                        </div>
                    )}

                    {!commentsLoading && comments.length === 0 && (
                        <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                            <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                            <p className="text-slate-500 dark:text-slate-400 font-medium">첫 댓글을 작성해보세요.</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        {comments.map((comment, index) => (
                            <div
                                key={comment.id}
                                className={`pb-4 ${index !== comments.length - 1 ? 'border-b border-slate-200 dark:border-slate-700' : ''}`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-gradient-to-br from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-700 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 shadow-md">
                                        {comment.isDeleted ? '?' : comment.account.userName.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        {comment.isDeleted ? (
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-slate-400 dark:text-slate-500 italic">
                                                    {comment.text}
                                                </span>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="font-semibold text-slate-900 dark:text-white">
                                                        {comment.account.userName}
                                                    </span>
                                                    <span className="text-sm text-slate-500 dark:text-slate-400">
                                                        {formatDate(comment.createdAt)}
                                                    </span>
                                                </div>

                                                {editingCommentId === comment.id ? (
                                                    <div>
                                                        <textarea
                                                            value={editingContent}
                                                            onChange={(e) => setEditingContent(e.target.value)}
                                                            className="w-full px-3 py-2 border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white resize-none"
                                                            rows={3}
                                                        />
                                                        <div className="mt-2 flex gap-2">
                                                            <button
                                                                onClick={() => handleEditSubmit(comment.id)}
                                                                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors font-medium"
                                                            >
                                                                수정
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setEditingCommentId(null);
                                                                    setEditingContent('');
                                                                }}
                                                                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-700 dark:text-white text-sm rounded-lg transition-colors font-medium"
                                                            >
                                                                취소
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <p className="text-slate-700 dark:text-slate-300 mb-3 whitespace-pre-wrap">
                                                            {comment.text}
                                                        </p>
                                                        {user && user.id === comment.account.id && (
                                                            <div className="flex gap-3">
                                                                <button
                                                                    onClick={() => handleEditStart(comment)}
                                                                    className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
                                                                >
                                                                    <Pencil className="w-3.5 h-3.5" />
                                                                    수정
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        if (window.confirm('댓글을 삭제하시겠습니까?')) {
                                                                            deleteCommentMutation.mutate(comment.id);
                                                                        }
                                                                    }}
                                                                    className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                    삭제
                                                                </button>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommunityDetailPage;
