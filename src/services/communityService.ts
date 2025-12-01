import apiClient from './api/client';
import type { Board, Comment, BoardCategory, BoardAttachment } from '../types';
import type { ApiBoardListResponse, ApiBoardResponseDTO, ApiCommentDTO, ApiBoardAttachDTO, SpringPage } from './api/types';

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
        
        // 첨부파일 매핑
        attachments: dto.boardAttachs.map(mapDtoToAttachment),
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
        topCommentId: dto.topCommentId, // 대댓글인 경우 부모 댓글 ID
        subComments: dto.subComments ? dto.subComments.map(mapDtoToComment) : [],
    };
};

// DTO -> BoardAttachment 매핑
const mapDtoToAttachment = (dto: ApiBoardAttachDTO): BoardAttachment => {
    return {
        id: dto.id,
        originName: dto.originalFile,
        savedName: dto.savedFile,
        fileSize: dto.fileSize,
    };
};

/**
 * 게시글 목록 조회
 * 백엔드 파라미터: pageNo, searchText (page, keyword 아님!)
 */
export const fetchBoardPosts = async (
    category?: BoardCategory,
    page: number = 1,
    _limit: number = 20,  // 백엔드 미지원, 무시됨
    searchKeyword?: string,
    _sortType?: 'latest' | 'popular' | 'views' | 'comments',  // 백엔드 미지원
    searchType?: 'all' | 'title' | 'content' | 'title_content' | 'author' | 'comment'
): Promise<{ posts: Board[], total: number, totalPages: number }> => {
    try {
        // 백엔드 파라미터명에 맞춤: pageNo, searchText
        const params: Record<string, any> = { pageNo: page };
        if (category) params.category = category;
        if (searchKeyword) params.searchText = searchKeyword;  // keyword → searchText
        if (searchType) params.searchType = searchType;

        // 백엔드는 Spring Page 객체 반환
        const response = await apiClient.get<SpringPage<ApiBoardListResponse>>('/api/boards', { params });

        // 목록 응답 매핑
        const posts = response.data.content.map(dto => ({
            id: dto.id,
            title: dto.title,
            text: '', // 목록에는 본문 없음
            category: dto.category as BoardCategory,
            account: {
                id: dto.accountId,
                userName: dto.userNickName,
            },
            hits: dto.hits ?? 0, // 조회수
            secret: dto.secret,
            createdAt: dto.createdAt,
            likeCount: dto.likeCount ?? 0, // 추천수
            like: false, // 목록에서는 좋아요 여부 미제공
            commentCount: dto.commentsCount,  // commentsCount로 변경
        } as Board));

        return { 
            posts, 
            total: response.data.totalElements,
            totalPages: response.data.totalPages 
        };
    } catch (error) {
        console.error('Failed to fetch board posts:', error);
        return { posts: [], total: 0, totalPages: 0 };
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
 * 백엔드 DTO에서 boardId가 @NotNull이므로 요청 본문에 포함 필요
 * @param postId 게시글 ID
 * @param text 댓글 내용
 * @param topCommentId 대댓글인 경우 상위 댓글 ID
 */
export const createComment = async (
    postId: number, 
    text: string, 
    topCommentId?: number
): Promise<Comment> => {
    const body: { boardId: number; text: string; topCommentId?: number } = { 
        boardId: postId,
        text 
    };
    if (topCommentId) {
        body.topCommentId = topCommentId;
    }
    const response = await apiClient.post<ApiCommentDTO>(`/api/boards/${postId}/comments`, body);
    return mapDtoToComment(response.data);
};

/**
 * 댓글 수정
 * 백엔드 DTO에서 id가 @NotNull이므로 요청 본문에 포함 필요
 */
export const updateComment = async (commentId: number, postId: number, text: string): Promise<Comment> => {
    const response = await apiClient.patch<ApiCommentDTO>(`/api/boards/${postId}/comments/${commentId}`, { 
        id: commentId,  // 백엔드 @NotNull 필드
        text 
    });
    return mapDtoToComment(response.data);
};

/**
 * 댓글 삭제
 */
export const deleteComment = async (commentId: number, postId: number): Promise<void> => {
    await apiClient.delete(`/api/boards/${postId}/comments/${commentId}`);
};

/**
 * 게시글 작성
 * 백엔드는 multipart/form-data 형식 요구 (JSON 아님!)
 * 필드명: secret (isSecret 아님!)
 */
export const createBoardPost = async (data: {
    title: string;
    text: string;
    category: BoardCategory;
    account?: { id: number; userName: string; }; // 사용 안함 (토큰 사용)
    isSecret: boolean;
    hasAttachment?: boolean;
}, files?: File[]): Promise<Board> => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('text', data.text);
    formData.append('category', data.category);
    formData.append('secret', String(data.isSecret));  // isSecret → secret
    
    // 첨부파일 추가
    if (files && files.length > 0) {
        files.forEach(file => formData.append('files', file));
    }

    const response = await apiClient.post('/api/boards', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    
    // 백엔드는 201 Created + Location 헤더만 반환 (본문 없음)
    // Location 헤더에서 생성된 게시글 ID 추출
    const locationHeader = response.headers['location'] || response.headers['Location'];
    if (locationHeader) {
        const match = locationHeader.match(/\/api\/boards\/(\d+)/);
        if (match) {
            const newPostId = parseInt(match[1], 10);
            return fetchBoardPost(newPostId);
        }
    }
    
    // Location 헤더가 없으면 기본 Board 객체 반환
    return {
        id: 0,
        title: data.title,
        text: data.text,
        category: data.category,
        account: { id: 0, userName: '' },
        hits: 0,
        secret: data.isSecret,
        createdAt: new Date().toISOString(),
        likeCount: 0,
    };
};

/**
 * 게시글 수정
 * 백엔드는 204 No Content 반환 (본문 없음)
 */
export const updateBoardPost = async (
    postId: number,
    data: {
        title?: string;
        text?: string;
        secret?: boolean;
        category?: BoardCategory;
    },
    files?: File[],
    deleteAttachIds?: number[]
): Promise<Board> => {
    const formData = new FormData();
    formData.append('id', String(postId));  // 백엔드 @NotNull 필드
    if (data.title) formData.append('title', data.title);
    if (data.text) formData.append('text', data.text);
    if (data.category) formData.append('category', data.category);
    formData.append('secret', String(data.secret ?? false));
    
    // 삭제할 첨부파일 ID들 추가
    if (deleteAttachIds && deleteAttachIds.length > 0) {
        deleteAttachIds.forEach(id => formData.append('deleteAttachIds', String(id)));
    }
    
    // 새로 추가할 첨부파일 추가
    if (files && files.length > 0) {
        files.forEach(file => formData.append('files', file));
    }

    await apiClient.patch(`/api/boards/${postId}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    
    // 백엔드가 204 No Content 반환하므로 수정된 게시글 다시 조회
    return fetchBoardPost(postId);
};

/**
 * 게시글 삭제
 */
export const deleteBoardPost = async (postId: number): Promise<void> => {
    await apiClient.delete(`/api/boards/${postId}`);
};

/**
 * 게시글 추천 취소
 */
export const cancelRecommendBoardPost = async (postId: number): Promise<void> => {
    await apiClient.delete(`/api/boards/${postId}/recommends`);
};

/**
 * 첨부파일 다운로드
 */
export const downloadBoardAttachment = async (
    boardId: number,
    attachId: number
): Promise<Blob> => {
    const response = await apiClient.get(
        `/api/boards/${boardId}/boardAttachs/${attachId}/download`,
        { responseType: 'blob' }
    );
    return response.data;
};

/**
 * 댓글 추천
 */
export const recommendComment = async (boardId: number, commentId: number): Promise<void> => {
    await apiClient.post(`/api/boards/${boardId}/comments/${commentId}/recommends`);
};

/**
 * 댓글 추천 취소
 */
export const cancelRecommendComment = async (boardId: number, commentId: number): Promise<void> => {
    await apiClient.delete(`/api/boards/${boardId}/comments/${commentId}/recommends`);
};

/**
 * 에디터 이미지 업로드
 * 본문에 삽입할 이미지를 S3에 업로드하고 URL을 반환
 */
export const uploadEditorImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'board');  // S3Folder enum에 정의된 허용 폴더
    formData.append('fileType', 'BOARD_ATTACH');
    
    const response = await apiClient.post('/api/files/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    
    // 응답에서 파일 URL 추출
    return response.data.fileUrl || response.data.url;
};
