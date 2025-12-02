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
        like: dto.like,
        owner: dto.owner,

        commentCount: dto.boardComments.length,
        hasAttachment: dto.boardAttachs.length > 0,
        isSecret: dto.secret,

        // 상세 조회 시 댓글 포함
        comments: dto.boardComments.map(mapDtoToComment),
        // 첨부파일 목록
        attachments: dto.boardAttachs.map(attach => ({
            id: attach.id,
            originalFile: attach.originalFile,
            savedFile: attach.savedFile,
            fileSize: attach.fileSize,
        })),
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
    _sortType?: 'latest' | 'popular' | 'views' | 'comments',
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
            like: false, // 목록 API에서는 제공하지 않음
            commentCount: dto.commentCount,
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
export const fetchBoardPost = async (postId: number): Promise<Board> => {
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
export const recommendBoardPost = async (postId: number): Promise<void> => {
    await apiClient.post(`/api/boards/${postId}/recommends`);
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
    const response = await apiClient.patch<ApiCommentDTO>(`/api/boards/${postId}/comments/${commentId}`, { text });
    return mapDtoToComment(response.data);
};

/**
 * 댓글 삭제
 */
export const deleteComment = async (commentId: number, postId: number): Promise<void> => {
    await apiClient.delete(`/api/boards/${postId}/comments/${commentId}`);
};

/**
 * 게시글 작성 (첨부파일 포함)
 * 백엔드는 multipart/form-data로 게시글과 파일을 함께 받음
 */
export const createBoardPost = async (data: {
    title: string;
    text: string;
    category: BoardCategory;
    account: { id: number; userName: string; }; // 사용 안함 (토큰 사용)
    isSecret: boolean;
    hasAttachment: boolean;
    files?: File[];
}): Promise<Board> => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('text', data.text);
    formData.append('category', data.category);
    formData.append('isSecret', String(data.isSecret));

    // 파일 첨부
    if (data.files && data.files.length > 0) {
        data.files.forEach(file => {
            formData.append('files', file);
        });
    }

    const response = await apiClient.post<ApiBoardResponseDTO>('/api/boards', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return mapDtoToBoard(response.data);
};

/**
 * 게시글 수정 (첨부파일 포함)
 * 백엔드는 multipart/form-data로 게시글과 파일을 함께 받음
 * deleteAttachIds: 삭제할 기존 첨부파일 ID 목록
 */
export const updateBoardPost = async (
    postId: number,
    data: {
        title: string;
        text: string;
        category: BoardCategory;
        isSecret: boolean;
        files?: File[];
        deleteAttachIds?: number[];
    }
): Promise<void> => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('text', data.text);
    formData.append('category', data.category);
    formData.append('isSecret', String(data.isSecret));

    // 삭제할 첨부파일 ID
    if (data.deleteAttachIds && data.deleteAttachIds.length > 0) {
        data.deleteAttachIds.forEach(id => {
            formData.append('deleteAttachIds', String(id));
        });
    }

    // 새 파일 첨부
    if (data.files && data.files.length > 0) {
        data.files.forEach(file => {
            formData.append('files', file);
        });
    }

    await apiClient.patch(`/api/boards/${postId}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

/**
 * 게시글 삭제
 */
export const deleteBoardPost = async (postId: number): Promise<void> => {
    await apiClient.delete(`/api/boards/${postId}`);
};

/**
 * 첨부파일 다운로드 URL 생성
 */
export const getBoardAttachmentDownloadUrl = (boardId: number, attachId: number): string => {
    return `/api/boards/${boardId}/boardAttachs/${attachId}/download`;
};
