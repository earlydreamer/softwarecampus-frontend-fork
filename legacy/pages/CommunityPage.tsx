import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import type { BoardCategory } from '../types';
import { BOARD_CATEGORY_LABELS } from '../types';
import { fetchBoardPosts } from '../services/communityService';
import { Paperclip, MessageSquare, ThumbsUp, Eye } from '../components/icons/Icons';

/**
 * 커뮤니티 게시판 목록 페이지
 */
const CommunityPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // 허용된 카테고리 목록
  const allowedCategories: BoardCategory[] = ['NOTICE', 'CAREER', 'CODING'];
  
  // 카테고리 검증
  const categoryParam = searchParams.get('category');
  const currentCategory: BoardCategory | undefined = 
    categoryParam && allowedCategories.includes(categoryParam as BoardCategory)
      ? (categoryParam as BoardCategory)
      : undefined;
  
  // 페이지 번호 검증
  const pageParam = searchParams.get('page');
  const parsedPage = pageParam ? parseInt(pageParam, 10) : 1;
  const currentPage = !isNaN(parsedPage) && parsedPage >= 1 ? parsedPage : 1;

  // 게시글 목록 조회
  const { data, isLoading, error } = useQuery({
    queryKey: ['boardPosts', currentCategory, currentPage],
    queryFn: () => fetchBoardPosts(currentCategory, currentPage, 20),
  });

  // 카테고리 변경
  const handleCategoryChange = (category: BoardCategory | undefined) => {
    const newParams = new URLSearchParams(searchParams);
    if (category) {
      newParams.set('category', category);
    } else {
      newParams.delete('category');
    }
    newParams.set('page', '1'); // 카테고리 변경 시 첫 페이지로
    setSearchParams(newParams);
  };

  // 페이지 변경
  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const diffHours = Math.floor(diff / (1000 * 60 * 60));
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (diffHours < 24) {
      return `${diffHours}시간 전`;
    } else if (diffDays < 7) {
      return `${diffDays}일 전`;
    } else {
      return date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
    }
  };

  const categories: (BoardCategory | undefined)[] = [undefined, 'NOTICE', 'CAREER', 'CODING'];

  // 총 페이지 수 계산
  const totalPages = data ? Math.ceil(data.totalCount / 20) : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">커뮤니티</h1>
          <p className="text-gray-600 dark:text-gray-400">
            소프트웨어캠퍼스 수강생들과 소통하고 정보를 공유하세요.
          </p>
        </div>

        {/* 카테고리 탭 */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8">
            {categories.map((category) => (
              <button
                key={category || 'all'}
                onClick={() => handleCategoryChange(category)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  currentCategory === category
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {category ? BOARD_CATEGORY_LABELS[category] : '전체'}
              </button>
            ))}
          </nav>
        </div>

        {/* 글쓰기 버튼 */}
        <div className="mb-4 flex justify-end">
          <Link
            to="/community/write"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            글쓰기
          </Link>
        </div>

        {/* 게시글 목록 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          {/* 테이블 헤더 */}
          <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-2.5 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300">
            <div className="col-span-1 text-center">번호</div>
            <div className="col-span-1 text-center whitespace-nowrap">카테고리</div>
            <div className="col-span-5">제목</div>
            <div className="col-span-2 text-center">작성자</div>
            <div className="col-span-1 text-center">조회</div>
            <div className="col-span-1 text-center">추천</div>
            <div className="col-span-1 text-center">작성일</div>
          </div>

          {/* 로딩 상태 */}
          {isLoading && (
            <div className="py-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">로딩 중...</p>
            </div>
          )}

          {/* 에러 상태 */}
          {error && (
            <div className="py-12 text-center">
              <p className="text-red-600 dark:text-red-400">게시글을 불러오는데 실패했습니다.</p>
            </div>
          )}

          {/* 게시글 목록 */}
          {data && data.posts.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-gray-600 dark:text-gray-400">등록된 게시글이 없습니다.</p>
            </div>
          )}

          {data &&
            data.posts.map((post) => (
              <div
                key={post.id}
                className="border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                {/* 데스크톱 레이아웃 */}
                <Link
                  to={`/community/${post.id}`}
                  className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-3 items-center"
                >
                  <div className="col-span-1 text-center text-sm text-gray-600 dark:text-gray-400">
                    {post.id}
                  </div>
                  <div className="col-span-1 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${
                        post.category === 'NOTICE'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : post.category === 'CAREER'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}
                    >
                      {BOARD_CATEGORY_LABELS[post.category]}
                    </span>
                  </div>
                  <div className="col-span-5">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 truncate">
                        {post.title}
                      </h3>
                      {post.hasAttachment && <Paperclip className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />}
                      {post.commentCount && post.commentCount > 0 && (
                        <span className="flex items-center gap-0.5 text-blue-600 dark:text-blue-400 text-xs flex-shrink-0">
                          <MessageSquare className="w-3.5 h-3.5" />
                          {post.commentCount}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="col-span-2 text-center text-sm text-gray-600 dark:text-gray-400">
                    {post.author.userName}
                  </div>
                  <div className="col-span-1 text-center text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    {post.hits}
                  </div>
                  <div className="col-span-1 text-center text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    {post.recommendCount}
                  </div>
                  <div className="col-span-1 text-center text-gray-600 dark:text-gray-400 text-xs">
                    {formatDate(post.createdAt)}
                  </div>
                </Link>

                {/* 모바일 레이아웃 */}
                <Link to={`/community/${post.id}`} className="block md:hidden px-4 py-4">
                  <div className="flex items-start justify-between mb-2">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        post.category === 'NOTICE'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : post.category === 'CAREER'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}
                    >
                      {BOARD_CATEGORY_LABELS[post.category]}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(post.createdAt)}
                    </span>
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    {post.title}
                    {post.hasAttachment && <Paperclip className="w-4 h-4 text-gray-400" />}
                  </h3>
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>{post.author.userName}</span>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {post.hits}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        {post.commentCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4" />
                        {post.recommendCount}
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                이전
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityPage;
