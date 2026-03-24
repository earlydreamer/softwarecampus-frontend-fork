
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-slate-900 dark:bg-slate-950 text-slate-300 py-12" aria-label="Site footer">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-4">SoftwareCampus</h3>
                        <p className="text-sm text-slate-400">
                            미래를 여는 기술 교육의 중심,<br />
                            소프트웨어캠퍼스와 함께하세요.
                        </p>
                    </div>
                    <nav aria-label="Sitemap">
                        <h4 className="text-white font-semibold mb-4">사이트맵</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/lectures?target=student" className="hover:text-white transition-colors" aria-label="취업예정자 과정 보기">취업예정자 과정</Link></li>
                            <li><Link to="/lectures?target=employee" className="hover:text-white transition-colors" aria-label="재직자 과정 보기">재직자 과정</Link></li>
                            <li><Link to="/academies" className="hover:text-white transition-colors" aria-label="훈련기관 보기">훈련기관</Link></li>
                            <li><Link to="/community" className="hover:text-white transition-colors" aria-label="커뮤니티 보기">커뮤니티</Link></li>
                        </ul>
                    </nav>
                    <nav aria-label="Support">
                        <h4 className="text-white font-semibold mb-4">고객지원</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/community?category=notice" className="hover:text-white transition-colors" aria-label="공지사항 확인하기">공지사항</Link></li>
                            <li><Link to="/community?category=question" className="hover:text-white transition-colors" aria-label="자주 묻는 질문 확인하기">자주 묻는 질문</Link></li>
                            <li><Link to="/community/write" className="hover:text-white transition-colors" aria-label="1대1 문의하기">1:1 문의</Link></li>
                            <li><Link to="/academies" className="hover:text-white transition-colors" aria-label="오시는 길 확인하기">오시는 길</Link></li>
                            <li><Link to="/privacy" className="hover:text-white transition-colors" aria-label="개인정보 처리방침 확인하기">개인정보 처리방침</Link></li>
                        </ul>
                    </nav>
                    <div>
                        <h4 className="text-white font-semibold mb-4">Contact</h4>
                        <ul className="space-y-2 text-sm">
                            <li>Tel: 02-0000-0000</li>
                            <li>Email: showcase@softwarecampus.example.test</li>
                            <li>Demo City, Korea</li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-slate-800 dark:border-slate-900 pt-8 text-center text-sm text-slate-500">
                    <p className="mb-2 text-xs text-slate-600">
                        사이트 개발 중 채택되지 않은 B안으로, 포트폴리오 용도로 사용을 허가받았습니다.
                    </p>
                    &copy; {new Date().getFullYear()} SoftwareCampus. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
