import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

/**
 * 관리자(ADMIN) 및 훈련기관(ACADEMY) 전용 라우트 가드
 * 미인증 시 로그인 페이지로, 인증되었으나 권한 없을 시 unauthorized 페이지로 리다이렉트
 */
const AdminRoute: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  // 로딩 중일 때는 아무것도 렌더링하지 않음 (또는 로딩 스피너)
  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.accountType !== 'ADMIN' && user?.accountType !== 'ACADEMY') {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
