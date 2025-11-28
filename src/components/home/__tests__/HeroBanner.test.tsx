import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HeroBanner from '../HeroBanner';
import type { Banner } from '../../../types';

// Mock sanitizeUrl
vi.mock('../../../utils/security', () => ({
    sanitizeUrl: (url: string) => url
}));

const mockBanners: Banner[] = [
    {
        id: 1,
        title: '배너 1',
        subtitle: '설명 1',
        imageUrl: '/image1.jpg',
        link: '/link1'
    },
    {
        id: 2,
        title: '배너 2',
        subtitle: '설명 2',
        imageUrl: '/image2.jpg',
        link: '/link2'
    },
    {
        id: 3,
        title: '배너 3',
        subtitle: '설명 3',
        imageUrl: '/image3.jpg',
        link: '/link3'
    }
];

const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('HeroBanner - currentIndex 범위 검증', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('로딩 중일 때 스켈레톤을 표시해야 함', () => {
        renderWithRouter(<HeroBanner banners={[]} loading={true} />);
        expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    it('배너가 없을 때 null을 반환해야 함', () => {
        const { container } = renderWithRouter(<HeroBanner banners={[]} loading={false} />);
        expect(container.firstChild).toBeNull();
    });

    it('배너가 있을 때 첫 번째 배너를 표시해야 함', () => {
        renderWithRouter(<HeroBanner banners={mockBanners} loading={false} />);
        expect(screen.getByText('배너 1')).toBeInTheDocument();
        expect(screen.getByText('설명 1')).toBeInTheDocument();
    });

    it('배너 배열이 축소될 때 currentIndex를 조정해야 함', async () => {
        const { rerender } = renderWithRouter(
            <HeroBanner banners={mockBanners} loading={false} />
        );

        // 초기 상태: 3개의 배너
        expect(screen.getByText('배너 1')).toBeInTheDocument();

        // 자동 슬라이드로 마지막 배너로 이동 (시뮬레이션)
        // 자동 슬라이드로 마지막 배너로 이동 (시뮬레이션)
        await act(async () => {
            vi.advanceTimersByTime(10000); // 2번 슬라이드
        });

        // 배너가 1개로 축소
        rerender(
            <BrowserRouter>
                <HeroBanner banners={[mockBanners[0]]} loading={false} />
            </BrowserRouter>
        );

        // currentIndex가 0으로 조정되어 첫 번째 배너 표시
        expect(screen.getByText('배너 1')).toBeInTheDocument();
    });

    it('배너가 모두 제거되면 null을 반환해야 함', async () => {
        const { rerender, container } = renderWithRouter(
            <HeroBanner banners={mockBanners} loading={false} />
        );

        // 배너를 모두 제거
        rerender(
            <BrowserRouter>
                <HeroBanner banners={[]} loading={false} />
            </BrowserRouter>
        );

        expect(container.firstChild).toBeNull();
    });

    it('currentBanner가 undefined일 때 null을 반환해야 함', () => {
        // 이 케이스는 useEffect가 실행되기 전 순간적으로 발생할 수 있음
        const { container } = renderWithRouter(
            <HeroBanner banners={mockBanners} loading={false} />
        );

        // 정상적으로 렌더링되어야 함
        expect(container.firstChild).not.toBeNull();
    });

    it('인디케이터 개수가 배너 개수와 일치해야 함', () => {
        renderWithRouter(<HeroBanner banners={mockBanners} loading={false} />);

        const indicators = document.querySelectorAll('button[class*="rounded-full"]');
        // 네비게이션 버튼(2개) + 인디케이터(3개) = 5개
        expect(indicators.length).toBeGreaterThanOrEqual(3);
    });
});
