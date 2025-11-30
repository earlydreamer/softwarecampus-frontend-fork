import apiClient from './api/client';
import type { Board, Comment, BoardCategory } from '../types';
import type { ApiBoardListResponse, ApiBoardResponseDTO, ApiCommentDTO } from './api/types';

// DTO -> Board 매핑
const mapDtoToBoard = (dto: ApiBoardResponseDTO): Board => {
    return {
        id: dto.id,
        title: dto.title,
        text: dto.text,
        category: dto.category as BoardCategory,
        account: {
            id: dto.accountId,
            userName: dto.userNickName,
            avatar: undefined, // 백엔드 미제공
        },
        hits: dto.hits,
        secret: dto.secret,
        createdAt: dto.createdAt,
        updatedAt: undefined, // 백엔드 미제공

        likeCount: dto.likeCount,
        isRecommended: dto.like,
        isOwner: dto.owner,

        commentCount: dto.boardComments.length,
        hasAttachment: dto.boardAttachs.length > 0,
        isSecret: dto.secret,

        // 상세 조회 시 댓글 포함
        comments: dto.boardComments.map(mapDtoToComment),
    };
};

// DTO -> Comment 매핑
const mapDtoToComment = (dto: ApiCommentDTO): Comment => {
    return {
        id: dto.id,
        boardId: undefined, // 문맥상 알 수 있음
        text: dto.text,
        account: {
            id: dto.accountId,
            userName: dto.userNickName,
        },
        createdAt: dto.createdAt,
        subComments: dto.subComments ? dto.subComments.map(mapDtoToComment) : [],
    };
};

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
): Promise<{ posts: Board[], total: number }> => {
    try {
        const params: any = { page, limit };
        if (category) params.category = category;
        if (searchKeyword) params.keyword = searchKeyword;
        if (searchType) params.searchType = searchType;
        // sortType은 백엔드 지원 여부 확인 필요 (일단 생략)

        const response = await apiClient.get<ApiBoardListResponse[]>('/api/boards', { params });

        // 목록 응답 매핑
        const posts = response.data.map(dto => ({
            id: dto.id,
            title: dto.title,
            text: '', // 목록에는 본문 없음
            category: dto.category as BoardCategory,
            account: {
                id: 0, // 목록에는 작성자 ID 없음
                userName: dto.userNickName,
            },
            hits: 0, // 목록에는 조회수 없음? (DTO 확인 필요)
            secret: dto.secret,
            createdAt: dto.createdAt,
            likeCount: 0, // DTO에 likeCount 없음? (ApiBoardListResponse 확인 필요)
            isRecommended: dto.like,
        } as Board));

        return { posts, total: posts.length }; // 페이징 정보가 헤더나 별도 필드에 있는지 확인 필요
    } catch (error) {
        console.error('Failed to fetch board posts:', error);
        return { posts: [], total: 0 };
    }
};

/**
 * 게시글 상세 조회
 */
export const fetchBoardPost = async (postId: number, userId?: number): Promise<Board> => {
    try {
        const response = await apiClient.get<ApiBoardResponseDTO>(`/api/boards/${postId}`);
        return mapDtoToBoard(response.data);
    } catch (error) {
        console.error(`Failed to fetch board post ${postId}:`, error);
        throw error;
    }
};

/**
 * 댓글 목록 조회 (상세 조회에 포함되어 있으므로 별도 호출 불필요할 수 있으나, 호환성 유지)
 */
export const fetchComments = async (postId: number): Promise<Comment[]> => {
    try {
        const post = await fetchBoardPost(postId);
        return post.comments || [];
    } catch (error) {
        return [];
    }
};

/**
 * 게시글 추천
 */
export const recommendBoardPost = async (postId: number, userId: number): Promise<void> => {
    await apiClient.post(`/api/boards/${postId}/like`);
};

/**
 * 댓글 작성
 */
export const createComment = async (postId: number, text: string): Promise<Comment> => {
    const response = await apiClient.post<ApiCommentDTO>(`/api/boards/${postId}/comments`, { text });
    return mapDtoToComment(response.data);
};

/**
 * 댓글 수정
 */
export const updateComment = async (commentId: number, postId: number, text: string): Promise<Comment> => {
    const response = await apiClient.patch<ApiCommentDTO>(`/api/boards/comments/${commentId}`, { text });
    return mapDtoToComment(response.data);
};

/**
 * 댓글 삭제
 */
export const deleteComment = async (commentId: number): Promise<void> => {
    await apiClient.delete(`/api/boards/comments/${commentId}`);
};

/**
 * 게시글 작성
 */
export const createBoardPost = async (data: {
    title: string;
    text: string;
    category: BoardCategory;
    account: { id: number; userName: string; }; // 사용 안함 (토큰 사용)
    isSecret: boolean;
    hasAttachment: boolean; // 파일 업로드 별도 처리 필요
}): Promise<Board> => {
    // 파일 업로드는 별도 API (/api/boards/upload) 사용 필요
    // 여기서는 텍스트 데이터만 전송
    const response = await apiClient.post<ApiBoardResponseDTO>('/api/boards', {
        title: data.title,
        text: data.text,
        category: data.category,
        isSecret: data.isSecret,
    });
    return mapDtoToBoard(response.data);
};
