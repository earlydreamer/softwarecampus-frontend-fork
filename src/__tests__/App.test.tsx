import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

vi.mock('../pages/LandingPage', () => ({
    default: () => <div>랜딩 페이지</div>,
}));

vi.mock('../pages/CourseListPage', () => ({
    default: () => <div>과정 목록 페이지</div>,
}));

vi.mock('../pages/CourseDetailPage', () => ({
    default: () => <div>과정 상세 페이지</div>,
}));

vi.mock('../pages/AcademyListPage', () => ({
    default: () => <div>훈련기관 목록 페이지</div>,
}));

vi.mock('../pages/AcademyDetailPage', () => ({
    default: () => <div>훈련기관 상세 페이지</div>,
}));

vi.mock('../pages/AcademyCreatePage', () => ({
    default: () => <div>훈련기관 등록 페이지</div>,
}));

vi.mock('../pages/CommunityPage', () => ({
    default: () => <div>커뮤니티 페이지</div>,
}));

vi.mock('../pages/CommunityDetailPage', () => ({
    default: () => <div>커뮤니티 상세 페이지</div>,
}));

vi.mock('../pages/CommunityWritePage', () => ({
    default: () => <div>커뮤니티 작성 페이지</div>,
}));

vi.mock('../pages/CommunityEditPage', () => ({
    default: () => <div>커뮤니티 수정 페이지</div>,
}));

vi.mock('../pages/LoginPage', () => ({
    default: () => <div>로그인 페이지</div>,
}));

vi.mock('../pages/SignupPage', () => ({
    default: () => <div>회원가입 페이지</div>,
}));

vi.mock('../pages/ForgotPasswordPage', () => ({
    default: () => <div>비밀번호 찾기 페이지</div>,
}));

vi.mock('../pages/MyPage', () => ({
    default: () => <div>마이페이지</div>,
}));

vi.mock('../pages/AdminPage', () => ({
    default: () => <div>관리자 페이지</div>,
}));

vi.mock('../pages/PlaceholderPage', () => ({
    default: ({ title, description }: { title: string; description: string }) => (
        <div>
            <h1>{title}</h1>
            <p>{description}</p>
        </div>
    ),
}));

vi.mock('../pages/NotFound', () => ({
    default: () => <div>404 페이지</div>,
}));

describe('App', () => {
    it('전역 데모 안내 문구를 표시해야 함', () => {
        window.history.pushState({}, '', '/');

        render(<App />);

        expect(
            screen.getByText('이 사이트는 쇼케이스용 데모 사이트입니다. 사이트에 표시된 기관, 연락처, 이메일을 포함한 모든 내용은 가상의 내용입니다.')
        ).toBeInTheDocument();
    });
});
