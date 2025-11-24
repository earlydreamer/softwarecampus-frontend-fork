import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, ChevronRight, User, LogOut } from 'lucide-react';
import { rawCourseNav, rawCommunityNav } from '../../constants/navigation';
import type { QueryParams } from '../../constants/navigation';
import { useAuthStore } from '../../store/authStore';

// Helper to build URL with query params
const buildPath = (basePath: string, query?: QueryParams): string => {
    if (!query || Object.keys(query).length === 0) return basePath;
    const params = new URLSearchParams();
    if (query.category) params.set('category', query.category);
    if (query.target) params.set('target', query.target);
    if (query.format) params.set('format', query.format);
    const queryString = params.toString();
    return queryString ? `${basePath}?${queryString}` : basePath;
};

const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuthStore();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
        setActiveDropdown(null);
    }, [location]);

    const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
        `text-sm font-medium transition-colors ${isActive ? 'text-primary-600' : 'text-slate-600 hover:text-primary-600'
        }`;

    return (
        <header
            className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'bg-white/50 backdrop-blur-sm py-5'
                }`}
        >
            <div className="container mx-auto px-4 flex items-center justify-between">
                <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent z-50 relative">
                    SoftCampus
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden lg:flex items-center gap-8">
                    {/* Course Navigation (Mega Menu) */}
                    {rawCourseNav.map((node) => (
                        <div key={node.label} className="relative group">
                            {node.isClickable ? (
                                <Link
                                    to={buildPath('/lectures', node.query)}
                                    className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-primary-600 py-2"
                                >
                                    {node.label}
                                    <ChevronDown className="w-4 h-4" />
                                </Link>
                            ) : (
                                <button
                                    className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-primary-600 py-2 focus:outline-none focus:text-primary-600"
                                    aria-haspopup="true"
                                    aria-expanded="false"
                                >
                                    {node.label}
                                    <ChevronDown className="w-4 h-4" />
                                </button>
                            )}

                            {/* Dropdown */}
                            <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 group-focus-within:translate-y-0">
                                <div className="w-64 bg-white rounded-xl shadow-xl border border-slate-100 p-2">
                                    {node.children?.map((child) => (
                                        <div key={child.label} className="relative group/sub">
                                            {child.isClickable ? (
                                                <Link
                                                    to={buildPath('/lectures', { ...node.query, ...child.query })}
                                                    className="flex items-center justify-between px-4 py-2.5 rounded-lg hover:bg-slate-50 text-sm text-slate-700 hover:text-primary-600"
                                                >
                                                    {child.label}
                                                    <ChevronRight className="w-4 h-4 text-slate-400" />
                                                </Link>
                                            ) : (
                                                <div className="flex items-center justify-between px-4 py-2.5 rounded-lg hover:bg-slate-50 text-sm text-slate-700 hover:text-primary-600">
                                                    {child.label}
                                                    <ChevronRight className="w-4 h-4 text-slate-400" />
                                                </div>
                                            )}

                                            {/* Sub Dropdown */}
                                            {child.children && (
                                                <div className="absolute left-full top-0 pl-2 opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible group-focus-within/sub:opacity-100 group-focus-within/sub:visible transition-all duration-200 transform translate-x-2 group-hover/sub:translate-x-0 group-focus-within/sub:translate-x-0">
                                                    <div className="w-56 bg-white rounded-xl shadow-xl border border-slate-100 p-2 max-h-[80vh] overflow-y-auto">
                                                        {child.children.map((subChild) => (
                                                            <Link
                                                                key={subChild.label}
                                                                to={buildPath('/lectures', { ...node.query, ...child.query, ...subChild.query })}
                                                                className="block px-4 py-2 rounded-lg hover:bg-slate-50 text-sm text-slate-600 hover:text-primary-600"
                                                            >
                                                                {subChild.label}
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}

                    <NavLink to="/academies" className={navLinkClasses}>
                        훈련기관
                    </NavLink>

                    {/* Community Dropdown */}
                    <div className="relative group">
                        <NavLink to="/community" className={navLinkClasses}>
                            <span className="flex items-center gap-1">
                                커뮤니티
                                <ChevronDown className="w-4 h-4" />
                            </span>
                        </NavLink>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 group-focus-within:translate-y-0">
                            <div className="w-40 bg-white rounded-xl shadow-xl border border-slate-100 p-2">
                                {rawCommunityNav.children?.map((child) => (
                                    <Link
                                        key={child.label}
                                        to={buildPath('/community', child.query)}
                                        className="block px-4 py-2 rounded-lg hover:bg-slate-50 text-sm text-slate-600 hover:text-primary-600"
                                    >
                                        {child.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Auth Buttons */}
                <div className="hidden lg:flex items-center gap-4">
                    {isAuthenticated && user ? (
                        <>
                            {(user.accountType === 'ADMIN' || user.accountType === 'ACADEMY') && (
                                <Link
                                    to="/admin"
                                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                >
                                    <span className="text-sm font-medium">
                                        {user.accountType === 'ADMIN' ? '관리자' : '기관 센터'}
                                    </span>
                                </Link>
                            )}
                            <Link to="/mypage" className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                <User className="w-4 h-4" />
                                <span className="text-sm font-medium">{user.userName}</span>
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="text-sm font-medium">로그아웃</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200">로그인</Link>
                            <Link to="/signup" className="px-5 py-2.5 rounded-full bg-slate-900 dark:bg-primary-600 text-white text-sm font-medium hover:bg-slate-800 dark:hover:bg-primary-700 transition-colors shadow-lg shadow-slate-900/20">
                                회원가입
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="lg:hidden p-2 text-slate-600 z-50 relative"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label={isMobileMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
                    aria-expanded={isMobileMenuOpen}
                >
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-white z-40 pt-24 px-6 overflow-y-auto lg:hidden">
                    <div className="flex flex-col gap-6">
                        {rawCourseNav.map((node) => (
                            <div key={node.label}>
                                <button
                                    className="flex items-center justify-between w-full text-lg font-semibold text-slate-900 mb-2"
                                    onClick={() => setActiveDropdown(activeDropdown === node.label ? null : node.label)}
                                >
                                    {node.label}
                                    <ChevronDown className={`w-5 h-5 transition-transform ${activeDropdown === node.label ? 'rotate-180' : ''}`} />
                                </button>

                                {activeDropdown === node.label && (
                                    <div className="pl-4 space-y-4 mt-2 border-l-2 border-slate-100">
                                        {node.children?.map((child) => (
                                            <div key={child.label}>
                                                <div className="font-medium text-slate-700 mb-2">{child.label}</div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {child.children?.map((subChild) => (
                                                        <Link
                                                            key={subChild.label}
                                                            to={buildPath('/lectures', { ...node.query, ...child.query, ...subChild.query })}
                                                            className="text-sm text-slate-500 py-1"
                                                        >
                                                            {subChild.label}
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        <Link to="/academies" className="text-lg font-semibold text-slate-900">훈련기관</Link>

                        <div>
                            <div className="text-lg font-semibold text-slate-900 mb-2">커뮤니티</div>
                            <div className="pl-4 space-y-2 border-l-2 border-slate-100">
                                {rawCommunityNav.children?.map((child) => (
                                    <Link
                                        key={child.label}
                                        to={buildPath('/community', child.query)}
                                        className="block text-slate-600 py-1"
                                    >
                                        {child.label}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 mt-8 pb-10">
                            {isAuthenticated && user ? (
                                <>
                                    {(user.accountType === 'ADMIN' || user.accountType === 'ACADEMY') && (
                                        <Link to="/admin" className="w-full py-3 text-center rounded-xl bg-red-50 dark:bg-red-900/20 font-semibold text-red-600 dark:text-red-400 flex items-center justify-center gap-2">
                                            {user.accountType === 'ADMIN' ? '관리자 페이지' : '기관 센터'}
                                        </Link>
                                    )}
                                    <Link to="/mypage" className="w-full py-3 text-center rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2">
                                        <User className="w-5 h-5" />
                                        {user.userName}
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full py-3 text-center rounded-xl border border-slate-200 dark:border-slate-600 font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        로그아웃
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="w-full py-3 text-center rounded-xl border border-slate-200 dark:border-slate-600 font-semibold text-slate-700 dark:text-slate-300">로그인</Link>
                                    <Link to="/signup" className="w-full py-3 text-center rounded-xl bg-slate-900 dark:bg-primary-600 text-white font-semibold shadow-lg">회원가입</Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
