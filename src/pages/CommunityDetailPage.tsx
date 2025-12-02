import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Eye, MessageSquare, ThumbsUp, Paperclip, Send, Pencil, Trash2, ArrowLeft, Download, FileIcon, Reply, CornerDownRight, Lock } from 'lucide-react';
import { AxiosError } from 'axios';
import type { Comment, BoardAttachment } from '../types';
import { BOARD_CATEGORY_LABELS } from '../types';
import {
    fetchBoardPost,
    recommendBoardPost,
    cancelRecommendBoardPost,
    createComment,
    updateComment,
    deleteComment,
    deleteBoardPost,
    downloadBoardAttachment,
} from '../services/communityService';
import { sanitizeInput } from '../utils/security';
import { formatFileSize } from '../utils/formatUtils';
import { useAuthStore } from '../store/authStore';
import AlertModal from '../components/ui/AlertModal';
import ConfirmModal from '../components/common/ConfirmModal';

// 비밀글 접근 에러인지 확인하는 헬퍼 함수
const isSecretPostError = (error: unknown): boolean => {
    if (error instanceof AxiosError) {
        const status = error.response?.status;
        const data = error.response?.data;
        // 403 에러이면서 CANNOT_READ_BOARD 에러인 경우
        // ProblemDetail 형식: title이 에러코드명, detail이 메시지
        if (status === 403) {
            const title = data?.title || '';
            const detail = data?.detail || '';
            const message = data?.message || '';
            const allText = `${title} ${detail} ${message}`.toLowerCase();
            
            return (
                title === 'CANNOT_READ_BOARD' ||
                allText.includes('접근 권한') ||
                allText.includes('비밀글') ||
                allText.includes('secret')
            );
        }
    }
    return false;
};

// 인증 에러인지 확인하는 헬퍼 함수
const isAuthError = (error: unknown): boolean => {
    if (error instanceof AxiosError) {
        return error.response?.status === 401 || error.response?.status === 403;
    }
    if (error instanceof Error) {
        const msg = error.message?.toLowerCase() || '';
        return msg.includes('인증') || msg.includes('로그인') || msg.includes('unauthorized');
    }
    return false;
};

// 에러 메시지 추출 헬퍼 함수 (ProblemDetail 형식 지원)
const getErrorMessage = (error: unknown, defaultMsg: string): string => {
    if (error instanceof AxiosError) {
        const data = error.response?.data;
        // ProblemDetail 형식: detail 필드 우선, 그 다음 message 필드
        return data?.detail || data?.message || defaultMsg;
    }
    if (error instanceof Error) {
        return error.message || defaultMsg;
    }
    return defaultMsg;
};

