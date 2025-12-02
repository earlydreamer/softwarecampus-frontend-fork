import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { 
    getProfile, 
    updateProfile, 
    deleteAccount, 
    getMyPosts, 
    getMyComments, 
    getMyStats,
    getFavorites,
    type UpdateProfileData 
} from '../../services/mypageService';
import type { MyPost, MyComment, MyStats, CourseFavorite } from '../../types';

export type TabType = 'overview' | 'posts' | 'comments' | 'bookmarks';

export const useMyPage = () => {
    const navigate = useNavigate();
    const { user: authUser, isAuthenticated, logout } = useAuthStore();
    const queryClient = useQueryClient();
    
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isEmailVerifyModalOpen, setIsEmailVerifyModalOpen] = useState(false);
    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
    
    // 페이지네이션 상태
    const [postsPage, setPostsPage] = useState(0);
    const [commentsPage, setCommentsPage] = useState(0);

    // 프로필 조회
    const { data: userProfile } = useQuery({
        queryKey: ['profile'],
        queryFn: getProfile,
        enabled: isAuthenticated,
        initialData: authUser || undefined
    });

    const user = userProfile || authUser;

    // 내가 쓴 글 목록 조회
    const { 
        data: postsData, 
        isLoading: isPostsLoading,
        isError: isPostsError 
    } = useQuery({
        queryKey: ['mypage', 'posts', postsPage],
        queryFn: () => getMyPosts(postsPage, 10),
        enabled: isAuthenticated
    });

    // 내가 쓴 댓글 목록 조회
    const { 
        data: commentsData, 
        isLoading: isCommentsLoading,
        isError: isCommentsError 
    } = useQuery({
        queryKey: ['mypage', 'comments', commentsPage],
        queryFn: () => getMyComments(commentsPage, 10),
        enabled: isAuthenticated
    });

    // 활동 통계 조회
    const { 
        data: statsData, 
        isLoading: isStatsLoading,
        isError: isStatsError,
        refetch: refetchStats
    } = useQuery({
        queryKey: ['mypage', 'stats'],
        queryFn: getMyStats,
        enabled: isAuthenticated
    });

    // 찜한 강좌 목록 조회
    const { 
        data: favoritesData, 
        isLoading: isFavoritesLoading,
        isError: isFavoritesError 
    } = useQuery({
        queryKey: ['mypage', 'favorites'],
        queryFn: getFavorites,
        enabled: isAuthenticated
    });

    const updateMutation = useMutation({
        mutationFn: updateProfile,
        onSuccess: (data) => {
            queryClient.setQueryData(['profile'], data);
            setIsEditModalOpen(false);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: deleteAccount,
        onSuccess: () => {
            logout();
            navigate('/login');
        }
    });

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    const handleEditSubmit = (data: UpdateProfileData) => {
        updateMutation.mutate(data);
    };

    const handleDeleteSubmit = () => {
        deleteMutation.mutate();
    };

    const handlePasswordChangeClick = () => {
        setIsEditModalOpen(false);
        setIsChangePasswordModalOpen(true);
    };

    const handleEmailVerified = () => {
        setIsEmailVerifyModalOpen(false);
        setIsChangePasswordModalOpen(true);
    };

    // 데이터 추출
    const myPosts: MyPost[] = postsData?.content || [];
    const myComments: MyComment[] = commentsData?.content || [];
    const bookmarkedCourses: CourseFavorite[] = favoritesData || [];
    const stats: MyStats = statsData || {
        totalPosts: 0,
        totalComments: 0,
        totalBookmarks: 0,
        totalViews: 0
    };

    return {
        user,
        isAuthenticated,
        activeTab,
        setActiveTab,
        
        // Modals State
        isEditModalOpen,
        setIsEditModalOpen,
        isDeleteModalOpen,
        setIsDeleteModalOpen,
        isEmailVerifyModalOpen,
        setIsEmailVerifyModalOpen,
        isChangePasswordModalOpen,
        setIsChangePasswordModalOpen,

        // Mutations
        updateMutation,
        deleteMutation,

        // Handlers
        handleEditSubmit,
        handleDeleteSubmit,
        handlePasswordChangeClick,
        handleEmailVerified,

        // Data (API에서 가져온 실제 데이터)
        myPosts,
        myComments,
        bookmarkedCourses,
        stats,
        
        // 통계 (stats에서 가져옴)
        totalViews: stats.totalViews,
        totalComments: stats.totalComments,
        totalBookmarks: stats.totalBookmarks,

        // 페이지네이션
        postsPage,
        setPostsPage,
        commentsPage,
        setCommentsPage,
        postsTotalPages: postsData?.totalPages || 0,
        commentsTotalPages: commentsData?.totalPages || 0,

        // 로딩/에러 상태
        isPostsLoading,
        isCommentsLoading,
        isStatsLoading,
        isFavoritesLoading,
        isPostsError,
        isCommentsError,
        isStatsError,
        isFavoritesError,
        
        // Refetch 함수들
        refetchStats
    };
};
