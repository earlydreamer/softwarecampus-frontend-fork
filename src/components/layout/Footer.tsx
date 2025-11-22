
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-slate-900 text-slate-300 py-12">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-4">SoftCampus</h3>
                        <p className="text-sm text-slate-400">
                            미래를 여는 기술 교육의 중심,<br />
                            소프트웨어캠퍼스와 함께하세요.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-white font-semibold mb-4">교육 과정</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/lectures?category=frontend" className="hover:text-white transition-colors">프론트엔드</Link></li>
                            <li><Link to="/lectures?category=backend" className="hover:text-white transition-colors">백엔드</Link></li>
                            <li><Link to="/lectures?category=cloud" className="hover:text-white transition-colors">클라우드</Link></li>
                            <li><Link to="/lectures?category=ai" className="hover:text-white transition-colors">AI/빅데이터</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-semibold mb-4">고객지원</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/community?category=notice" className="hover:text-white transition-colors">공지사항</Link></li>
                            <li><Link to="/faq" className="hover:text-white transition-colors">자주 묻는 질문</Link></li>
                            <li><Link to="/inquiry" className="hover:text-white transition-colors">1:1 문의</Link></li>
                            <li><Link to="/location" className="hover:text-white transition-colors">오시는 길</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-semibold mb-4">Contact</h4>
                        <ul className="space-y-2 text-sm">
                            <li>Tel: 02-1234-5678</li>
                            <li>Email: help@softcampus.com</li>
                            <li>Seoul, Korea</li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
                    &copy; {new Date().getFullYear()} SoftCampus. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
