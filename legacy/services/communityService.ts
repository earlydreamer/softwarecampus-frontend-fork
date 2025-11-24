import type { Board, Comment, BoardCategory } from '../types';
import { mockBoardPosts, mockComments } from '../data/mockCommunityData';

/**
 * 커뮤니티 게시판 API 서비스
 * 실제 환경에서는 백엔드 API 호출로 대체
 */

/**
 * 게시글 목록 조회 (카테고리별 필터링)
 */
export const fetchBoardPosts = async (
  category?: BoardCategory,
  page: number = 1,
  pageSize: number = 20
): Promise<{ posts: Board[]; totalCount: number }> => {
  // 실제 환경에서는 axios를 사용하여 API 호출
  // const response = await axios.get('/api/boards', { params: { category, page, pageSize } });
  // return response.data;

  await new Promise((resolve) => setTimeout(resolve, 300)); // API 호출 시뮬레이션

  let filteredPosts = mockBoardPosts;

  // 카테고리 필터링
  if (category) {
    filteredPosts = mockBoardPosts.filter((post) => post.category === category);
  }

  // 최신순 정렬
  const sortedPosts = [...filteredPosts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // 페이지네이션
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedPosts = sortedPosts.slice(startIndex, endIndex);

  return {
    posts: paginatedPosts,
    totalCount: filteredPosts.length,
  };
};

/**
 * 게시글 상세 조회
 */
export const fetchBoardPost = async (boardId: number, userId?: string): Promise<Board> => {
  // 실제 환경: const response = await axios.get(`/api/boards/${boardId}`, { 
  //   params: { userId } // 백엔드에서 현재 사용자의 추천 여부를 확인하여 isRecommended 필드 포함
  // });
  // return response.data;

  await new Promise((resolve) => setTimeout(resolve, 200));

  const post = mockBoardPosts.find((p) => p.id === boardId);

  if (!post) {
    throw new Error('게시글을 찾을 수 없습니다.');
  }

  // Mock 환경: 로컬스토리지에서 추천 여부 확인
  // 백엔드 연동 시: 서버에서 user_id와 post_id로 추천 테이블 조회하여 isRecommended 값 반환
  const recommendKey = `recommend_${boardId}_${userId || 'anonymous'}`;
  const isRecommended = localStorage.getItem(recommendKey) === 'true';

  return {
    ...post,
    isRecommended,
  };
};

/**
 * 게시글 작성
 */
export const createBoardPost = async (
  data: Omit<Board, 'id' | 'hits' | 'recommendCount' | 'commentCount' | 'createdAt' | 'updatedAt'>
): Promise<Board> => {
  // 실제 환경: const response = await axios.post('/api/boards', data);
  // return response.data;

  await new Promise((resolve) => setTimeout(resolve, 500));

  const maxId = mockBoardPosts.length > 0 ? Math.max(...mockBoardPosts.map((p) => p.id)) : 0;

  const newPost: Board = {
    ...data,
    id: maxId + 1,
    hits: 0,
    recommendCount: 0,
    commentCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mockBoardPosts.unshift(newPost);

  return newPost;
};

/**
 * 게시글 수정
 */
export const updateBoardPost = async (
  boardId: number,
  data: Partial<Pick<Board, 'title' | 'text' | 'category'>>
): Promise<Board> => {
  // 실제 환경: const response = await axios.put(`/api/boards/${boardId}`, data);
  // return response.data;

  await new Promise((resolve) => setTimeout(resolve, 500));

  const postIndex = mockBoardPosts.findIndex((p) => p.id === boardId);

  if (postIndex === -1) {
    throw new Error('게시글을 찾을 수 없습니다.');
  }

  mockBoardPosts[postIndex] = {
    ...mockBoardPosts[postIndex],
    ...data,
    updatedAt: new Date().toISOString(),
  };

  return mockBoardPosts[postIndex];
};

/**
 * 게시글 삭제
 */
export const deleteBoardPost = async (boardId: number): Promise<void> => {
  // 실제 환경: await axios.delete(`/api/boards/${boardId}`);

  await new Promise((resolve) => setTimeout(resolve, 300));

  const postIndex = mockBoardPosts.findIndex((p) => p.id === boardId);

  if (postIndex === -1) {
    throw new Error('게시글을 찾을 수 없습니다.');
  }

  mockBoardPosts.splice(postIndex, 1);
};

/**
 * 게시글 추천
 */
export const recommendBoardPost = async (boardId: number, userId?: string): Promise<Board> => {
  // 실제 환경: 
  // const response = await axios.post(`/api/boards/${boardId}/recommend`, { userId });
  // return response.data;
  // 
  // 백엔드 구현:
  // 1. user_recommends 테이블에 (user_id, post_id) 레코드 존재 여부 확인
  // 2. 이미 추천한 경우 에러 반환 또는 무시
  // 3. 추천하지 않은 경우:
  //    - user_recommends 테이블에 레코드 삽입
  //    - board_posts.recommend_count 증가
  //    - 업데이트된 게시글 정보 반환 (isRecommended: true 포함)

  await new Promise((resolve) => setTimeout(resolve, 200));

  const post = mockBoardPosts.find((p) => p.id === boardId);

  if (!post) {
    throw new Error('게시글을 찾을 수 없습니다.');
  }

  // Mock 환경: 로컬스토리지로 중복 추천 체크
  const recommendKey = `recommend_${boardId}_${userId || 'anonymous'}`;
  const alreadyRecommended = localStorage.getItem(recommendKey) === 'true';

  if (alreadyRecommended) {
    throw new Error('이미 추천한 게시글입니다.');
  }

  // 추천 처리 (undefined/null을 0으로 처리)
  post.recommendCount = (post.recommendCount ?? 0) + 1;
  localStorage.setItem(recommendKey, 'true');

  return {
    ...post,
    isRecommended: true,
  };
};

/**
 * 댓글 목록 조회
 */
export const fetchComments = async (boardId: number): Promise<Comment[]> => {
  // 실제 환경: const response = await axios.get(`/api/boards/${boardId}/comments`);
  // return response.data;
  // 백엔드에서 isDeleted = false인 댓글만 반환하거나, 
  // 대댓글이 있는 경우 isDeleted = true인 댓글도 포함하여 반환

  await new Promise((resolve) => setTimeout(resolve, 200));

  // 백엔드 연동 시: 서버에서 이미 필터링된 데이터를 받음
  // 현재는 프론트에서 필터링 (실제로는 백엔드 쿼리에서 처리)
  const comments = mockComments
    .filter((c) => c.boardId === boardId)
    .filter((c) => {
      // 삭제되지 않은 댓글은 항상 표시
      if (!c.isDeleted) return true;
      
      // 삭제된 댓글은 대댓글이 있는 경우만 표시
      const hasReplies = mockComments.some(
        (reply) => reply.topCommentId === c.id && !reply.isDeleted
      );
      return hasReplies;
    })
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return comments;
};

/**
 * 댓글 작성
 */
export const createComment = async (
  boardId: number,
  text: string,
  topCommentId?: number
): Promise<Comment> => {
  // 실제 환경: const response = await axios.post(`/api/boards/${boardId}/comments`, { text, topCommentId });
  // return response.data;

  await new Promise((resolve) => setTimeout(resolve, 300));

  const maxId = mockComments.length > 0 ? Math.max(...mockComments.map((c) => c.id)) : 0;

  const newComment: Comment = {
    id: maxId + 1,
    boardId,
    text,
    author: {
      id: 999, // 임시 사용자 ID
      userName: '현재 사용자',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    topCommentId,
    isDeleted: false,
  };

  mockComments.push(newComment);

  // 게시글의 댓글 수 증가 (삭제되지 않은 댓글만 카운트)
  const post = mockBoardPosts.find((p) => p.id === boardId);
  if (post && post.commentCount !== undefined) {
    post.commentCount = mockComments.filter(
      (c) => c.boardId === boardId && !c.isDeleted
    ).length;
  }

  return newComment;
};

/**
 * 댓글 수정
 */
export const updateComment = async (commentId: number, text: string): Promise<Comment> => {
  // 실제 환경: const response = await axios.put(`/api/boards/comments/${commentId}`, { text });
  // return response.data;

  await new Promise((resolve) => setTimeout(resolve, 300));

  const commentIndex = mockComments.findIndex((c) => c.id === commentId);

  if (commentIndex === -1) {
    throw new Error('댓글을 찾을 수 없습니다.');
  }

  mockComments[commentIndex] = {
    ...mockComments[commentIndex],
    text,
    updatedAt: new Date().toISOString(),
  };

  return mockComments[commentIndex];
};

/**
 * 댓글 삭제 (Soft Delete)
 */
export const deleteComment = async (commentId: number): Promise<void> => {
  // 실제 환경: await axios.patch(`/api/boards/comments/${commentId}`, { isDeleted: true });
  // 또는: await axios.delete(`/api/boards/comments/${commentId}`);
  // 
  // 백엔드 구현 방향:
  // 1. DELETE 요청 시 실제 삭제가 아닌 isDeleted = true로 업데이트
  // 2. text를 "삭제된 댓글입니다."로 변경
  // 3. updatedAt 갱신
  // 4. 게시글의 commentCount 재계산 (isDeleted = false인 댓글만 카운트)

  await new Promise((resolve) => setTimeout(resolve, 300));

  const commentIndex = mockComments.findIndex((c) => c.id === commentId);

  if (commentIndex === -1) {
    throw new Error('댓글을 찾을 수 없습니다.');
  }

  const comment = mockComments[commentIndex];

  // Soft Delete 처리 (DB에서는 실제 삭제하지 않음)
  mockComments[commentIndex] = {
    ...comment,
    isDeleted: true,
    text: '삭제된 댓글입니다.',
    updatedAt: new Date().toISOString(),
  };

  // 게시글의 댓글 수 업데이트 (삭제되지 않은 댓글만 카운트)
  // 백엔드에서도 commentCount를 재계산하여 업데이트 필요
  const post = mockBoardPosts.find((p) => p.id === comment.boardId);
  if (post && post.commentCount !== undefined) {
    post.commentCount = mockComments.filter(
      (c) => c.boardId === comment.boardId && !c.isDeleted
    ).length;
  }
};
