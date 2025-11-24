import { BannerData } from '../data/mockAdminData';

// 디폴트 배너 이미지
const DEFAULT_BANNER_IMAGE = 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=400&fit=crop';

// 배너 데이터 저장소 (실제로는 백엔드 DB에 저장됨)
let banners: BannerData[] = [
  {
    id: 1,
    title: 'AI 개발자 양성과정 모집',
    description: '최신 AI 기술을 배우고 전문 개발자로 성장하세요',
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=400&fit=crop',
    linkUrl: '/courses?category=AI',
    displayOrder: 1,
    isActive: true,
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    createdDate: '2025-01-01'
  },
  {
    id: 2,
    title: '풀스택 개발 부트캠프',
    description: '프론트엔드부터 백엔드까지 완벽하게',
    imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=400&fit=crop',
    linkUrl: '/courses?category=풀스택',
    displayOrder: 2,
    isActive: true,
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    createdDate: '2025-01-01'
  },
  {
    id: 3,
    title: '클라우드 엔지니어 양성',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=400&fit=crop',
    linkUrl: '/courses?category=클라우드',
    displayOrder: 3,
    isActive: true,
    createdDate: '2025-01-01'
  }
];

let nextId = 4;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 파일을 업로드하고 URL을 반환 (실제로는 서버에 업로드)
 */
async function uploadImage(file: File): Promise<string> {
  await delay(500);
  // 실제로는 서버에 업로드하고 URL을 받아옴
  // 여기서는 목업으로 blob URL 생성
  return URL.createObjectURL(file);
}

/**
 * 활성 배너 목록 조회 (메인 페이지용)
 */
export async function getActiveBanners(): Promise<BannerData[]> {
  await delay(200);
  const now = new Date().toISOString().split('T')[0];
  
  return banners
    .filter(banner => {
      if (!banner.isActive) return false;
      
      // 무기한 배너 (startDate, endDate 모두 없음)
      if (!banner.startDate && !banner.endDate) return true;
      
      // startDate만 있는 경우
      if (banner.startDate && !banner.endDate) {
        return banner.startDate <= now;
      }
      
      // endDate만 있는 경우
      if (!banner.startDate && banner.endDate) {
        return banner.endDate >= now;
      }
      
      // 둘 다 있는 경우
      return banner.startDate! <= now && banner.endDate! >= now;
    })
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

/**
 * 전체 배너 목록 조회 (관리자용)
 */
export async function getAllBanners(activeOnly: boolean = false): Promise<BannerData[]> {
  await delay(200);
  
  if (activeOnly) {
    return banners
      .filter(banner => banner.isActive)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }
  
  return [...banners].sort((a, b) => a.displayOrder - b.displayOrder);
}

/**
 * 배너 생성
 */
export async function createBanner(bannerData: Omit<BannerData, 'id' | 'createdDate'>): Promise<BannerData> {
  await delay(300);
  
  let imageUrl = bannerData.imageUrl;
  
  // 파일이 있으면 업로드
  if (bannerData.imageFile) {
    imageUrl = await uploadImage(bannerData.imageFile);
  }
  
  // 이미지가 없으면 디폴트 이미지 사용
  if (!imageUrl) {
    imageUrl = DEFAULT_BANNER_IMAGE;
  }
  
  const newBanner: BannerData = {
    title: bannerData.title,
    description: bannerData.description,
    imageUrl,
    linkUrl: bannerData.linkUrl,
    displayOrder: bannerData.displayOrder,
    isActive: bannerData.isActive,
    startDate: bannerData.startDate,
    endDate: bannerData.endDate,
    id: nextId++,
    createdDate: new Date().toISOString().split('T')[0]
  };
  
  banners.push(newBanner);
  return newBanner;
}

/**
 * 배너 수정
 */
export async function updateBanner(id: number, bannerData: Partial<BannerData>): Promise<BannerData> {
  await delay(300);
  
  const index = banners.findIndex(b => b.id === id);
  if (index === -1) {
    throw new Error('배너를 찾을 수 없습니다.');
  }
  
  let imageUrl = bannerData.imageUrl;
  
  // 파일이 있으면 업로드
  if (bannerData.imageFile) {
    // 기존 blob URL이 있으면 해제 (메모리 누수 방지)
    const existingImageUrl = banners[index].imageUrl;
    if (existingImageUrl && existingImageUrl.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(existingImageUrl);
      } catch (error) {
        console.warn('Failed to revoke blob URL:', error);
      }
    }
    
    imageUrl = await uploadImage(bannerData.imageFile);
  }
  
  // imageFile을 제외한 업데이트 데이터 생성
  const { imageFile, ...sanitizedData } = bannerData;
  const updatedData = { ...sanitizedData };
  if (imageUrl) {
    updatedData.imageUrl = imageUrl;
  }
  
  banners[index] = { ...banners[index], ...updatedData };
  return banners[index];
}

/**
 * 배너 삭제
 */
export async function deleteBanner(id: number): Promise<void> {
  await delay(300);
  
  const index = banners.findIndex(b => b.id === id);
  if (index === -1) {
    throw new Error('배너를 찾을 수 없습니다.');
  }
  
  banners.splice(index, 1);
}

/**
 * 배너 표시 순서 변경
 */
export async function reorderBanner(id: number, newOrder: number): Promise<void> {
  await delay(300);
  
  const banner = banners.find(b => b.id === id);
  if (!banner) {
    throw new Error('배너를 찾을 수 없습니다.');
  }
  
  banner.displayOrder = newOrder;
  banners.sort((a, b) => a.displayOrder - b.displayOrder);
}
