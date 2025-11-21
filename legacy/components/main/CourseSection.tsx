import React from 'react';import { Link } from 'react-router-dom';
import { Course } from '../../types';
import CourseCard from './CourseCard';
import { ArrowRightIcon } from '../icons/Icons';
import Skeleton from '../ui/Skeleton';

interface CourseSectionProps {
  title: string;
  courses: Course[];
  loading: boolean;
  link?: string;
  targetCount?: number;
}

const CourseCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
    <Skeleton className="h-40 w-full" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-full" />
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-5 w-1/4" />
        <Skeleton className="h-5 w-1/4" />
      </div>
    </div>
  </div>
);

const BlankSlot: React.FC = () => (
  <div className="h-full min-h-[260px] rounded-lg border border-dashed border-gray-300 dark:border-gray-700 bg-white/40 dark:bg-gray-800/40" />
);

const EmptyState: React.FC = () => (
  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-10 text-center">
    <p className="text-sm text-gray-600 dark:text-gray-400">등록된 과정이 없습니다.</p>
  </div>
);

const CourseSection: React.FC<CourseSectionProps> = ({ title, courses, loading, link, targetCount }) => {
  // 로딩 중일 때도 스켈레톤을 표시하기 위해 기본값 설정
  const finalTarget = targetCount ?? Math.max(courses.length, 4);
  const isEmpty = !loading && courses.length === 0;
  const placeholdersCount = Math.max(finalTarget - courses.length, 0);

  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{title}</h2>
        {link && (
          <Link to={link} className="flex items-center space-x-1 text-sm font-medium text-primary dark:text-primary-dark hover:underline">
            <span>더보기</span>
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        )}
      </div>
      {isEmpty ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: finalTarget }).map((_, index) => <CourseCardSkeleton key={`skeleton-${index}`} />)
            : (
              <>
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
                {Array.from({ length: placeholdersCount }).map((_, index) => (
                  <BlankSlot key={`placeholder-${index}`} />
                ))}
              </>
            )}
        </div>
      )}
    </section>
  );
};

export default CourseSection;
