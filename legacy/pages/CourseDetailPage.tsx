import React from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import CourseDetailContent from '../components/course/CourseDetailPage';
import { fetchCourseById } from '../services/courseService';

const CourseDetailPage: React.FC = () => {
  const params = useParams<{ courseId: string }>();
  const courseId = Number(params.courseId);

  // 유효한 courseId인지 확인
  const isValidCourseId = Boolean(params.courseId) && !Number.isNaN(courseId);

  // 항상 훅을 호출하되, enabled 플래그로 실행 여부 제어
  const { data: course, isLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => fetchCourseById(courseId),
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
    enabled: isValidCourseId
  });

  // 훅 호출 이후에 리다이렉션 처리
  if (!isValidCourseId) {
    return <Navigate to="/lectures" replace />;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="h-64 animate-pulse-fast rounded-xl bg-gray-200 dark:bg-gray-700" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">404</h1>
        <p className="text-gray-600 dark:text-gray-400">요청하신 강의를 찾을 수 없습니다.</p>
        <div className="flex justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center px-5 py-2.5 rounded-md bg-primary text-white text-sm font-semibold hover:bg-opacity-90 transition"
          >
            메인으로 돌아가기
          </Link>
          <Link
            to="/lectures"
            className="inline-flex items-center px-5 py-2.5 rounded-md border border-gray-300 dark:border-gray-600 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            강의 목록 보기
          </Link>
        </div>
      </div>
    );
  }

  return <CourseDetailContent course={course} />;
};

export default CourseDetailPage;
