import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// 간단한 테스트 컴포넌트
function TestComponent() {
    return (
        <div>
            <h1>소프트웨어 캠퍼스</h1>
            <p>테스트 환경이 정상적으로 설정되었습니다.</p>
        </div>
    );
}

describe('테스트 환경 설정 검증', () => {
    it('컴포넌트가 정상적으로 렌더링되어야 함', () => {
        render(
            <BrowserRouter>
                <TestComponent />
            </BrowserRouter>
        );

        expect(screen.getByText('소프트웨어 캠퍼스')).toBeInTheDocument();
        expect(screen.getByText('테스트 환경이 정상적으로 설정되었습니다.')).toBeInTheDocument();
    });

    it('기본 assertion이 작동해야 함', () => {
        expect(1 + 1).toBe(2);
        expect('test').toBeTruthy();
        expect([1, 2, 3]).toHaveLength(3);
    });
});
