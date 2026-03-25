import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import CourseListPage from './pages/CourseListPage';
import CourseDetailPage from './pages/CourseDetailPage';
import AcademyListPage from './pages/AcademyListPage';
import AcademyDetailPage from './pages/AcademyDetailPage';
import AcademyCreatePage from './pages/AcademyCreatePage';
import CommunityPage from './pages/CommunityPage';
import CommunityDetailPage from './pages/CommunityDetailPage';
import CommunityWritePage from './pages/CommunityWritePage';
import CommunityEditPage from './pages/CommunityEditPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import MyPage from './pages/MyPage';
import AdminPage from './pages/AdminPage';
import PlaceholderPage from './pages/PlaceholderPage';
import NotFound from './pages/NotFound';
import LegalDocumentPage from './pages/LegalDocumentPage';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import DemoNotice from './components/layout/DemoNotice';
import { PRIVACY_POLICY, TERMS_OF_SERVICE } from './data/terms';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow pt-20">
          <DemoNotice />
          <Routes>
            <Route path="/" element={<LandingPage />} />

            {/* Lectures */}
            <Route path="/lectures" element={<CourseListPage />} />
            <Route path="/lectures/:courseId" element={<CourseDetailPage />} />

            {/* Academies */}
            <Route path="/academies" element={<AcademyListPage />} />
            <Route path="/academies/:academyId" element={<AcademyDetailPage />} />
            <Route path="/academy/create" element={<AcademyCreatePage />} />

            {/* Community */}
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/community/:postId" element={<CommunityDetailPage />} />
            <Route path="/community/write" element={<CommunityWritePage />} />
            <Route path="/community/edit/:postId" element={<CommunityEditPage />} />

            {/* Auth */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/admin" element={<AdminPage />} />

            {/* Static/Placeholder */}
            <Route path="/partners" element={<PlaceholderPage title="협력기관" description="협력기관 소개 페이지입니다." />} />
            <Route
              path="/privacy"
              element={
                <LegalDocumentPage
                  title="개인정보 처리방침"
                  description="회원가입 화면에서 제공하는 개인정보 처리방침 전문을 페이지에서도 확인할 수 있도록 제공합니다."
                  content={PRIVACY_POLICY}
                />
              }
            />
            <Route
              path="/terms"
              element={
                <LegalDocumentPage
                  title="이용약관"
                  description="회원가입 화면에서 제공하는 이용약관 전문을 페이지에서도 확인할 수 있도록 제공합니다."
                  content={TERMS_OF_SERVICE}
                />
              }
            />
            <Route path="/unauthorized" element={<PlaceholderPage title="권한 없음" description="접근 권한이 없습니다." />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
