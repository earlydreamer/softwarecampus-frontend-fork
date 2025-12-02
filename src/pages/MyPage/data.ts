// ===== Helper Functions =====
// 마이페이지에서 사용하는 유틸리티 함수들

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

export const getCategoryLabel = (category: string) => {
    switch (category) {
        case 'CODING_STORY': return '코딩이야기';
        case 'COURSE_STORY': return '진로이야기';
        case 'NOTICE': return '공지사항';
        case 'QUESTION': return '문의사항';
        default: return category;
    }
};
