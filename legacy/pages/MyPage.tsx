import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  getUserProfile,
  getMyPosts,
  getMyComments,
  getBookmarkedCourses,
  updateUserProfile,
} from '../services/myPageService';
import type {
  UserProfile,
  MyPost,
  MyComment,
  BookmarkedCourse,
} from '../types';
import {
  UserIcon,
  BookOpenIcon,
  FileTextIcon,
  MessageSquareIcon,
  BookmarkIcon,
  EditIcon,
  UploadIcon,
} from '../components/icons/Icons';

type TabType = 'profile' | 'posts' | 'comments' | 'bookmarks';

/**
 * 마이페이지 컴포넌트
 * 사용자 프로필, 수강 이력, 작성 글, 댓글, 찜한 과정 등을 관리합니다.
 */
const MyPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  // 데이터 상태
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [myPosts, setMyPosts] = useState<MyPost[]>([]);
  const [myComments, setMyComments] = useState<MyComment[]>([]);
  const [bookmarkedCourses, setBookmarkedCourses] = useState<BookmarkedCourse[]>([]);

  // 로그인 체크
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // user.id는 string이므로 Number로 변환
        const userId = user?.id ? Number(user.id) : undefined;
        
        const [profile, posts, comments, bookmarks] = await Promise.all([
          getUserProfile(userId),
          getMyPosts(),
          getMyComments(),
          getBookmarkedCourses(),
        ]);

        setUserProfile(profile);
        setMyPosts(posts.posts);
        setMyComments(comments.comments);
        setBookmarkedCourses(bookmarks);
      } catch (error) {
        console.error('Failed to load my page data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, user?.id]);

  // 프로필 수정 핸들러
  const handleProfileUpdate = async (data: Partial<UserProfile>) => {
    try {
      const updated = await updateUserProfile(data);
      setUserProfile(updated);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  // 프로필 이미지 업로드 핸들러
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 이미지 파일 검증
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    // 파일 크기 검증 (5MB 제한)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    setIsUploadingImage(true);

    // 이미지 미리보기용 Data URL 생성
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const imageUrl = e.target?.result as string;
        
        // TODO: 실제 API 호출로 이미지 업로드
        // const formData = new FormData();
        // formData.append('profileImage', file);
        // const response = await uploadProfileImage(formData);
        
        // 임시로 로컬 미리보기 URL을 프로필에 반영
        const updated = await updateUserProfile({ profileImage: imageUrl });
        setUserProfile(updated);
      } catch (error) {
        console.error('Failed to upload profile image:', error);
        alert('프로필 이미지 업로드에 실패했습니다.');
      } finally {
        setIsUploadingImage(false);
        // 같은 파일을 다시 선택할 수 있도록 input 초기화
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };

    reader.onerror = () => {
      alert('이미지를 읽는 중 오류가 발생했습니다.');
      setIsUploadingImage(false);
      // input 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    reader.readAsDataURL(file);
  };

  // 프로필 이미지 업로드 버튼 클릭 핸들러
  const handleUploadButtonClick = () => {
    fileInputRef.current?.click();
  };

  // 탭별 컨텐츠 렌더링
  const renderTabContent = () => {
    if (isLoading) {
      return <div className="flex justify-center items-center h-64">로딩중...</div>;
    }

    switch (activeTab) {
      case 'profile':
        return <ProfileTab profile={userProfile} isEditing={isEditing} onUpdate={handleProfileUpdate} />;
      case 'posts':
        return <PostsTab posts={myPosts} />;
      case 'comments':
        return <CommentsTab comments={myComments} />;
      case 'bookmarks':
        return <BookmarksTab bookmarks={bookmarkedCourses} />;
      default:
        return null;
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <img
                src={userProfile?.profileImage || 'https://via.placeholder.com/150'}
                alt={userProfile?.userName}
                className="w-24 h-24 rounded-full object-cover"
              />
              {activeTab === 'profile' && isEditing && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    aria-label="프로필 이미지 업로드"
                  />
                  <button
                    onClick={handleUploadButtonClick}
                    disabled={isUploadingImage}
                    className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    aria-label="프로필 이미지 변경"
                  >
                    {isUploadingImage ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <UploadIcon className="w-4 h-4" />
                    )}
                  </button>
                </>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {userProfile?.userName}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">{userProfile?.email}</p>
              <div className="flex gap-2 mt-2">
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full">
                  {userProfile?.accountType === 'USER' ? '일반회원' : userProfile?.accountType === 'ACADEMY' ? '기관회원' : '관리자'}
                </span>
                {userProfile?.academyInfo && (
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm rounded-full">
                    {userProfile.academyInfo.name}
                  </span>
                )}
              </div>
            </div>
            {activeTab === 'profile' && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
              >
                <EditIcon className="w-4 h-4" />
                {isEditing ? '취소' : '프로필 수정'}
              </button>
            )}
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-6">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <TabButton
              active={activeTab === 'profile'}
              onClick={() => setActiveTab('profile')}
              icon={<UserIcon className="w-5 h-5" />}
              label="프로필"
            />
            <TabButton
              active={activeTab === 'posts'}
              onClick={() => setActiveTab('posts')}
              icon={<FileTextIcon className="w-5 h-5" />}
              label="작성한 글"
              count={myPosts.length}
            />
            <TabButton
              active={activeTab === 'comments'}
              onClick={() => setActiveTab('comments')}
              icon={<MessageSquareIcon className="w-5 h-5" />}
              label="작성한 댓글"
              count={myComments.length}
            />
            <TabButton
              active={activeTab === 'bookmarks'}
              onClick={() => setActiveTab('bookmarks')}
              icon={<BookmarkIcon className="w-5 h-5" />}
              label="찜한 과정"
              count={bookmarkedCourses.length}
            />
          </div>
        </div>

        {/* 탭 컨텐츠 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

/**
 * 탭 버튼 컴포넌트
 */
interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count?: number;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, icon, label, count }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
      active
        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
    }`}
  >
    {icon}
    <span>{label}</span>
    {count !== undefined && count > 0 && (
      <span className="ml-1 px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full">
        {count}
      </span>
    )}
  </button>
);

/**
 * 프로필 탭 컴포넌트
 */
interface ProfileTabProps {
  profile: UserProfile | null;
  isEditing: boolean;
  onUpdate: (data: Partial<UserProfile>) => void;
}

const ProfileTab: React.FC<ProfileTabProps> = ({ profile, isEditing, onUpdate }) => {
  const [formData, setFormData] = useState({
    userName: profile?.userName || '',
    email: profile?.email || '',
    phoneNumber: profile?.phoneNumber || '',
    affiliation: profile?.affiliation || '',
    position: profile?.position || '',
  });

  // isEditing이 true로 변경될 때만 profile 데이터로 formData 초기화
  // 수정 중에는 profile 변경에 의한 덮어쓰기 방지
  useEffect(() => {
    if (profile && isEditing) {
      setFormData({
        userName: profile.userName,
        email: profile.email,
        phoneNumber: profile.phoneNumber,
        affiliation: profile.affiliation || '',
        position: profile.position || '',
      });
    }
  }, [isEditing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  if (!profile) return null;

  if (isEditing) {
    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              이름
            </label>
            <input
              type="text"
              value={formData.userName}
              onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              이메일
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              전화번호
            </label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              회사
            </label>
            <input
              type="text"
              value={formData.affiliation}
              onChange={(e) => setFormData({ ...formData, affiliation: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              부서
            </label>
            <input
              type="text"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            저장
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InfoItem label="이름" value={profile.userName} />
        <InfoItem label="이메일" value={profile.email} />
        <InfoItem label="전화번호" value={profile.phoneNumber} />
        <InfoItem label="회사" value={profile.affiliation || '-'} />
        <InfoItem label="부서" value={profile.position || '-'} />
        <InfoItem
          label="가입일"
          value={new Date(profile.createdAt).toLocaleDateString('ko-KR')}
        />
      </div>
    </div>
  );
};

/**
 * 정보 아이템 컴포넌트
 */
interface InfoItemProps {
  label: string;
  value: string;
}

const InfoItem: React.FC<InfoItemProps> = ({ label, value }) => (
  <div>
    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</dt>
    <dd className="mt-1 text-base text-gray-900 dark:text-white">{value}</dd>
  </div>
);

/**
 * 작성한 글 탭 컴포넌트
 */
interface PostsTabProps {
  posts: MyPost[];
}

const PostsTab: React.FC<PostsTabProps> = ({ posts }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div
          key={post.id}
          className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
          onClick={() => navigate(`/community/${post.id}`)}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full">
              {post.category}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {new Date(post.createdAt).toLocaleDateString('ko-KR')}
            </span>
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white mb-2">{post.title}</h3>
          <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span>조회 {post.hits}</span>
            <span>추천 {post.recommendCount}</span>
            <span>댓글 {post.commentCount}</span>
          </div>
        </div>
      ))}

      {posts.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          작성한 글이 없습니다.
        </div>
      )}
    </div>
  );
};

/**
 * 작성한 댓글 탭 컴포넌트
 */
interface CommentsTabProps {
  comments: MyComment[];
}

const CommentsTab: React.FC<CommentsTabProps> = ({ comments }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div
          key={comment.id}
          className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
          onClick={() => navigate(`/community/${comment.boardId}`)}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-sm rounded-full">
              {comment.category}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {new Date(comment.createdAt).toLocaleDateString('ko-KR')}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            원글: <span className="font-medium text-gray-900 dark:text-white">{comment.postTitle}</span>
          </p>
          <p className="text-gray-700 dark:text-gray-300">{comment.text}</p>
        </div>
      ))}

      {comments.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          작성한 댓글이 없습니다.
        </div>
      )}
    </div>
  );
};

/**
 * 찜한 과정 탭 컴포넌트
 */
interface BookmarksTabProps {
  bookmarks: BookmarkedCourse[];
}

const BookmarksTab: React.FC<BookmarksTabProps> = ({ bookmarks }) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {bookmarks.map((bookmark) => (
        <div
          key={bookmark.id}
          className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate(`/lectures/${bookmark.courseId}`)}
        >
          <img src={bookmark.imageUrl} alt={bookmark.courseName} className="w-full h-40 object-cover" />
          <div className="p-4">
            <h3 className="font-bold text-gray-900 dark:text-white mb-1 line-clamp-2">
              {bookmark.courseName}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{bookmark.academy}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="text-yellow-500">★</span>
                <span className="text-sm font-medium">{bookmark.rating}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ({bookmark.reviewCount})
                </span>
              </div>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {new Date(bookmark.createdAt).toLocaleDateString('ko-KR')}
              </span>
            </div>
          </div>
        </div>
      ))}

      {bookmarks.length === 0 && (
        <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
          찜한 과정이 없습니다.
        </div>
      )}
    </div>
  );
};

export default MyPage;
