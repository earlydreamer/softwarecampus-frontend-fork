// Mock Data
export const myPosts = [
    { id: 1, title: 'React 19 새로운 기능 정리', category: 'CODING_STORY', createdAt: '2024-01-15', views: 245, comments: 12 },
    { id: 2, title: 'TypeScript 5.0 마이그레이션 후기', category: 'COURSE_STORY', createdAt: '2024-01-10', views: 189, comments: 8 },
    { id: 3, title: 'Vite vs Webpack 성능 비교', category: 'CODING_STORY', createdAt: '2024-01-05', views: 312, comments: 15 },
];

export const myComments = [
    { id: 1, postTitle: 'Next.js 14 App Router 사용기', content: '저도 비슷한 경험이 있어서 공감되네요!', createdAt: '2024-01-14' },
    { id: 2, postTitle: 'TailwindCSS 유용한 팁', content: '이 방법 정말 좋네요. 감사합니다!', createdAt: '2024-01-12' },
    { id: 3, postTitle: 'Docker 입문 가이드', content: '초보자에게 정말 도움이 되는 글이네요', createdAt: '2024-01-08' },
];

export const bookmarkedCourses = [
    { id: 1, title: 'React 완벽 마스터', academy: '코딩마스터', category: '프론트엔드', rating: 4.8 },
    { id: 2, title: 'TypeScript 실전 프로젝트', academy: '소프트웨어 아카데미', category: '프론트엔드', rating: 4.9 },
    { id: 3, title: 'Node.js 백엔드 개발', academy: '데이터 인사이트', category: '백엔드', rating: 4.7 },
];

export const recentActivity = [
    { type: 'post', title: 'React 19 새로운 기능 정리', date: '2024-01-15' },
    { type: 'comment', title: 'Next.js 14 App Router 사용기에 댓글', date: '2024-01-14' },
    { type: 'bookmark', title: 'TypeScript 실전 프로젝트를 찜함', date: '2024-01-13' },
];

// Helpers
export const getAccountTypeLabel = (type: string) => {
    switch (type) {
        case 'ADMIN': return '관리자';
        case 'ACADEMY': return '교육기관';
        case 'USER': return '일반회원';
        default: return type;
    }
};

export const getApprovalStatusLabel = (status: string) => {
    switch (status) {
        case 'APPROVED': return '승인됨';
        case 'PENDING': return '대기중';
        case 'REJECTED': return '거부됨';
        default: return status;
    }
};

export const getApprovalStatusColor = (status: string) => {
    switch (status) {
        case 'APPROVED': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
        case 'PENDING': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
        case 'REJECTED': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
        default: return 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400';
    }
};
