import React, { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { MenuIcon, XIcon, SunIcon, MoonIcon, UserCircleIcon, ChevronDown, ChevronUp } from '../icons/Icons';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import { rawCourseNav, rawCommunityNav, QueryParams, RawNavNode } from '../../constants/navigation';

interface BuiltNavNode extends RawNavNode {
  path: string;
  query: QueryParams;
  children?: BuiltNavNode[];
}

/**
 * 기본 path와 query 객체를 조합하여 최종 URL 생성
 */
const buildPath = (basePath: string, query?: QueryParams): string => {
  if (!query || Object.keys(query).length === 0) {
    return basePath;
  }
  
  const params = new URLSearchParams();
  if (query.category) params.set('category', query.category);
  if (query.target) params.set('target', query.target);
  if (query.format) params.set('format', query.format);
  if (query.q) params.set('q', query.q);
  
  const queryString = params.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
};

const buildCourseNav = (nodes: RawNavNode[], parentQuery: QueryParams = {}): BuiltNavNode[] =>
  nodes.map((node) => {
    const mergedQuery: QueryParams = {
      ...parentQuery,
      ...node.query
    };

    const params = new URLSearchParams();
    if (mergedQuery.target) params.set('target', mergedQuery.target);
    if (mergedQuery.format) params.set('format', mergedQuery.format);
    if (mergedQuery.q) params.set('q', mergedQuery.q);

    return {
      label: node.label,
      path: `/lectures${params.toString() ? `?${params.toString()}` : ''}`,
      query: node.query ?? {},
      children: node.children ? buildCourseNav(node.children, mergedQuery) : undefined
    };
  });

const isQueryMatch = (current: URLSearchParams, query: QueryParams): boolean => {
  const keys = Object.keys(query) as Array<keyof QueryParams>;
  if (keys.length === 0) {
    return false;
  }
  return keys.every((key) => {
    const expected = query[key];
    
    // undefined, null, 빈 문자열은 매칭하지 않음
    if (expected === undefined || expected === null) {
      return false;
    }
    
    // 빈 문자열은 매칭하지 않음
    if (expected === '') {
      return false;
    }
    
    const actual = current.get(key);
    if (!actual) {
      return false;
    }
    if (key === 'q') {
      return actual.toLowerCase() === expected.toLowerCase();
    }
    return actual === expected;
  });
};

const joinClasses = (...classes: Array<string | false | null | undefined>): string =>
  classes.filter(Boolean).join(' ');

interface CourseMegaMenuProps {
  top: BuiltNavNode;
  searchParams: URLSearchParams;
  isLecturesPage: boolean;
  topLinkClasses: (active: boolean) => string;
  subLinkClasses: (active: boolean) => string;
  leafLinkClasses: (active: boolean) => string;
}

const CourseMegaMenu: React.FC<CourseMegaMenuProps> = ({
  top,
  searchParams,
  isLecturesPage,
  topLinkClasses,
  subLinkClasses,
  leafLinkClasses
}) => {
  const [open, setOpen] = useState(false);
  const [hoveredSecond, setHoveredSecond] = useState<BuiltNavNode | null>(null);
  const [shouldFlipThirdLevel, setShouldFlipThirdLevel] = useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const thirdLevelRef = React.useRef<HTMLDivElement>(null);

  const topActive = isLecturesPage && isQueryMatch(searchParams, top.query);

  useEffect(() => {
    if (!open) {
      setHoveredSecond(null);
    }
  }, [open]);

  // 3단계 메뉴가 화면 밖으로 나가는지 체크
  useEffect(() => {
    if (!hoveredSecond || !thirdLevelRef.current) {
      return;
    }

    const checkOverflow = () => {
      const rect = thirdLevelRef.current?.getBoundingClientRect();
      if (rect) {
        const wouldOverflow = rect.right > window.innerWidth;
        setShouldFlipThirdLevel(wouldOverflow);
      }
    };

    // 초기 체크
    checkOverflow();

    // 윈도우 리사이즈 시 재체크
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [hoveredSecond]);

  const thirdLevelItems = hoveredSecond?.children ?? [];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen((prev) => !prev);
      if (!open) {
        // 메뉴 열릴 때 첫 번째 항목으로 포커스 이동
        setTimeout(() => {
          const firstLink = menuRef.current?.querySelector('a');
          firstLink?.focus();
        }, 0);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    // 포커스가 메뉴 밖으로 벗어나면 닫기
    if (!menuRef.current?.contains(e.relatedTarget as Node)) {
      setOpen(false);
    }
  };

  return (
    <div 
      className="relative" 
      onMouseEnter={() => setOpen(true)} 
      onMouseLeave={() => setOpen(false)}
      onBlur={handleBlur}
      ref={menuRef}
    >
      <Link 
        to={top.path} 
        className={topLinkClasses(topActive)}
        aria-haspopup="true"
        aria-expanded={open}
        onKeyDown={handleKeyDown}
        onFocus={() => setOpen(true)}
      >
        {top.label}
      </Link>
      {top.children && top.children.length > 0 && (
        <div
          className={joinClasses(
            'absolute left-0 top-full pt-2 transform-gpu transition-all duration-200',
            open ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0 pointer-events-none'
          )}
        >
          <div className="relative rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900">
            <div className="w-60 p-4">
              <ul className="space-y-0.5" role="menu">
                {top.children.map((second) => {
                  const secondActive =
                    isLecturesPage && isQueryMatch(searchParams, { ...top.query, ...second.query });
                  const isHovered = hoveredSecond?.label === second.label;
                  return (
                    <li
                      key={second.label}
                      onMouseEnter={() => setHoveredSecond(second)}
                      role="none"
                    >
                      <Link
                        to={second.path}
                        className={joinClasses(subLinkClasses(secondActive), 'flex items-center justify-between')}
                        role="menuitem"
                        onFocus={() => setHoveredSecond(second)}
                      >
                        <span>{second.label}</span>
                        {second.children && second.children.length > 0 && (
                          <span className="text-xs text-gray-400">{isHovered ? '−' : '+'}</span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
            {hoveredSecond && thirdLevelItems.length > 0 && (
              <div 
                ref={thirdLevelRef}
                className={joinClasses(
                  'absolute top-0 ml-0 w-56 rounded-xl border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-700 dark:bg-gray-900',
                  shouldFlipThirdLevel ? 'right-full mr-0' : 'left-full'
                )}
              >
                <div className="space-y-0.5" role="menu">
                  {thirdLevelItems.map((third) => {
                    const thirdActive = isLecturesPage
                      ? isQueryMatch(searchParams, { ...top.query, ...hoveredSecond.query, ...third.query })
                      : false;
                    return (
                      <Link 
                        key={third.label} 
                        to={third.path} 
                        className={leafLinkClasses(thirdActive)}
                        role="menuitem"
                      >
                        {third.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * 커뮤니티 드롭다운 메뉴 컴포넌트
 */
interface CommunityDropdownProps {
  searchParams: URLSearchParams;
  topLinkClasses: (active: boolean) => string;
  leafLinkClasses: (active: boolean) => string;
}

const CommunityDropdown: React.FC<CommunityDropdownProps> = ({
  searchParams,
  topLinkClasses,
  leafLinkClasses
}) => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isCommunityPage = location.pathname.startsWith('/community');
  const currentCategory = searchParams.get('category');

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <NavLink
        to="/community"
        className={({ isActive }) => topLinkClasses(isActive)}
      >
        커뮤니티
      </NavLink>

      {open && (
        <div className="absolute left-0 top-full pt-2 z-50">
          <div className="w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2">
            {rawCommunityNav.children?.map((item) => {
              const isActive = isCommunityPage && (
                (!item.query?.category && !currentCategory) ||
                (item.query?.category === currentCategory)
              );
              
              // 부모의 path와 자식의 query를 조합하여 최종 URL 생성
              const itemPath = buildPath(rawCommunityNav.path || '/community', item.query);
              
              return (
                <Link
                  key={item.label}
                  to={itemPath}
                  className={leafLinkClasses(isActive)}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openMobileGroup, setOpenMobileGroup] = useState<string | null>(null);
  const [openMobileSubGroup, setOpenMobileSubGroup] = useState<string | null>(null);
  const { theme, toggleTheme } = useThemeStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const courseNav = useMemo(() => buildCourseNav(rawCourseNav), []);

  const isLecturesPage = location.pathname.startsWith('/lectures');

  // 권한이 필요한 페이지 목록
  const protectedRoutes = {
    '/mypage': ['admin', 'user', 'academy'],
    '/admin': ['admin', 'academy']
  };

  // 로그아웃 처리 함수
  const handleLogout = () => {
    logout();
    
    // 현재 페이지가 권한이 필요한 페이지인지 확인
    const currentPath = location.pathname;
    const needsRedirect = Object.keys(protectedRoutes).some(route => {
      // 정확한 경로 매치 또는 하위 경로 매치
      return currentPath === route || currentPath.startsWith(route + '/');
    });
    
    if (needsRedirect) {
      navigate('/');
    }
  };

  const topLinkClasses = (active: boolean): string =>
    joinClasses(
      'inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap',
      active
        ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-dark border border-primary/60'
        : 'text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-dark hover:bg-primary/5'
    );

  const subLinkClasses = (active: boolean): string =>
    joinClasses(
      'block rounded-md px-3 py-2 text-sm transition-colors border',
      active
        ? 'border-primary/70 bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-dark'
        : 'border-transparent text-gray-700 dark:text-gray-200 hover:border-primary/40 hover:bg-primary/5'
    );

  const leafLinkClasses = (active: boolean): string =>
    joinClasses(
      'block rounded-md px-3 py-1.5 text-sm transition-colors border',
      active
        ? 'border-primary/70 bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-dark'
        : 'border-transparent text-gray-600 dark:text-gray-300 hover:border-primary/40 hover:bg-primary/5'
    );

  const mobileTopButtonClasses = (active: boolean): string =>
    joinClasses(
      'flex w-full items-center justify-between px-3 py-3 text-left text-sm font-semibold',
      active
        ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-dark'
        : 'text-gray-700 dark:text-gray-200'
    );

  const mobileSecondaryButtonClasses = (active: boolean): string =>
    joinClasses(subLinkClasses(active), 'w-full text-left');

  const mobileNavLinkClasses = (active: boolean): string =>
    joinClasses(
      'block rounded-md px-3 py-2 text-sm font-medium',
      active
        ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-dark'
        : 'text-gray-700 dark:text-gray-200'
    );

  const handleCloseMobileMenu = () => {
    setIsMenuOpen(false);
    setOpenMobileGroup(null);
    setOpenMobileSubGroup(null);
  };

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-40 w-full border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
              <span className="text-xl font-bold text-primary dark:text-primary-dark">소프트캠퍼스</span>
            </Link>
            <nav className="hidden md:flex md:items-center md:space-x-1">
              {courseNav.map((top) => (
                <CourseMegaMenu
                  key={top.label}
                  top={top}
                  searchParams={searchParams}
                  isLecturesPage={isLecturesPage}
                  topLinkClasses={topLinkClasses}
                  subLinkClasses={subLinkClasses}
                  leafLinkClasses={leafLinkClasses}
                />
              ))}
              <NavLink to="/academies" className={({ isActive }) => topLinkClasses(isActive)}>
                훈련기관
              </NavLink>
              <CommunityDropdown
                searchParams={searchParams}
                topLinkClasses={topLinkClasses}
                leafLinkClasses={leafLinkClasses}
              />
              {isAuthenticated && (
                <NavLink to="/mypage" className={({ isActive }) => topLinkClasses(isActive)}>
                  마이페이지
                </NavLink>
              )}
              {isAuthenticated && (user?.accountType === 'ADMIN' || user?.accountType === 'ACADEMY') && (
                <NavLink to="/admin" className={({ isActive }) => topLinkClasses(isActive)}>
                  관리자
                </NavLink>
              )}
            </nav>
          </div>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="테마 전환"
            >
              {theme === 'dark' ? <SunIcon className="w-5 h-5 text-yellow-400" /> : <MoonIcon className="w-5 h-5 text-gray-600" />}
            </button>
            <div className="hidden md:flex items-center space-x-3 text-sm font-medium">
              {isAuthenticated ? (
                <>
                  <span className="text-gray-600 dark:text-gray-300">
                    {user?.id}님
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-3 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition-colors"
                  >
                    <UserCircleIcon className="w-5 h-5" />
                    <span>로그아웃</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center space-x-2 px-3 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition-colors"
                >
                  <UserCircleIcon className="w-5 h-5" />
                  <span>로그인</span>
                </Link>
              )}
            </div>
            <div className="md:hidden">
              <button
                type="button"
                onClick={() => {
                  const next = !isMenuOpen;
                  setIsMenuOpen(next);
                  if (!next) {
                    setOpenMobileGroup(null);
                    setOpenMobileSubGroup(null);
                  }
                }}
                className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
                aria-label="모바일 메뉴"
              >
                {isMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="px-4 py-4 space-y-4">
            {courseNav.map((top) => {
              const isOpen = openMobileGroup === top.label;
              const topActive = isLecturesPage && isQueryMatch(searchParams, top.query);
              return (
                <div key={top.label} className="rounded-lg border border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => {
                      const next = isOpen ? null : top.label;
                      setOpenMobileGroup(next);
                      setOpenMobileSubGroup(null);
                    }}
                    className={mobileTopButtonClasses(topActive)}
                  >
                    {top.label}
                    {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </button>
                  {isOpen && (
                    <div className="space-y-3 bg-white px-3 py-3 dark:bg-gray-900">
                      {top.children?.map((second) => {
                        const secondKey = `${top.label}::${second.label}`;
                        const isSubOpen = openMobileSubGroup === secondKey;
                        const secondActive = isLecturesPage && isQueryMatch(searchParams, { ...top.query, ...second.query });
                        const hasChildren = second.children && second.children.length > 0;
                        
                        return (
                          <div key={secondKey} className="space-y-0.5">
                            {hasChildren ? (
                              <button
                                type="button"
                                className={mobileSecondaryButtonClasses(secondActive)}
                                onClick={() => {
                                  setOpenMobileSubGroup(isSubOpen ? null : secondKey);
                                }}
                              >
                                <span className="flex items-center justify-between">
                                  {second.label}
                                  {isSubOpen ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                                </span>
                              </button>
                            ) : (
                              <Link
                                to={second.path}
                                onClick={handleCloseMobileMenu}
                                className={mobileSecondaryButtonClasses(secondActive)}
                              >
                                {second.label}
                              </Link>
                            )}
                            {isSubOpen && second.children && (
                              <div className="space-y-1 pl-3">
                                {second.children.map((third) => {
                                  const thirdActive = isLecturesPage
                                    ? isQueryMatch(searchParams, { ...top.query, ...second.query, ...third.query })
                                    : false;
                                  return (
                                    <Link
                                      key={`${secondKey}::${third.label}`}
                                      to={third.path}
                                      onClick={handleCloseMobileMenu}
                                      className={leafLinkClasses(thirdActive)}
                                    >
                                      {third.label}
                                    </Link>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
            <NavLink
              to="/academies"
              onClick={handleCloseMobileMenu}
              className={({ isActive }) => mobileNavLinkClasses(isActive)}
            >
              훈련기관
            </NavLink>
            <NavLink
              to="/community"
              onClick={handleCloseMobileMenu}
              className={({ isActive }) => mobileNavLinkClasses(isActive)}
            >
              커뮤니티
            </NavLink>
            {isAuthenticated && (
              <NavLink
                to="/mypage"
                onClick={handleCloseMobileMenu}
                className={({ isActive }) => mobileNavLinkClasses(isActive)}
              >
                마이페이지
              </NavLink>
            )}
            {isAuthenticated && (user?.accountType === 'ADMIN' || user?.accountType === 'ACADEMY') && (
              <NavLink
                to="/admin"
                onClick={handleCloseMobileMenu}
                className={({ isActive }) => mobileNavLinkClasses(isActive)}
              >
                관리자
              </NavLink>
            )}
            <div className="border-t border-gray-200 pt-3 dark:border-gray-800">
              {isAuthenticated ? (
                <>
                  <div className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300">
                    {user?.id}님
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      handleCloseMobileMenu();
                    }}
                    className="block w-full text-left rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={handleCloseMobileMenu}
                  className="block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  로그인
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
