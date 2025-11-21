import { useState, lazy, Suspense } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Send, X } from 'lucide-react';
import { createBoardPost } from '../services/communityService';
import type { BoardCategory } from '../types';
import { BOARD_CATEGORY_LABELS } from '../types';

// Tiptap 에디터를 lazy load
const TiptapEditor = lazy(() => import('../components/editor/TiptapEditor'));

const CommunityWritePage = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    
    // Mock user (TODO: 실제 인증 시스템으로 대체)
    const user = { id: 1, userName: '현재사용자' };

    const [title, setTitle] = useState('');
    const [text, setText] = useState('');
    const [category, setCategory] = useState<BoardCategory>('QUESTION');

    // 게시글 작성 mutation
    const createPostMutation = useMutation({
        mutationFn: createBoardPost,
        onSuccess: (newPost) => {
            queryClient.invalidateQueries({ queryKey: ['boardPosts'] });
            alert('게시글이 작성되었습니다.');
            navigate(`/community/${newPost.id}`);
        },
        onError: (error: Error) => {
            console.error('게시글 작성 실패:', error);
            alert(error.message || '게시글 작성에 실패했습니다.');
        },
    });

    // 폼 제출
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            alert('로그인이 필요한 서비스입니다.');
            navigate('/login');
            return;
        }

        if (!title.trim()) {
            alert('제목을 입력해주세요.');
            return;
        }

        if (title.length > 255) {
            alert('제목은 255자를 초과할 수 없습니다.');
            return;
        }

        if (!text.trim() || text === '<p></p>') {
            alert('내용을 입력해주세요.');
            return;
        }

        createPostMutation.mutate({
            title,
            text,
            category,
            author: {
                id: user.id,
                userName: user.userName,
            },
            isSecret: false,
            hasAttachment: false,
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8">
            <div className="max-w-5xl mx-auto px-4">
                {/* 헤더 */}
                <div className="mb-6">
                    <Link
                        to="/community"
                        className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">목록으로</span>
                    </Link>
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
                                        className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                                            category === cat
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
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="제목을 입력하세요"
                                maxLength={255}
                                className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-white transition-all text-lg font-medium"
                            />
                        </div>

                        {/* 내용 입력 (Tiptap 에디터) */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                                내용
                            </label>
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
                                <TiptapEditor content={text} onChange={setText} />
                            </Suspense>
                        </div>
                    </div>

                    {/* 버튼 */}
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <button
                            type="button"
                            onClick={() => {
                                if (title || text) {
                                    if (window.confirm('작성 중인 내용이 있습니다. 정말 취소하시겠습니까?')) {
                                        navigate('/community');
                                    }
                                } else {
                                    navigate('/community');
                                }
                            }}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                        >
                            <X className="w-5 h-5" />
                            취소
                        </button>
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
            </div>
        </div>
    );
};

export default CommunityWritePage;
