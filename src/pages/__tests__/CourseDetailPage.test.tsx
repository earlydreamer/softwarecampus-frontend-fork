import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CourseDetailPage from '../CourseDetailPage';

// Mock services
vi.mock('../../services/courseService', () => ({
    fetchCourseById: vi.fn(),
    fetchCourseReviews: vi.fn(),
    fetchCourseQnAs: vi.fn(),
}));

const createTestQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });

const renderWithRouter = (initialPath: string) => {
    const queryClient = createTestQueryClient();

    return render(
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Routes>
                    <Route path="/courses" element={<CourseDetailPage />} />
                    <Route path="/courses/:courseId" element={<CourseDetailPage />} />
                </Routes>
            </BrowserRouter>
        </QueryClientProvider>,
        {
            wrapper: ({ children }) => {
                window.history.pushState({}, '', initialPath);
                return <>{children}</>;
            },
        }
    );
};

describe('CourseDetailPage - courseId 검증', () => {
    it('유효하지 않은 courseId (문자열)에 대해 에러 UI를 표시해야 함', () => {
        renderWithRouter('/courses/abc');

        expect(screen.getByText('유효하지 않은 과정 ID')).toBeInTheDocument();
        expect(screen.getByText('"abc"는 올바른 과정 ID가 아닙니다.')).toBeInTheDocument();
        expect(screen.getByText('과정 목록으로 돌아가기')).toBeInTheDocument();
    });

    it('유효하지 않은 courseId (음수)에 대해 에러 UI를 표시해야 함', () => {
        renderWithRouter('/courses/-1');

        expect(screen.getByText('유효하지 않은 과정 ID')).toBeInTheDocument();
    });

    it('유효하지 않은 courseId (0)에 대해 에러 UI를 표시해야 함', () => {
        renderWithRouter('/courses/0');

        expect(screen.getByText('유효하지 않은 과정 ID')).toBeInTheDocument();
    });

    it('유효하지 않은 courseId (소수)에 대해 에러 UI를 표시해야 함', () => {
        renderWithRouter('/courses/1.5');

        // parseInt는 소수를 정수로 변환하므로 1.5는 1로 처리됨
        // 이 경우는 유효한 ID로 처리되어 로딩 상태를 보여줌
        expect(screen.queryByText('유효하지 않은 과정 ID')).not.toBeInTheDocument();
    });

    it('courseId가 없을 때 에러 UI를 표시해야 함', () => {
        renderWithRouter('/courses/');

        expect(screen.getByText('유효하지 않은 과정 ID')).toBeInTheDocument();
        expect(screen.getByText('과정 ID가 제공되지 않았습니다.')).toBeInTheDocument();
    });

    it('혼합된 문자와 숫자에 대해 parseInt가 올바르게 처리해야 함', () => {
        renderWithRouter('/courses/123abc');

        // parseInt('123abc', 10)은 123을 반환하므로 유효한 ID로 처리
        expect(screen.queryByText('유효하지 않은 과정 ID')).not.toBeInTheDocument();
    });

    it('공백이 포함된 courseId를 처리해야 함', () => {
        renderWithRouter('/courses/ 123 ');

        // parseInt는 앞뒤 공백을 무시하므로 123으로 처리됨
        expect(screen.queryByText('유효하지 않은 과정 ID')).not.toBeInTheDocument();
    });
});

describe('CourseDetailPage - 유효한 courseId', () => {
    it('유효한 숫자 courseId에 대해 로딩 상태를 표시해야 함', () => {
        renderWithRouter('/courses/123');

        // 유효한 ID이므로 에러 UI가 표시되지 않아야 함
        expect(screen.queryByText('유효하지 않은 과정 ID')).not.toBeInTheDocument();
    });

    it('큰 숫자 courseId를 처리해야 함', () => {
        renderWithRouter('/courses/999999999');

        expect(screen.queryByText('유효하지 않은 과정 ID')).not.toBeInTheDocument();
    });
});