const CommunityDetailPage = () => {
    const { postId } = useParams<{ postId?: string }>();
    const postIdNumber = postId ? parseInt(postId, 10) : NaN;
    const isValidPostId = !isNaN(postIdNumber) && postIdNumber > 0;

    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // 인증 스토어에서 사용자 정보 가져오기
    const { user, isAuthenticated } = useAuthStore();

    const [commentContent, setCommentContent] = useState('');
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
    const [editingContent, setEditingContent] = useState('');
    const [replyingToId, setReplyingToId] = useState<number | null>(null);  // 답글 대상 댓글 ID
    const [replyContent, setReplyContent] = useState('');  // 답글 내용
    
    // 모달 상태
    const [alertModal, setAlertModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'success' | 'warning' | 'error' | 'info';
    }>({ isOpen: false, title: '', message: '', type: 'info' });
    const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
        isOpen: boolean;
        commentId: number | null;
    }>({ isOpen: false, commentId: null });
    const [deleteReplyConfirmModal, setDeleteReplyConfirmModal] = useState<{
        isOpen: boolean;
        replyId: number | null;
    }>({ isOpen: false, replyId: null });

    // 게시글 조회
    const { data: post, isLoading: postLoading, error: postError, refetch: refetchPost } = useQuery({
        queryKey: ['boardPost', postIdNumber],
        queryFn: () => fetchBoardPost(postIdNumber),
        enabled: isValidPostId,
    });

    // 댓글 데이터는 게시글 데이터에 포함됨
    const comments = post?.comments || [];
    const commentsLoading = postLoading;

    // 추천 mutation (낙관적 업데이트 적용)
    const recommendMutation = useMutation({
        mutationFn: () => {
            return recommendBoardPost(postIdNumber);
        },
        // 낙관적 업데이트: API 호출 전에 UI를 즉시 업데이트
        onMutate: async () => {
            // 진행 중인 refetch 취소 (낙관적 업데이트 덮어쓰기 방지)
            await queryClient.cancelQueries({ queryKey: ['boardPost', postIdNumber] });
            
            // 이전 데이터 스냅샷 저장 (롤백용)
            const previousPost = queryClient.getQueryData(['boardPost', postIdNumber]);
            
            // 캐시를 낙관적으로 업데이트
            queryClient.setQueryData(['boardPost', postIdNumber], (old: typeof post) => {
                if (!old) return old;
                return {
                    ...old,
                    like: true,
                    likeCount: (old.likeCount || 0) + 1,
                };
            });
            
            // 컨텍스트로 이전 데이터 반환 (onError에서 롤백에 사용)
            return { previousPost };
        },
        onError: (error: unknown, _variables, context) => {
            // 에러 발생 시 이전 상태로 롤백
            if (context?.previousPost) {
                queryClient.setQueryData(['boardPost', postIdNumber], context.previousPost);
            }
            
            if (isAuthError(error)) {
                setAlertModal({
                    isOpen: true,
                    title: '로그인 필요',
                    message: '로그인이 필요한 서비스입니다.',
                    type: 'warning'
                });
            } else {
                setAlertModal({
                    isOpen: true,
                    title: '추천 실패',
                    message: getErrorMessage(error, '추천에 실패했습니다.'),
                    type: 'error'
                });
            }
        },
        // 성공/실패 상관없이 서버 데이터로 동기화
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['boardPost', postIdNumber] });
        },
    });

    // 추천 취소 mutation (낙관적 업데이트 적용)
    const cancelRecommendMutation = useMutation({
        mutationFn: () => {
            return cancelRecommendBoardPost(postIdNumber);
        },
        // 낙관적 업데이트: API 호출 전에 UI를 즉시 업데이트
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ['boardPost', postIdNumber] });
            
            const previousPost = queryClient.getQueryData(['boardPost', postIdNumber]);
            
            queryClient.setQueryData(['boardPost', postIdNumber], (old: typeof post) => {
                if (!old) return old;
                return {
                    ...old,
                    like: false,
                    likeCount: Math.max((old.likeCount || 1) - 1, 0),
                };
            });
            
            return { previousPost };
        },
        onError: (error: unknown, _variables, context) => {
            if (context?.previousPost) {
                queryClient.setQueryData(['boardPost', postIdNumber], context.previousPost);
            }
            
            if (isAuthError(error)) {
                setAlertModal({
                    isOpen: true,
                    title: '로그인 필요',
                    message: '로그인이 필요한 서비스입니다.',
                    type: 'warning'
                });
            } else {
                setAlertModal({
                    isOpen: true,
                    title: '추천 취소 실패',
                    message: getErrorMessage(error, '추천 취소에 실패했습니다.'),
                    type: 'error'
                });
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['boardPost', postIdNumber] });
        },
    });

    // 댓글 작성 mutation (낙관적 업데이트)
    const createCommentMutation = useMutation({
        mutationFn: (content: string) => createComment(postIdNumber, content),
        onMutate: async (content: string) => {
            // 진행 중인 쿼리 취소
            await queryClient.cancelQueries({ queryKey: ['boardPost', postIdNumber] });

            // 이전 데이터 스냅샷
            const previousPost = queryClient.getQueryData(['boardPost', postIdNumber]);

            // 낙관적 업데이트
            queryClient.setQueryData(['boardPost', postIdNumber], (old: any) => {
                if (!old) return old;

                const optimisticComment: Comment = {
                    id: Date.now(), // 임시 ID
                    text: content,
                    account: {
                        id: user?.id || 0,
                        userName: user?.userName || '사용자',
                    },
                    createdAt: new Date().toISOString(),
                    isDeleted: false,
                    subComments: [],
                };

                return {
                    ...old,
                    comments: [...(old.comments || []), optimisticComment],
                    commentCount: (old.commentCount || 0) + 1,
                };
            });

            return { previousPost };
        },
        onSuccess: () => {
            // 서버 데이터로 동기화
            queryClient.invalidateQueries({ queryKey: ['boardPost', postIdNumber] });
            setCommentContent('');
        },
        onError: (error: unknown, _variables, context) => {
            // 롤백
            if (context?.previousPost) {
                queryClient.setQueryData(['boardPost', postIdNumber], context.previousPost);
            }

            if (isAuthError(error)) {
                setAlertModal({
                    isOpen: true,
                    title: '로그인 필요',
                    message: '로그인이 필요한 서비스입니다.',
                    type: 'warning'
                });
            } else {
                setAlertModal({
                    isOpen: true,
                    title: '댓글 작성 실패',
                    message: getErrorMessage(error, '댓글 작성에 실패했습니다.'),
                    type: 'error'
                });
            }
        },
    });

    // 대댓글 작성 mutation (낙관적 업데이트)
    const createReplyMutation = useMutation({
        mutationFn: ({ content, topCommentId }: { content: string; topCommentId: number }) => 
            createComment(postIdNumber, content, topCommentId),
        onMutate: async ({ content, topCommentId }) => {
            // 진행 중인 쿼리 취소
            await queryClient.cancelQueries({ queryKey: ['boardPost', postIdNumber] });

            // 이전 데이터 스냅샷
            const previousPost = queryClient.getQueryData(['boardPost', postIdNumber]);

            // 낙관적 업데이트
            queryClient.setQueryData(['boardPost', postIdNumber], (old: any) => {
                if (!old) return old;

                const optimisticReply: Comment = {
                    id: Date.now(), // 임시 ID
                    text: content,
                    account: {
                        id: user?.id || 0,
                        userName: user?.userName || '사용자',
                    },
                    createdAt: new Date().toISOString(),
                    isDeleted: false,
                    topCommentId,
                };

                // 부모 댓글 찾아서 subComments에 추가
                const updatedComments = (old.comments || []).map((comment: Comment) => {
                    if (comment.id === topCommentId) {
                        return {
                            ...comment,
                            subComments: [...(comment.subComments || []), optimisticReply],
                        };
                    }
                    return comment;
                });

                return {
                    ...old,
                    comments: updatedComments,
                    commentCount: (old.commentCount || 0) + 1,
                };
            });

            return { previousPost };
        },
        onSuccess: () => {
            // 서버 데이터로 동기화
            queryClient.invalidateQueries({ queryKey: ['boardPost', postIdNumber] });
            setReplyingToId(null);
            setReplyContent('');
        },
        onError: (error: unknown, _variables, context) => {
            // 롤백
            if (context?.previousPost) {
                queryClient.setQueryData(['boardPost', postIdNumber], context.previousPost);
            }

            if (isAuthError(error)) {
                setAlertModal({
                    isOpen: true,
                    title: '로그인 필요',
                    message: '로그인이 필요한 서비스입니다.',
                    type: 'warning'
                });
            } else {
                setAlertModal({
                    isOpen: true,
                    title: '답글 작성 실패',
                    message: getErrorMessage(error, '답글 작성에 실패했습니다.'),
                    type: 'error'
                });
            }
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
        onError: (error: unknown) => {
            if (isAuthError(error)) {
                setAlertModal({
                    isOpen: true,
                    title: '로그인 필요',
                    message: '로그인이 필요한 서비스입니다.',
                    type: 'warning'
                });
            } else {
                setAlertModal({
                    isOpen: true,
                    title: '댓글 수정 실패',
                    message: getErrorMessage(error, '댓글 수정에 실패했습니다.'),
                    type: 'error'
                });
            }
        },
    });

    // 댓글 삭제 mutation
    const deleteCommentMutation = useMutation({
        mutationFn: (commentId: number) => deleteComment(commentId, postIdNumber),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['boardPost', postIdNumber] });
        },
    });

    // 게시글 삭제 후 목록 이동 여부 (모달 확인 시 이동)
    const [shouldNavigateAfterDelete, setShouldNavigateAfterDelete] = useState(false);

    // 게시글 삭제 mutation
    const deleteBoardMutation = useMutation({
        mutationFn: () => deleteBoardPost(postIdNumber),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['boardPosts'] });
            setShouldNavigateAfterDelete(true);
            setAlertModal({
                isOpen: true,
                title: '삭제 완료',
                message: '게시글이 삭제되었습니다.',
                type: 'success'
            });
        },
        onError: (error: Error) => {
            setAlertModal({
                isOpen: true,
                title: '삭제 실패',
                message: error.message || '게시글 삭제에 실패했습니다. 다시 시도해주세요.',
                type: 'error'
            });
        },
    });

    // 게시글 삭제 핸들러
    const [deletePostConfirmModal, setDeletePostConfirmModal] = useState(false);
    
    const handleDeletePost = () => {
        setDeletePostConfirmModal(true);
    };
    
    const confirmDeletePost = () => {
        setDeletePostConfirmModal(false);
        deleteBoardMutation.mutate();
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
            setAlertModal({
                isOpen: true,
                title: '다운로드 실패',
                message: '파일 다운로드에 실패했습니다. 다시 시도해주세요.',
                type: 'error'
            });
        }
    };

    // 현재 사용자가 게시글 작성자이거나 관리자인지 확인
    const isAuthor = useMemo(() => {
        if (!user || !post) return false;
        return user.id === post.account.id || user.accountType === 'ADMIN';
    }, [user, post]);

    // 관리자 여부 확인
    const isAdmin = user?.accountType === 'ADMIN';

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
                setAlertModal({
                    isOpen: true,
                    title: '입력 오류',
                    message: '댓글은 500자를 초과할 수 없습니다.',
                    type: 'warning'
                });
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

    // 답글 작성 시작
    const handleReplyStart = (commentId: number) => {
        setReplyingToId(commentId);
        setReplyContent('');
    };

    // 답글 작성 제출
    // NOTE: 길이 제한(500자)은 프론트엔드와 백엔드 모두에서 검증해야 함 (데이터 무결성 보장)
    const handleReplySubmit = (topCommentId: number) => {
        if (replyContent.trim()) {
            if (replyContent.length > 500) {
                setAlertModal({
                    isOpen: true,
                    title: '입력 오류',
                    message: '답글은 500자를 초과할 수 없습니다.',
                    type: 'warning'
                });
                return;
            }
            createReplyMutation.mutate({ content: replyContent, topCommentId });
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
        // 디버깅: 실제 에러 데이터 확인
        if (postError instanceof AxiosError) {
            console.log('=== postError 디버깅 ===');
            console.log('status:', postError.response?.status);
            console.log('data:', postError.response?.data);
            console.log('isSecretPostError:', isSecretPostError(postError));
        }
        
        // 비밀글 접근 에러인 경우 전용 UI 표시
        if (isSecretPostError(postError)) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
                    <div className="max-w-md w-full mx-4">
                        <div className="glass-panel p-8 rounded-2xl border-2 border-amber-200 dark:border-amber-800">
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full mb-4">
                                    <Lock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                                </div>
                                <h3 className="text-xl font-bold text-amber-800 dark:text-amber-200 mb-2">
                                    비밀글입니다
                                </h3>
                                <p className="text-amber-700 dark:text-amber-300 mb-2">
                                    이 게시글은 비밀글로 설정되어 있습니다.
                                </p>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    작성자 또는 관리자만 열람할 수 있습니다.
                                </p>
                            </div>
                            <Link
                                to="/community"
                                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-colors font-medium"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                목록으로 돌아가기
                            </Link>
                        </div>
                    </div>
                </div>
            );
        }

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
                <div className="glass-panel p-4 rounded-2xl mb-6 shadow-xl">
                    <div className="flex justify-center">
                        <button
                            onClick={() => {
                                if (!isAuthenticated) {
                                    setAlertModal({
                                        isOpen: true,
                                        title: '로그인 필요',
                                        message: '로그인이 필요한 서비스입니다.',
                                        type: 'warning'
                                    });
                                    return;
                                }
                                if (post.like) {
                                    cancelRecommendMutation.mutate();
                                } else {
                                    recommendMutation.mutate();
                                }
                            }}
                            disabled={recommendMutation.isPending || cancelRecommendMutation.isPending}
                            className={`group flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-300 cursor-pointer ${post.like
                                ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/40 hover:from-blue-600 hover:to-indigo-700'
                                : 'bg-slate-100 hover:bg-gradient-to-br hover:from-blue-500 hover:to-indigo-600 dark:bg-slate-700 dark:hover:from-blue-600 dark:hover:to-indigo-700 text-slate-700 dark:text-slate-300 hover:text-white dark:hover:text-white hover:shadow-md hover:shadow-blue-500/40 hover:scale-105'
                                }`}
                        >
                            <ThumbsUp className={`w-5 h-5 ${!post.like && 'group-hover:animate-bounce'}`} />
                            <span className="font-semibold">
                                {post.like ? '추천 취소' : '추천하기'}
                            </span>
                            <span className="font-bold text-lg">{post.likeCount || 0}</span>
                        </button>
                    </div>
                </div>

                {/* 댓글 섹션 */}
                <div className="glass-panel p-6 md:p-8 rounded-2xl shadow-xl">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <MessageSquare className="w-6 h-6 text-blue-600" />
                        댓글 <span className="text-blue-600">
                            {comments.reduce((total, comment) => 
                                total + 1 + (comment.subComments?.length || 0), 0
                            )}
                        </span>
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
                        {comments.filter(comment => !comment.topCommentId).map((comment, index) => (
                            <div
                                key={comment.id}
                                className={`pb-4 ${index !== comments.length - 1 ? 'border-b border-slate-200 dark:border-slate-700' : ''}`}
                            >
                                {/* 상위 댓글 */}
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
                                                        <div className="flex gap-3">
                                                            {/* 답글 버튼 - 로그인한 사용자만 */}
                                                            {isAuthenticated && (
                                                                <button
                                                                    onClick={() => handleReplyStart(comment.id)}
                                                                    className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
                                                                >
                                                                    <Reply className="w-3.5 h-3.5" />
                                                                    답글
                                                                </button>
                                                            )}
                                                            {user && user.id === comment.account.id && (
                                                                <button
                                                                    onClick={() => handleEditStart(comment)}
                                                                    className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
                                                                >
                                                                    <Pencil className="w-3.5 h-3.5" />
                                                                    수정
                                                                </button>
                                                            )}
                                                            {user && (user.id === comment.account.id || isAdmin) && (
                                                                <button
                                                                    onClick={() => setDeleteConfirmModal({ isOpen: true, commentId: comment.id })}
                                                                    className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                    삭제
                                                                </button>
                                                            )}
                                                        </div>
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* 답글 작성 폼 */}
                                {replyingToId === comment.id && (
                                    <div className="mt-4 ml-14 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                        <div className="flex items-center gap-2 mb-3 text-sm text-slate-600 dark:text-slate-400">
                                            <CornerDownRight className="w-4 h-4" />
                                            <span className="font-medium">{comment.account.userName}</span>
                                            <span>님에게 답글 작성</span>
                                        </div>
                                        <textarea
                                            value={replyContent}
                                            onChange={(e) => setReplyContent(e.target.value)}
                                            placeholder="답글을 입력하세요..."
                                            maxLength={500}
                                            className="w-full px-3 py-2 border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white resize-none"
                                            rows={3}
                                        />
                                        <div className="mt-2 flex justify-between items-center">
                                            <span className="text-xs text-slate-500">{replyContent.length}/500</span>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setReplyingToId(null);
                                                        setReplyContent('');
                                                    }}
                                                    className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-700 dark:text-white text-sm rounded-lg transition-colors font-medium"
                                                >
                                                    취소
                                                </button>
                                                <button
                                                    onClick={() => handleReplySubmit(comment.id)}
                                                    disabled={!replyContent.trim() || createReplyMutation.isPending}
                                                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                                                >
                                                    <Send className="w-3.5 h-3.5" />
                                                    {createReplyMutation.isPending ? '작성 중...' : '답글 작성'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* 대댓글 목록 */}
                                {comment.subComments && comment.subComments.length > 0 && (
                                    <div className="mt-4 ml-14 space-y-3">
                                        {comment.subComments.map((subComment) => (
                                            <div
                                                key={subComment.id}
                                                className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl"
                                            >
                                                <CornerDownRight className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
                                                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md">
                                                    {subComment.isDeleted ? '?' : subComment.account.userName.charAt(0)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    {subComment.isDeleted ? (
                                                        <span className="text-slate-400 dark:text-slate-500 italic text-sm">
                                                            {subComment.text}
                                                        </span>
                                                    ) : (
                                                        <>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="font-semibold text-slate-900 dark:text-white text-sm">
                                                                    {subComment.account.userName}
                                                                </span>
                                                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                                                    {formatDate(subComment.createdAt)}
                                                                </span>
                                                            </div>
                                                            {editingCommentId === subComment.id ? (
                                                                <div>
                                                                    <textarea
                                                                        value={editingContent}
                                                                        onChange={(e) => setEditingContent(e.target.value)}
                                                                        className="w-full px-3 py-2 border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white resize-none text-sm"
                                                                        rows={2}
                                                                    />
                                                                    <div className="mt-2 flex gap-2">
                                                                        <button
                                                                            onClick={() => handleEditSubmit(subComment.id)}
                                                                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors font-medium"
                                                                        >
                                                                            수정
                                                                        </button>
                                                                        <button
                                                                            onClick={() => {
                                                                                setEditingCommentId(null);
                                                                                setEditingContent('');
                                                                            }}
                                                                            className="px-3 py-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-700 dark:text-white text-xs rounded-lg transition-colors font-medium"
                                                                        >
                                                                            취소
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <p className="text-slate-700 dark:text-slate-300 text-sm whitespace-pre-wrap">
                                                                        {subComment.text}
                                                                    </p>
                                                                    <div className="flex gap-2 mt-2">
                                                                        {/* 대댓글에는 답글 버튼 없음 (2뎁스 제한) */}
                                                                        {user && user.id === subComment.account.id && (
                                                                            <button
                                                                                onClick={() => handleEditStart(subComment)}
                                                                                className="flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
                                                                            >
                                                                                <Pencil className="w-3 h-3" />
                                                                                수정
                                                                            </button>
                                                                        )}
                                                                        {user && (user.id === subComment.account.id || isAdmin) && (
                                                                            <button
                                                                                onClick={() => {
                                                                                    setDeleteReplyConfirmModal({ isOpen: true, replyId: subComment.id });
                                                                                }}
                                                                                className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
                                                                            >
                                                                                <Trash2 className="w-3 h-3" />
                                                                                삭제
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 알림 모달 */}
            <AlertModal
                isOpen={alertModal.isOpen}
                onClose={() => {
                    setAlertModal(prev => ({ ...prev, isOpen: false }));
                    // 삭제 완료 후 목록 페이지로 이동
                    if (shouldNavigateAfterDelete) {
                        setShouldNavigateAfterDelete(false);
                        navigate('/community');
                    }
                }}
                title={alertModal.title}
                message={alertModal.message}
                type={alertModal.type}
            />

            {/* 댓글 삭제 확인 모달 */}
            <ConfirmModal
                isOpen={deleteConfirmModal.isOpen}
                onClose={() => setDeleteConfirmModal({ isOpen: false, commentId: null })}
                onConfirm={() => {
                    if (deleteConfirmModal.commentId) {
                        deleteCommentMutation.mutate(deleteConfirmModal.commentId);
                    }
                    setDeleteConfirmModal({ isOpen: false, commentId: null });
                }}
                title="댓글 삭제"
                message="댓글을 삭제하시겠습니까? 삭제된 댓글은 복구할 수 없습니다."
            />

            {/* 답글 삭제 확인 모달 */}
            <ConfirmModal
                isOpen={deleteReplyConfirmModal.isOpen}
                onClose={() => setDeleteReplyConfirmModal({ isOpen: false, replyId: null })}
                onConfirm={() => {
                    if (deleteReplyConfirmModal.replyId) {
                        deleteCommentMutation.mutate(deleteReplyConfirmModal.replyId);
                    }
                    setDeleteReplyConfirmModal({ isOpen: false, replyId: null });
                }}
                title="답글 삭제"
                message="답글을 삭제하시겠습니까? 삭제된 답글은 복구할 수 없습니다."
            />

            {/* 게시글 삭제 확인 모달 */}
            <ConfirmModal
                isOpen={deletePostConfirmModal}
                onClose={() => setDeletePostConfirmModal(false)}
                onConfirm={confirmDeletePost}
                title="게시글 삭제"
                message="정말 이 게시글을 삭제하시겠습니까? 삭제된 게시글은 복구할 수 없습니다."
                confirmText="삭제"
                cancelText="취소"
            />
        </div>
    );
};

export default CommunityDetailPage;
