import { Banner, CommunityPost, Course } from '../types';
import {
  mockBestCourses,
  mockClosingSoonCourses,
  mockCommunityPosts
} from '../data/mockData';
import { getActiveBanners } from './bannerService';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// 기본 fallback 배너 데이터
// ID -1은 실제 DB 데이터(0부터 시작)와 충돌하지 않는 sentinel 값
const DEFAULT_BANNERS: Banner[] = [
  {
    id: -1,
    imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=400&fit=crop',
    title: '소프트웨어 캠퍼스에 오신 것을 환영합니다',
    subtitle: '최고의 교육 과정으로 여러분의 커리어를 시작하세요',
    link: '/courses'
  }
];

export async function fetchHomeBanners(): Promise<Banner[]> {
  await delay(200);
  
  try {
    // 활성 배너 데이터를 가져옴
    const activeBanners = await getActiveBanners();
    
    // BannerData를 Banner 타입으로 변환
    const banners = activeBanners.map(banner => ({
      id: banner.id,
      imageUrl: banner.imageUrl || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=400&fit=crop',
      title: banner.title,
      subtitle: banner.description || (banner.startDate && banner.endDate ? `${banner.startDate} ~ ${banner.endDate}` : ''),
      link: banner.linkUrl
    }));
    
    // 배너가 없으면 기본 배너 반환
    return banners.length > 0 ? banners : DEFAULT_BANNERS;
    
  } catch (error) {
    console.error('배너 데이터 로드 실패:', error);
    
    // API 실패 시 기본 배너 반환하여 페이지가 정상 렌더링되도록 함
    return DEFAULT_BANNERS;
  }
}

export async function fetchHomeCourseSections(): Promise<{
  employeeBest: Course[];
  jobSeekerBest: Course[];
  closingSoon: Course[];
}> {
  await delay(300);
  return {
    employeeBest: mockBestCourses.filter((course) => course.category === '재직자').slice(0, 4),
    jobSeekerBest: mockBestCourses.filter((course) => course.category === '취업예정자').slice(0, 4),
    closingSoon: mockClosingSoonCourses.slice(0, 4)
  };
}

export async function fetchCommunityHighlights(): Promise<CommunityPost[]> {
  await delay(250);
  return mockCommunityPosts;
}
