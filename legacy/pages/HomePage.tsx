import React from 'react';
import { useQuery } from '@tanstack/react-query';
import HeroBanner from '../components/main/HeroBanner';
import CourseSection from '../components/main/CourseSection';
import CommunitySection from '../components/main/CommunitySection';
import { fetchHomeBanners, fetchHomeCourseSections, fetchCommunityHighlights } from '../services/homeService';

const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-6 py-4 rounded-lg text-center">
    <p className="font-medium">{message}</p>
    <p className="text-sm mt-1">페이지를 새로고침하거나 잠시 후 다시 시도해주세요.</p>
  </div>
);

const HomePage: React.FC = () => {
  const { 
    data: banners = [], 
    isLoading: bannersLoading, 
    isError: bannersError, 
    error: bannersErrorObj 
  } = useQuery({
    queryKey: ['home', 'banners'],
    queryFn: fetchHomeBanners
  });

  const { 
    data: courseSections, 
    isLoading: coursesLoading, 
    isError: coursesError, 
    error: coursesErrorObj 
  } = useQuery({
    queryKey: ['home', 'courseSections'],
    queryFn: fetchHomeCourseSections
  });

  const { 
    data: communityPosts = [], 
    isLoading: communityLoading, 
    isError: communityError, 
    error: communityErrorObj 
  } = useQuery({
    queryKey: ['home', 'community'],
    queryFn: fetchCommunityHighlights
  });

  return (
    <div className="space-y-12 md:space-y-20 pb-12 md:pb-20">
      {bannersError ? (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <ErrorMessage message="배너를 불러오는데 실패했습니다." />
        </div>
      ) : (
        <HeroBanner banners={banners} loading={bannersLoading} />
      )}
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {coursesError ? (
          <ErrorMessage message="과정 목록을 불러오는데 실패했습니다." />
        ) : (
          <>
            <CourseSection
              title="재직자 베스트 과정"
              courses={courseSections?.employeeBest ?? []}
              loading={coursesLoading}
              link="/lectures?target=employee"
              targetCount={4}
            />
            <CourseSection
              title="취업예정자 베스트 과정"
              courses={courseSections?.jobSeekerBest ?? []}
              loading={coursesLoading}
              link="/lectures?target=student"
              targetCount={4}
            />
            <CourseSection
              title="마감 임박 과정"
              courses={courseSections?.closingSoon ?? []}
              loading={coursesLoading}
              link="/lectures"
              targetCount={4}
            />
          </>
        )}
        
        {communityError ? (
          <ErrorMessage message="커뮤니티 게시글을 불러오는데 실패했습니다." />
        ) : (
          <CommunitySection posts={communityPosts} loading={communityLoading} />
        )}
      </main>
    </div>
  );
};

export default HomePage;
