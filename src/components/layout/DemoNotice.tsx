const DemoNotice = () => {
    return (
        <section
            className="border-b border-amber-200 bg-amber-50"
            aria-label="데모 사이트 안내"
        >
            <div className="container mx-auto px-4 py-3">
                <p className="text-center text-sm font-semibold leading-6 text-amber-900 sm:text-base">
                    이 사이트는 쇼케이스용 데모 사이트입니다. 사이트에 표시된 기관, 연락처, 이메일을 포함한 모든 내용은 가상의 내용입니다.
                </p>
            </div>
        </section>
    );
};

export default DemoNotice;
