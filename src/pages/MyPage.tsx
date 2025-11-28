import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
    User, FileText, MessageSquare, Bookmark, Edit, Camera, Mail,
    Phone, MapPin, Building, Briefcase, Shield, TrendingUp, Eye, Calendar,
    Activity
} from 'lucide-react';

type TabType = 'overview' | 'posts' | 'comments' | 'bookmarks';

const MyPage = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuthStore();
    const [activeTab, setActiveTab] = useState<TabType>('overview');

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    if (!isAuthenticated || !user) {
        return null;
    }

    // Mock 데이터
    const myPosts = [
        { id: 1, title: 'React 19 새로운 기능 정리', category: 'CODING_STORY', createdAt: '2024-01-15', views: 245, comments: 12 },
        { id: 2, title: 'TypeScript 5.0 마이그레이션 후기', category: 'COURSE_STORY', createdAt: '2024-01-10', views: 189, comments: 8 },
        { id: 3, title: 'Vite vs Webpack 성능 비교', category: 'CODING_STORY', createdAt: '2024-01-05', views: 312, comments: 15 },
    ];

    const myComments = [
        { id: 1, postTitle: 'Next.js 14 App Router 사용기', content: '저도 비슷한 경험이 있어서 공감되네요!', createdAt: '2024-01-14' },
        { id: 2, postTitle: 'TailwindCSS 유용한 팁', content: '이 방법 정말 좋네요. 감사합니다!', createdAt: '2024-01-12' },
        { id: 3, postTitle: 'Docker 입문 가이드', content: '초보자에게 정말 도움이 되는 글이네요', createdAt: '2024-01-08' },
    ];

    const bookmarkedCourses = [
        { id: 1, title: 'React 완벽 마스터', academy: '코딩마스터', category: '프론트엔드', rating: 4.8 },
        { id: 2, title: 'TypeScript 실전 프로젝트', academy: '소프트웨어 아카데미', category: '프론트엔드', rating: 4.9 },
        { id: 3, title: 'Node.js 백엔드 개발', academy: '데이터 인사이트', category: '백엔드', rating: 4.7 },
    ];

    const recentActivity = [
        { type: 'post', title: 'React 19 새로운 기능 정리', date: '2024-01-15' },
        { type: 'comment', title: 'Next.js 14 App Router 사용기에 댓글', date: '2024-01-14' },
        { type: 'bookmark', title: 'TypeScript 실전 프로젝트를 찜함', date: '2024-01-13' },
    ];

    const totalViews = myPosts.reduce((sum, post) => sum + post.views, 0);
    const totalComments = myPosts.reduce((sum, post) => sum + post.comments, 0);

    const getAccountTypeLabel = (type: string) => {
        switch (type) {
            case 'ADMIN': return '관리자';
            case 'ACADEMY': return '교육기관';
            case 'USER': return '일반회원';
            default: return type;
        }
    };

    const getApprovalStatusLabel = (status: string) => {
        switch (status) {
            case 'APPROVED': return '승인됨';
            case 'PENDING': return '대기중';
            case 'REJECTED': return '거부됨';
            default: return status;
        }
    };

    const getApprovalStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'PENDING': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'REJECTED': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400';
        }
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'post': return <FileText className="w-4 h-4" />;
            case 'comment': return <MessageSquare className="w-4 h-4" />;
            case 'bookmark': return <Bookmark className="w-4 h-4" />;
            default: return <Activity className="w-4 h-4" />;
        }
    };

    // 공통 사이드바 컴포넌트
    const Sidebar = () => (
        <div className="lg:col-span-1 space-y-6">
            {/* 프로필 정보 */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="relative group mb-4">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                            {user.userName.charAt(0).toUpperCase()}
                        </div>
                        <button className="absolute bottom-0 right-0 p-2 bg-white dark:bg-slate-700 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                        </button>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{user.userName}</h2>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${user.accountType === 'ADMIN' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        user.accountType === 'ACADEMY' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                            'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                        {getAccountTypeLabel(user.accountType)}
                    </span>
                    <button className="w-full btn-secondary flex items-center justify-center gap-2">
                        <Edit className="w-4 h-4" />
                        프로필 수정
                    </button>
                </div>

                <div className="space-y-3 border-t border-slate-200 dark:border-slate-700 pt-6">
                    <div className="flex items-center gap-3 text-sm">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-600 dark:text-slate-400 truncate">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-600 dark:text-slate-400">{user.phoneNumber}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                        <Shield className="w-4 h-4 text-slate-400" />
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getApprovalStatusColor(user.accountApproved)}`}>
                            {getApprovalStatusLabel(user.accountApproved)}
                        </span>
                    </div>
                    {user.affiliation && (
                        <div className="flex items-center gap-3 text-sm">
                            <Building className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-600 dark:text-slate-400 truncate">{user.affiliation}</span>
                        </div>
                    )}
                    {user.position && (
                        <div className="flex items-center gap-3 text-sm">
                            <Briefcase className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-600 dark:text-slate-400">{user.position}</span>
                        </div>
                    )}
                    {user.address && (
                        <div className="flex items-center gap-3 text-sm">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-600 dark:text-slate-400 text-xs">{user.address}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* 최근 활동 */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary-600" />
                    최근 활동
                </h3>
                <div className="space-y-3">
                    {recentActivity.map((activity, idx) => (
                        <div key={idx} className="flex items-start gap-3 text-sm">
                            <div className={`p-1.5 rounded-lg ${activity.type === 'post' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                                activity.type === 'comment' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' :
                                    'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400'
                                }`}>
                                {getActivityIcon(activity.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-slate-700 dark:text-slate-300 text-xs truncate">{activity.title}</p>
                                <p className="text-slate-500 dark:text-slate-400 text-xs">{activity.date}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 활동 통계 요약 */}
            <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 shadow-lg text-white">
                <h3 className="text-sm font-semibold mb-4 opacity-90">활동 요약</h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm opacity-90">작성한 글</span>
                        <span className="text-2xl font-bold">{myPosts.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm opacity-90">총 댓글</span>
                        <span className="text-2xl font-bold">{totalComments}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm opacity-90">총 조회수</span>
                        <span className="text-2xl font-bold">{totalViews}</span>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="grid lg:grid-cols-3 gap-6">
                        <Sidebar />
                        <div className="lg:col-span-2 space-y-6">
                            {/* KPI 카드 */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 shadow-lg">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="p-2 bg-white/20 rounded-lg">
                                            <FileText className="w-5 h-5 text-white" />
                                        </div>
                                        <TrendingUp className="w-4 h-4 text-white/70" />
                                    </div>
                                    <p className="text-3xl font-bold text-white mb-1">{myPosts.length}</p>
                                    <p className="text-sm text-white/80">작성한 글</p>
                                </div>
                                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 shadow-lg">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="p-2 bg-white/20 rounded-lg">
                                            <MessageSquare className="w-5 h-5 text-white" />
                                        </div>
                                        <TrendingUp className="w-4 h-4 text-white/70" />
                                    </div>
                                    <p className="text-3xl font-bold text-white mb-1">{totalComments}</p>
                                    <p className="text-sm text-white/80">총 댓글</p>
                                </div>
                                <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-5 shadow-lg">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="p-2 bg-white/20 rounded-lg">
                                            <Bookmark className="w-5 h-5 text-white" />
                                        </div>
                                        <TrendingUp className="w-4 h-4 text-white/70" />
                                    </div>
                                    <p className="text-3xl font-bold text-white mb-1">{bookmarkedCourses.length}</p>
                                    <p className="text-sm text-white/80">찜한 과정</p>
                                </div>
                                <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-5 shadow-lg">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="p-2 bg-white/20 rounded-lg">
                                            <Eye className="w-5 h-5 text-white" />
                                        </div>
                                        <TrendingUp className="w-4 h-4 text-white/70" />
                                    </div>
                                    <p className="text-3xl font-bold text-white mb-1">{totalViews}</p>
                                    <p className="text-sm text-white/80">총 조회수</p>
                                </div>
                            </div>

                            {/* 최근 게시글 */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">최근 게시글</h3>
                                    <button
                                        onClick={() => setActiveTab('posts')}
                                        className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                                    >
                                        모두 보기
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {myPosts.slice(0, 3).map(post => (
                                        <div key={post.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700">
                                            <div className="flex items-start justify-between mb-2">
                                                <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${post.category === 'CODING_STORY' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                    }`}>
                                                    {post.category === 'CODING_STORY' ? '코딩이야기' : '진로이야기'}
                                                </span>
                                                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {post.createdAt}
                                                </span>
                                            </div>
                                            <h4 className="font-semibold text-slate-900 dark:text-white mb-2">{post.title}</h4>
                                            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                                                <span className="flex items-center gap-1">
                                                    <Eye className="w-3 h-3" />
                                                    {post.views}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <MessageSquare className="w-3 h-3" />
                                                    {post.comments}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 최근 댓글 */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">최근 댓글</h3>
                                    <button
                                        onClick={() => setActiveTab('comments')}
                                        className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                                    >
                                        모두 보기
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {myComments.slice(0, 3).map(comment => (
                                        <div key={comment.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors border border-slate-200 dark:border-slate-700">
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                                <span className="font-medium text-primary-600 dark:text-primary-400">{comment.postTitle}</span>에 댓글
                                            </p>
                                            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2 line-clamp-2">{comment.content}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {comment.createdAt}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 찜한 과정 */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">찜한 과정</h3>
                                    <button
                                        onClick={() => setActiveTab('bookmarks')}
                                        className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                                    >
                                        모두 보기
                                    </button>
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {bookmarkedCourses.slice(0, 2).map(course => (
                                        <div key={course.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 hover:shadow-md transition-all cursor-pointer border border-slate-200 dark:border-slate-700 group">
                                            <div className="flex items-start justify-between mb-3">
                                                <span className="px-2.5 py-1 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs font-medium">
                                                    {course.category}
                                                </span>
                                                <div className="flex items-center gap-1 text-yellow-500">
                                                    <span className="text-sm font-semibold">⭐ {course.rating}</span>
                                                </div>
                                            </div>
                                            <h4 className="font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                                {course.title}
                                            </h4>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">{course.academy}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'posts':
                return (
                    <div className="grid lg:grid-cols-3 gap-6">
                        <Sidebar />
                        <div className="lg:col-span-2 space-y-6">
                            {/* 통계 카드 */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">전체 글</p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{myPosts.length}</p>
                                </div>
                                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">총 조회</p>
                                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalViews}</p>
                                </div>
                                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">총 댓글</p>
                                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{totalComments}</p>
                                </div>
                            </div>

                            {/* 글 목록 */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">내가 작성한 글</h3>
                                    <select className="px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                        <option>최신순</option>
                                        <option>조회순</option>
                                        <option>댓글순</option>
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    {myPosts.map(post => (
                                        <div key={post.id} className="p-5 rounded-xl bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary-500 hover:shadow-md transition-all cursor-pointer">
                                            <div className="flex items-start justify-between mb-3">
                                                <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${post.category === 'CODING_STORY' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                    }`}>
                                                    {post.category === 'CODING_STORY' ? '코딩이야기' : '진로이야기'}
                                                </span>
                                                <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    {post.createdAt}
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-3">{post.title}</h3>
                                            <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
                                                <span className="flex items-center gap-1.5">
                                                    <Eye className="w-4 h-4" />
                                                    조회 {post.views}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <MessageSquare className="w-4 h-4" />
                                                    댓글 {post.comments}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'comments':
                return (
                    <div className="grid lg:grid-cols-3 gap-6">
                        <Sidebar />
                        <div className="lg:col-span-2 space-y-6">
                            {/* 통계 카드 */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">작성한 댓글</p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{myComments.length}</p>
                                </div>
                                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">이번 달</p>
                                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">2</p>
                                </div>
                            </div>

                            {/* 댓글 목록 */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">내가 작성한 댓글</h3>
                                    <select className="px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                        <option>최신순</option>
                                        <option>오래된순</option>
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    {myComments.map(comment => (
                                        <div key={comment.id} className="p-5 rounded-xl bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary-500 hover:shadow-md transition-all">
                                            <div className="flex items-start justify-between mb-3">
                                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                                    <span className="font-semibold text-primary-600 dark:text-primary-400">{comment.postTitle}</span>에 댓글
                                                </p>
                                                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {comment.createdAt}
                                                </span>
                                            </div>
                                            <p className="text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                                                {comment.content}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'bookmarks':
                return (
                    <div className="grid lg:grid-cols-3 gap-6">
                        <Sidebar />
                        <div className="lg:col-span-2 space-y-6">
                            {/* 통계 카드 */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">찜한 과정</p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{bookmarkedCourses.length}</p>
                                </div>
                                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">평균 평점</p>
                                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                        {(bookmarkedCourses.reduce((sum, c) => sum + c.rating, 0) / bookmarkedCourses.length).toFixed(1)}
                                    </p>
                                </div>
                            </div>

                            {/* 찜한 과정 목록 */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">찜한 과정</h3>
                                    <select className="px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                        <option>전체</option>
                                        <option>프론트엔드</option>
                                        <option>백엔드</option>
                                    </select>
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {bookmarkedCourses.map(course => (
                                        <div key={course.id} className="p-5 rounded-xl bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary-500 hover:shadow-lg transition-all cursor-pointer group">
                                            <div className="flex items-start justify-between mb-3">
                                                <span className="px-2.5 py-1 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs font-medium">
                                                    {course.category}
                                                </span>
                                                <div className="flex items-center gap-1 text-yellow-500">
                                                    <span className="text-sm font-semibold">⭐ {course.rating}</span>
                                                </div>
                                            </div>
                                            <h3 className="font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                                {course.title}
                                            </h3>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{course.academy}</p>
                                            <button className="w-full py-2 text-sm font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition">
                                                자세히 보기
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
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
                        {['overview', 'posts', 'comments', 'bookmarks'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as TabType)}
                                className={`flex-1 py-4 px-6 font-semibold transition-all relative ${activeTab === tab
                                    ? 'text-primary-600 dark:text-primary-400 bg-slate-50 dark:bg-slate-700/50'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/30'
                                    }`}
                            >
                                <span className="flex items-center justify-center gap-2">
                                    {tab === 'overview' && <><User className="w-5 h-5" />개요</>}
                                    {tab === 'posts' && <><FileText className="w-5 h-5" />글 ({myPosts.length})</>}
                                    {tab === 'comments' && <><MessageSquare className="w-5 h-5" />댓글 ({myComments.length})</>}
                                    {tab === 'bookmarks' && <><Bookmark className="w-5 h-5" />찜 ({bookmarkedCourses.length})</>}
                                </span>
                                {activeTab === tab && (
                                    <div className="absolute bottom-0 left-0 w-full h-1 bg-primary-600 dark:bg-primary-500" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div>{renderTabContent()}</div>
            </div>
        </div>
    );
};

export default MyPage;
