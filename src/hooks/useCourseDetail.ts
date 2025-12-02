import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCourseById, fetchCourseReviews, fetchCourseQnAs, createCourseQnA } from '../services/courseService';
import { addCourseFavorite, removeCourseFavorite, checkCourseFavorite } from '../services/favoriteService';
import { useAuthStore } from '../store/authStore';
import { QNA_PER_PAGE } from '../constants';
import type { AlertModalState } from '../types';

interface UseCourseDetailOptions {
    courseId: number | null;
    isValidId: boolean;
}

export const useCourseDetail = ({ courseId, isValidId }: UseCourseDetailOptions) => {
    const [qnaPage, setQnaPage] = useState(1);
    const [qnaSearchKeyword, setQnaSearchKeyword] = useState('');
    const [alertModal, setAlertModal] = useState<AlertModalState>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info'
    });

    const queryClient = useQueryClient();
    const { isAuthenticated } = useAuthStore();

    // 과정 정보 조회
    const {
        data: course,
        isLoading,
        isError: isCourseError,
        error: courseError,
        refetch: refetchCourse
    } = useQuery({
        queryKey: ['course', courseId],
        queryFn: () => fetchCourseById(courseId!),
        enabled: isValidId,
    });

    // 리뷰 조회
    const {
        data: reviews,
        isLoading: isReviewsLoading,
        isError: isReviewsError,
        error: reviewsError,
        refetch: refetchReviews
    } = useQuery({
        queryKey: ['course-reviews', courseId],
        queryFn: () => fetchCourseReviews(courseId!),
        enabled: isValidId,
    });

    // Q&A 조회
    const {
        data: qnaData,
        isLoading: isQnAsLoading,
        isError: isQnAsError,
        error: qnasError,
        refetch: refetchQnAs
    } = useQuery({
        queryKey: ['course-qnas', courseId, qnaPage, qnaSearchKeyword],
        queryFn: () => fetchCourseQnAs(
            courseId!,
            qnaPage,
            QNA_PER_PAGE,
            qnaSearchKeyword
        ),
        enabled: isValidId && !!course,
    });

    // 찜하기 상태 조회
    const { data: favoriteCheckResult, isError: isFavoriteError } = useQuery({
        queryKey: ['course-favorite', courseId],
        queryFn: () => checkCourseFavorite(courseId!),
        enabled: isValidId && !!course && isAuthenticated,
    });

    const isFavorite = favoriteCheckResult?.favorited ?? false;

    // 찜하기 추가 Mutation
    const addFavoriteMutation = useMutation({
        mutationFn: () => addCourseFavorite(courseId!),
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ['course-favorite', courseId] });
            const previousFavorite = queryClient.getQueryData(['course-favorite', courseId]);
            queryClient.setQueryData(['course-favorite', courseId], { favorited: true });
            return { previousFavorite };
        },
        onError: (error, _, context) => {
            console.error('Failed to add favorite:', error);
            if (context?.previousFavorite) {
                queryClient.setQueryData(['course-favorite', courseId], context.previousFavorite);
            }
            setAlertModal({
                isOpen: true,
                title: '찜하기 실패',
                message: '찜하기 처리 중 오류가 발생했습니다.',
                type: 'error'
            });
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['course-favorite', courseId] });
        }
    });

    // 찜하기 삭제 Mutation
    const removeFavoriteMutation = useMutation({
        mutationFn: () => removeCourseFavorite(courseId!),
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ['course-favorite', courseId] });
            const previousFavorite = queryClient.getQueryData(['course-favorite', courseId]);
            queryClient.setQueryData(['course-favorite', courseId], { favorited: false });
            return { previousFavorite };
        },
        onError: (error, _, context) => {
            console.error('Failed to remove favorite:', error);
            if (context?.previousFavorite) {
                queryClient.setQueryData(['course-favorite', courseId], context.previousFavorite);
            }
            setAlertModal({
                isOpen: true,
                title: '찜 삭제 실패',
                message: '찜 삭제 처리 중 오류가 발생했습니다.',
                type: 'error'
            });
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['course-favorite', courseId] });
        }
    });

    // Q&A 등록 Mutation
    const createQnAMutation = useMutation({
        mutationFn: (data: { title: string; content: string; fileDetails?: { id: number; originName: string; fileUrl: string }[] }) =>
            createCourseQnA(courseId!, {
                title: data.title,
                questionText: data.content,
                fileDetails: data.fileDetails
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['course-qnas', courseId] });
            setAlertModal({
                isOpen: true,
                title: '질문 등록 완료',
                message: '질문이 성공적으로 등록되었습니다.',
                type: 'success'
            });
        },
        onError: (error) => {
            console.error('Failed to create QnA:', error);
            setAlertModal({
                isOpen: true,
                title: '질문 등록 실패',
                message: '질문 등록 중 오류가 발생했습니다.',
                type: 'error'
            });
        }
    });

    // 찜하기 토글 핸들러
    const handleFavoriteClick = () => {
        if (!course) return;

        if (!isAuthenticated) {
            setAlertModal({
                isOpen: true,
                title: '로그인 필요',
                message: '찜하기 기능은 로그인이 필요합니다.',
                type: 'warning'
            });
            return;
        }

        if (isFavorite) {
            removeFavoriteMutation.mutate();
        } else {
            addFavoriteMutation.mutate();
        }
    };

    // Q&A 검색 핸들러
    const handleQnaSearch = (keyword: string) => {
        setQnaSearchKeyword(keyword);
        setQnaPage(1);
    };

    // Q&A 제출 핸들러
    const handleQnaSubmit = (title: string, content: string, fileDetails?: { id: number; originName: string; fileUrl: string }[]) => {
        if (createQnAMutation.isPending) return;
        createQnAMutation.mutate({ title, content, fileDetails });
    };

    return {
        // 과정 데이터
        course,
        isLoading,
        isCourseError,
        courseError,
        refetchCourse,
        
        // 리뷰 데이터
        reviews,
        isReviewsLoading,
        isReviewsError,
        reviewsError,
        refetchReviews,
        
        // Q&A 데이터
        qnaData,
        isQnAsLoading,
        isQnAsError,
        qnasError,
        refetchQnAs,
        qnaPage,
        setQnaPage,
        
        // 찜하기
        isFavorite,
        isFavoriteError,
        handleFavoriteClick,
        isFavoritePending: addFavoriteMutation.isPending || removeFavoriteMutation.isPending,
        
        // Q&A 핸들러
        handleQnaSearch,
        handleQnaSubmit,
        isQnaSubmitting: createQnAMutation.isPending,
        
        // 알림 모달
        alertModal,
        setAlertModal,
    };
};
