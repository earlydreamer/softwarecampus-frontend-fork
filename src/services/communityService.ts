import type { Board, Comment, BoardCategory } from '../types';

/**
 * 게시글 목록 조회
 */
export const fetchBoardPosts = async (
    category?: BoardCategory,
    page: number = 1,
    limit: number = 20,
    searchKeyword?: string,
    sortType?: 'latest' | 'popular' | 'views' | 'comments',
    searchType?: 'all' | 'title' | 'content' | 'title_content' | 'author' | 'comment'
) => {
    const { fetchBoardPosts: mockFetch } = await import('./mockData');
    return mockFetch(category, page, limit, searchKeyword, sortType, searchType);
};

/**
 * 게시글 상세 조회
 */
export const fetchBoardPost = async (postId: number, userId?: number): Promise<Board> => {
    // 시뮬레이션: 네트워크 지연
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const { mockBoardPosts } = await import('./mockData');
    const post = mockBoardPosts.find(p => p.id === postId);
    
    if (!post) {
        throw new Error('게시글을 찾을 수 없습니다.');
    }
    
    // 조회수 증가 시뮬레이션
    return {
        ...post,
        hits: post.hits + 1,
        isRecommended: userId ? Math.random() > 0.7 : false, // 30% 확률로 이미 추천했다고 가정
    };
};

/**
 * 댓글 목록 조회
 */
export const fetchComments = async (postId: number): Promise<Comment[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Mock 댓글 데이터
    const mockComments: Comment[] = Array.from({ length: Math.floor(Math.random() * 10) + 3 }).map((_, i) => ({
        id: i + 1,
        boardId: postId,
        author: {
            id: i + 100,
            userName: `사용자${i + 1}`,
        },
        text: i === 0 ? '좋은 정보 감사합니다!' : 
              i === 1 ? '저도 궁금했던 내용이에요. 덕분에 많이 배워갑니다.' :
              i === 2 ? '정말 유익한 글이네요 👍' :
              `댓글 내용 ${i + 1}입니다. 이 글에 대한 제 생각을 공유합니다.`,
        createdAt: new Date(Date.now() - (i * 3600000)).toISOString(),
        isDeleted: false,
    }));
    
    return mockComments;
};

/**
 * 게시글 추천
 */
export const recommendBoardPost = async (postId: number, userId: number): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log(`게시글 ${postId}을(를) 사용자 ${userId}이(가) 추천했습니다.`);
};

/**
 * 댓글 작성
 */
export const createComment = async (postId: number, text: string): Promise<Comment> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    if (text.length > 500) {
        throw new Error('댓글은 500자를 초과할 수 없습니다.');
    }
    
    const newComment: Comment = {
        id: Date.now(),
        boardId: postId,
        author: {
            id: 1,
            userName: '현재사용자',
        },
        text,
        createdAt: new Date().toISOString(),
        isDeleted: false,
    };
    
    return newComment;
};

/**
 * 댓글 수정
 */
export const updateComment = async (commentId: number, text: string): Promise<Comment> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const updatedComment: Comment = {
        id: commentId,
        boardId: 1,
        author: {
            id: 1,
            userName: '현재사용자',
        },
        text,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date().toISOString(),
        isDeleted: false,
    };
    
    return updatedComment;
};

/**
 * 댓글 삭제
 */
export const deleteComment = async (commentId: number): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log(`댓글 ${commentId}이(가) 삭제되었습니다.`);
};

/**
 * 게시글 작성
 */
export const createBoardPost = async (data: {
    title: string;
    text: string;
    category: BoardCategory;
    author: {
        id: number;
        userName: string;
    };
    isSecret: boolean;
    hasAttachment: boolean;
}): Promise<Board> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (data.title.length > 255) {
        throw new Error('제목은 255자를 초과할 수 없습니다.');
    }
    
    if (!data.text.trim() || data.text === '<p></p>') {
        throw new Error('내용을 입력해주세요.');
    }
    
    const newPost: Board = {
        id: Date.now(),
        title: data.title,
        text: data.text,
        category: data.category as BoardCategory,
        author: data.author,
        hits: 0,
        secret: data.isSecret,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        recommendCount: 0,
        commentCount: 0,
        hasAttachment: data.hasAttachment,
        isRecommended: false,
    };
    
    console.log('새 게시글 작성:', newPost);
    return newPost;
};
