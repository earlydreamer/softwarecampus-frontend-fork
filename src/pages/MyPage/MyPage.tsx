import { User, FileText, MessageSquare, Bookmark } from 'lucide-react';
import { useMyPage, type TabType } from './useMyPage';
import Sidebar from './components/Sidebar';
import OverviewTab from './components/OverviewTab';
import PostsTab from './components/PostsTab';
import CommentsTab from './components/CommentsTab';
import BookmarksTab from './components/BookmarksTab';
import EditProfileModal from './components/modals/EditProfileModal';
import DeleteAccountModal from './components/modals/DeleteAccountModal';
import EmailVerificationModal from '../../components/auth/EmailVerificationModal';
import ChangePasswordModal from '../../components/auth/ChangePasswordModal';

const MyPage = () => {
    const {
        user,
        isAuthenticated,
        activeTab,
        setActiveTab,
        isEditModalOpen,
        setIsEditModalOpen,
        isDeleteModalOpen,
        setIsDeleteModalOpen,
        isEmailVerifyModalOpen,
        setIsEmailVerifyModalOpen,
        isChangePasswordModalOpen,
        setIsChangePasswordModalOpen,
        updateMutation,
        deleteMutation,
        handleEditSubmit,
        handleDeleteSubmit,
        handlePasswordChangeClick,
        handleEmailVerified,
        myPosts,
        myComments,
        bookmarkedCourses,
        stats,
        totalComments: _totalComments,
        postsPage,
        setPostsPage,
        commentsPage,
        setCommentsPage,
        postsTotalPages,
        commentsTotalPages,
        isPostsLoading,
        isCommentsLoading,
        isStatsLoading,
        isFavoritesLoading
    } = useMyPage();

    if (!isAuthenticated || !user) {
        return null;
    }

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <OverviewTab 
                        setActiveTab={setActiveTab}
                        posts={myPosts}
                        comments={myComments}
                        bookmarkedCourses={bookmarkedCourses}
                        stats={stats}
                        isLoading={isStatsLoading}
                    />
                );
            case 'posts':
                return (
                    <PostsTab 
                        posts={myPosts}
                        stats={stats}
                        isLoading={isPostsLoading}
                        currentPage={postsPage}
                        totalPages={postsTotalPages}
                        onPageChange={setPostsPage}
                    />
                );
            case 'comments':
                return (
                    <CommentsTab 
                        comments={myComments}
                        stats={stats}
                        isLoading={isCommentsLoading}
                        currentPage={commentsPage}
                        totalPages={commentsTotalPages}
                        onPageChange={setCommentsPage}
                    />
                );
            case 'bookmarks':
                return (
                    <BookmarksTab 
                        courses={bookmarkedCourses}
                        stats={stats}
                        isLoading={isFavoritesLoading}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">대시보드</h1>
                    <p className="text-slate-600 dark:text-slate-400">안녕하세요, {user.userName}님! 👋</p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 mb-6 overflow-hidden">
                    <div className="flex">
                        {(['overview', 'posts', 'comments', 'bookmarks'] as TabType[]).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-4 px-6 font-semibold transition-all relative ${activeTab === tab
                                    ? 'text-primary-600 dark:text-primary-400 bg-slate-50 dark:bg-slate-700/50'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/30'
                                    }`}
                            >
                                <span className="flex items-center justify-center gap-2">
                                    {tab === 'overview' && <><User className="w-5 h-5" />개요</>}
                                    {tab === 'posts' && <><FileText className="w-5 h-5" />글 ({stats.totalPosts})</>}
                                    {tab === 'comments' && <><MessageSquare className="w-5 h-5" />댓글 ({stats.totalComments})</>}
                                    {tab === 'bookmarks' && <><Bookmark className="w-5 h-5" />찜 ({stats.totalBookmarks})</>}
                                </span>
                                {activeTab === tab && (
                                    <div className="absolute bottom-0 left-0 w-full h-1 bg-primary-600 dark:bg-primary-500" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    <Sidebar 
                        user={user} 
                        onEditClick={() => setIsEditModalOpen(true)}
                        onDeleteClick={() => setIsDeleteModalOpen(true)}
                        stats={stats}
                    />
                    {renderTabContent()}
                </div>

                {/* Modals */}
                <EditProfileModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    user={user}
                    onSubmit={handleEditSubmit}
                    isPending={updateMutation.isPending}
                    onPasswordChangeClick={handlePasswordChangeClick}
                />

                <DeleteAccountModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleDeleteSubmit}
                    isPending={deleteMutation.isPending}
                />

                <EmailVerificationModal
                    isOpen={isEmailVerifyModalOpen}
                    onClose={() => setIsEmailVerifyModalOpen(false)}
                    email={user.email}
                    onVerified={handleEmailVerified}
                    type="PASSWORD_RESET"
                />

                <ChangePasswordModal
                    isOpen={isChangePasswordModalOpen}
                    onClose={() => setIsChangePasswordModalOpen(false)}
                />
            </div>
        </div>
    );
};

export default MyPage;
