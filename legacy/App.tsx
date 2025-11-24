import React, { useEffect } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import CourseListPage from './pages/CourseListPage';
import CourseDetailPage from './pages/CourseDetailPage';
import AcademyListPage from './pages/AcademyListPage';
import AcademyDetailPage from './pages/AcademyDetailPage';
import AcademyCreatePage from './pages/AcademyCreatePage';
import CommunityPage from './pages/CommunityPage';
import CommunityDetailPage from './pages/CommunityDetailPage';
import CommunityWritePage from './pages/CommunityWritePage';
import CommunityEditPage from './pages/CommunityEditPage';
import PlaceholderPage from './pages/PlaceholderPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import MyPage from './pages/MyPage';
import AdminPage from './pages/AdminPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import { useThemeStore } from './store/themeStore';

const NotFound: React.FC = () => (
  <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center space-y-6">
    <h1 className="text-4xl font-bold text-gray-900 dark:text-white">페이지를 찾을 수 없습니다</h1>
    <p className="text-gray-600 dark:text-gray-400">요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.</p>
    <Link
      to="/"
      className="inline-flex items-center px-5 py-2.5 rounded-md bg-primary text-white text-sm font-semibold hover:bg-opacity-90 transition"
    >
      메인으로 가기
    </Link>
  </div>
);

const App: React.FC = () => {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/lectures" element={<CourseListPage />} />
        <Route path="/lectures/:courseId" element={<CourseDetailPage />} />
        
        {/* 기관 목록 라우트 */}
        <Route path="/academies" element={<AcademyListPage />} />
        <Route path="/academies/:academyId" element={<AcademyDetailPage />} />
        <Route path="/academy/create" element={<AcademyCreatePage />} />
        
        {/* 커뮤니티 라우트 */}
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/community/:postId" element={<CommunityDetailPage />} />
        <Route path="/community/write" element={<CommunityWritePage />} />
        <Route path="/community/edit/:postId" element={<CommunityEditPage />} />
        
        <Route
          path="/partners"
          element={
            <PlaceholderPage
              title="협력기관 소개 준비 중"
              description="새로운 협력 프로그램과 교육 파트너 정보를 정리하고 있습니다."
            />
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        {/* 인증이 필요한 라우트 */}
        <Route element={<ProtectedRoute />}>
          <Route path="/mypage" element={<MyPage />} />
        </Route>

        {/* 관리자 전용 라우트 */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>

        {/* 권한 없음 페이지 */}
        <Route
          path="/unauthorized"
          element={
            <PlaceholderPage
              title="접근 권한이 없습니다"
              description="이 페이지에 접근할 권한이 없습니다. 관리자에게 문의하세요."
              ctaLabel="메인으로 가기"
              ctaHref="/"
            />
          }
        />

        <Route
          path="/privacy"
          element={
            <PlaceholderPage
              title="개인정보 처리방침"
              description="개인정보 처리방침 문서는 작성 중입니다. 문의가 필요하신 경우 contact@swcampus.kr 로 연락 주세요."
            />
          }
        />
        <Route
          path="/terms"
          element={
            <PlaceholderPage
              title="이용약관"
              description="이용약관은 현재 검토 중입니다. 곧 투명하고 명확한 약관을 안내드리겠습니다."
            />
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
};

export default App;
