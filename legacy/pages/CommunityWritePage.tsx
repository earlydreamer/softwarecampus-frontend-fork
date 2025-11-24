import { useState, lazy, Suspense, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createBoardPost } from '../services/communityService';
import { useAuthStore } from '../store/authStore';
import type { BoardCategory } from '../types';
import { BOARD_CATEGORY_LABELS } from '../types';

// Tiptap 에디터를 lazy load
const TiptapEditor = lazy(() => import('../components/editor/TiptapEditor'));

/**
 * 게시글 작성 페이지
 */
const CommunityWritePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuthStore();

  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [category, setCategory] = useState<BoardCategory>('CAREER');

  // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!isAuthenticated) {
      alert('로그인이 필요한 서비스입니다.');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // 게시글 작성 mutation
  const createPostMutation = useMutation({
    mutationFn: createBoardPost,
    onSuccess: (newPost) => {
      // 캐시 무효화는 백그라운드에서 실행
      queryClient.invalidateQueries({ queryKey: ['boardPosts'] });
      alert('게시글이 작성되었습니다.');
      navigate(`/community/${newPost.id}`);
    },
    onError: (error: any) => {
      console.error('게시글 작성 실패:', error);
      
      // 백엔드에서 반환된 에러 메시지 처리
      const errorMessage = error?.response?.data?.error 
        || error?.response?.data?.message 
        || error?.message
        || '게시글 작성에 실패했습니다.';
      
      alert(errorMessage);
    },
  });

  // 폼 제출
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 인증 상태 재확인
    if (!isAuthenticated || !user) {
      alert('로그인이 필요한 서비스입니다.');
      navigate('/login');
      return;
    }

    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }

    // DB 제한에 맞춘 길이 검증 (VARCHAR(255))
    if (title.length > 255) {
      alert('제목은 255자를 초과할 수 없습니다.');
      return;
    }

    if (!text.trim() || text === '<p></p>') {
      alert('내용을 입력해주세요.');
      return;
    }

    console.log('게시글 작성 시작:', { title, text, category, user });

    createPostMutation.mutate({
      title,
      text,
      category,
      author: {
        // Mock 환경: user.id가 문자열 ("admin", "user" 등)
        // 실제 백엔드 환경: user.id가 숫자형 문자열 ("1", "2" 등)
        id: (() => {
          const parsedId = parseInt(user.id, 10);
          // 숫자로 변환 가능하면 그 값 사용, 아니면 해시코드 생성
          if (!isNaN(parsedId) && parsedId > 0) {
            return parsedId;
          }
          // Mock 환경: 문자열 ID를 간단한 해시로 변환
          return Math.abs(user.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % 1000 + 1;
        })(),
        userName: (user as any).userName || user.id,
      },
      isSecret: false,
      hasAttachment: false,
    });
  };

  // 로그인하지 않은 경우 빈 화면 표시 (리다이렉트 중)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">글쓰기</h1>
          <p className="text-gray-600 dark:text-gray-400">
            커뮤니티에 새로운 글을 작성합니다.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-4">
            {/* 카테고리 선택 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                카테고리
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as BoardCategory)}
                className="w-full md:w-64 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="CAREER">{BOARD_CATEGORY_LABELS.CAREER}</option>
                <option value="CODING">{BOARD_CATEGORY_LABELS.CODING}</option>
                <option value="NOTICE">{BOARD_CATEGORY_LABELS.NOTICE}</option>
              </select>
            </div>

            {/* 제목 입력 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                제목 <span className="text-gray-500 text-xs">({title.length}/255)</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목을 입력하세요"
                maxLength={255}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* 내용 입력 (Tiptap 에디터) */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                내용
              </label>
              <Suspense
                fallback={
                  <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800 min-h-[400px] flex items-center justify-center">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                      <p className="text-gray-600 dark:text-gray-400">에디터 로딩 중...</p>
                    </div>
                  </div>
                }
              >
                <TiptapEditor content={text} onChange={setText} />
              </Suspense>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => navigate('/community')}
              className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-white rounded-lg transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={createPostMutation.isPending}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createPostMutation.isPending ? '작성 중...' : '작성 완료'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommunityWritePage;
