import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { getProfile, updateProfile, deleteAccount, type UpdateProfileData } from '../../services/mypageService';
import { myPosts, myComments, bookmarkedCourses } from './data';

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

    const { data: userProfile } = useQuery({
        queryKey: ['profile'],
        queryFn: getProfile,
        enabled: isAuthenticated,
        initialData: authUser || undefined
    });

    const user = userProfile || authUser;

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
            navigate('/');
        }
    });

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    const handleEditSubmit = (data: UpdateProfileData) => {
        console.log('Submitting profile data:', data);
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

    // Statistics
    const totalViews = myPosts.reduce((sum, post) => sum + post.views, 0);
    const totalComments = myPosts.reduce((sum, post) => sum + post.comments, 0);

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

        // Data
        myPosts,
        myComments,
        bookmarkedCourses,
        totalViews,
        totalComments
    };
};
