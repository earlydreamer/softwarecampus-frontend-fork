import { useState } from 'react';

const DemoNotice = () => {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) {
        return null;
    }

    return (
        <section
            className="border-b border-amber-200 bg-amber-50"
            aria-label="데모 사이트 안내"
        >
            <div className="container mx-auto flex items-start justify-between gap-3 px-4 py-3">
                <p className="text-sm font-semibold leading-6 text-amber-900 sm:text-base">
                    이 사이트는 쇼케이스용 데모 사이트입니다. 사이트에 표시된 기관, 연락처, 이메일을 포함한 모든 내용은 가상의 내용입니다.
                </p>
                <button
                    type="button"
                    className="shrink-0 rounded-md border border-amber-300 bg-white/70 px-2 py-1 text-xs font-semibold text-amber-900 transition hover:bg-white"
                    aria-label="데모 안내 닫기"
                    onClick={() => setIsVisible(false)}
                >
                    X
                </button>
            </div>
        </section>
    );
};

export default DemoNotice;
