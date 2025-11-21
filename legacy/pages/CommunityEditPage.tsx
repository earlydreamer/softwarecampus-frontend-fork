import { useState, useEffect, lazy, Suspense } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchBoardPost, updateBoardPost } from '../services/communityService';
import type { BoardCategory } from '../types';
import { BOARD_CATEGORY_LABELS } from '../types';

// Tiptap 에디터를 lazy load
const TiptapEditor = lazy(() => import('../components/editor/TiptapEditor'));

/**
 * 게시글 수정 페이지
 */
const CommunityEditPage = () => {
  const { postId } = useParams<{ postId: string }>();
  const postIdNumber = postId ? parseInt(postId, 10) : NaN;
  const isValidPostId = !isNaN(postIdNumber) && postIdNumber > 0;
  
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [category, setCategory] = useState<BoardCategory>('CAREER');

  // 게시글 조회
  const { data: post, isLoading } = useQuery({
    queryKey: ['boardPost', postIdNumber],
    queryFn: () => fetchBoardPost(postIdNumber),
    enabled: isValidPostId,
  });

  // 게시글 데이터로 초기화
  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setText(post.text);
      setCategory(post.category);
    }
  }, [post]);

  // 게시글 수정 mutation
  const updatePostMutation = useMutation({
    mutationFn: (data: { title: string; text: string; category: BoardCategory }) =>
      updateBoardPost(Number(postId), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boardPost', postId] });
      queryClient.invalidateQueries({ queryKey: ['boardPosts'] });
      alert('게시글이 수정되었습니다.');
      navigate(`/community/${postId}`);
    },
    onError: (error: any) => {
      console.error('게시글 수정 실패:', error);
      
      // 백엔드에서 반환된 에러 메시지 처리
      const errorMessage = error?.response?.data?.error 
        || error?.response?.data?.message 
        || error?.message
        || '게시글 수정에 실패했습니다.';
      
      alert(errorMessage);
    },
  });

  // 폼 제출
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

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

    updatePostMutation.mutate({
      title,
      text,
      category,
    });
  };

  if (!isValidPostId) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">유효하지 않은 게시글 ID입니다.</p>
          <button
            onClick={() => navigate('/community')}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">게시글을 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">글 수정</h1>
          <p className="text-gray-600 dark:text-gray-400">
            게시글을 수정합니다.
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
              onClick={() => navigate(`/community/${postId}`)}
              className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-white rounded-lg transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={updatePostMutation.isPending}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updatePostMutation.isPending ? '수정 중...' : '수정 완료'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommunityEditPage;
