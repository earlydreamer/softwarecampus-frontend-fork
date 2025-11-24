import axios from 'axios';
import { Course, CourseCategoryType } from '../types';
import { mockCourses } from '../data/mockData';

const apiClient = axios.create({
  baseURL: import.meta.env?.VITE_API_BASE_URL ?? '',
  timeout: 5_000
});

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface CourseFilter {
  keyword?: string;
  category?: CourseCategoryType | '전체';
  isOffline?: boolean; // format 대신 isOffline 사용
}

export async function fetchCourses(filter?: CourseFilter): Promise<Course[]> {
  // 실제 API: const response = await apiClient.get('/api/courses', { params: filter });
  // return response.data;
  
  void apiClient; // 실제 API 연동 시 활용 예정
  await delay(400);

  return mockCourses.filter((course) => {
    const keyword = filter?.keyword;
    const matchKeyword = keyword
      ? course.name.toLowerCase().includes(keyword.toLowerCase()) ||
        (course.tags && course.tags.some((tag) => tag.toLowerCase().includes(keyword.toLowerCase())))
      : true;
    const matchCategory = filter?.category && filter.category !== '전체'
      ? course.category.name === filter.category
      : true;
    const matchOffline = filter?.isOffline !== undefined
      ? course.isOffline === filter.isOffline
      : true;

    return matchKeyword && matchCategory && matchOffline;
  });
}

export async function fetchCourseById(courseId: number): Promise<Course | undefined> {
  // 실제 API: const response = await apiClient.get(`/api/courses/${courseId}`);
  // return response.data;
  
  await delay(300);
  return mockCourses.find((course) => course.id === courseId);
}
