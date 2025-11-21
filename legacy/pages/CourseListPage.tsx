import React, { useEffect, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import CourseSection from '../components/main/CourseSection';
import { CourseCategoryType, CourseFormat } from '../types';
import { fetchCourses } from '../services/courseService';

interface CourseFilterForm {
  keyword: string;
  category: CourseCategoryType | '전체';
  format: CourseFormat | '전체';
}

const categories: Array<CourseCategoryType | '전체'> = ['전체', '재직자', '취업예정자'];
const formats: Array<CourseFormat | '전체'> = ['전체', '온라인', '오프라인', '혼합'];

const targetMap: Record<string, CourseCategoryType | '전체'> = {
  employee: '재직자',
  student: '취업예정자'
};

const formatMap: Record<string, CourseFormat | '전체'> = {
  online: '온라인',
  offline: '오프라인',
  hybrid: '혼합'
};

const reverseTargetMap: Record<CourseCategoryType, string> = {
  재직자: 'employee',
  취업예정자: 'student'
};

const reverseFormatMap: Record<CourseFormat, string> = {
  온라인: 'online',
  오프라인: 'offline',
  혼합: 'hybrid'
};

const CourseListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const isInternalUpdateRef = useRef(false);

  // URL을 단일 진실 공급원으로 사용
  const currentFilters = useMemo(() => {
    const targetParam = searchParams.get('target');
    const formatParam = searchParams.get('format');
    const keywordParam = searchParams.get('q');

    return {
      keyword: keywordParam || '',
      category: (targetParam && targetMap[targetParam]) || '전체',
      format: (formatParam && formatMap[formatParam]) || '전체'
    };
  }, [searchParams]);

  const { register, handleSubmit, reset, watch } = useForm<CourseFilterForm>({
    defaultValues: currentFilters
  });

  // URL이 외부에서 변경되었을 때만 폼 상태를 리셋
  useEffect(() => {
    // 내부 업데이트로 인한 URL 변경이면 리셋하지 않음
    if (isInternalUpdateRef.current) {
      isInternalUpdateRef.current = false;
      return;
    }
    
    reset(currentFilters);
  }, [currentFilters, reset]);

  // 폼 값 변경 시 URL 업데이트
  useEffect(() => {
    const subscription = watch((formData) => {
      const next = new URLSearchParams();
      
      if (formData.keyword?.trim()) {
        next.set('q', formData.keyword.trim());
      }
      if (formData.category && formData.category !== '전체') {
        next.set('target', reverseTargetMap[formData.category]);
      }
      if (formData.format && formData.format !== '전체') {
        next.set('format', reverseFormatMap[formData.format]);
      }

      // 현재 URL 파라미터와 비교하여 변경된 경우에만 업데이트
      const currentParamsString = searchParams.toString();
      const nextParamsString = next.toString();
      
      if (currentParamsString !== nextParamsString) {
        isInternalUpdateRef.current = true;
        setSearchParams(next, { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, setSearchParams, searchParams]);

  // 쿼리 필터는 URL에서 직접 파생
  const queryFilters = useMemo(
    () => ({
      keyword: currentFilters.keyword.trim() || undefined,
      category: currentFilters.category,
      format: currentFilters.format
    }),
    [currentFilters]
  );

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses', queryFilters],
    queryFn: () => fetchCourses(queryFilters)
  });

  const noResult = !isLoading && courses.length === 0;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">전체 강의 목록</h1>
        <form 
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
          onSubmit={handleSubmit((data) => {
            // 폼 제출 시 기본 동작 방지
            // 필터는 useWatch를 통해 실시간으로 적용되므로 별도 처리 불필요
          })}
        >
          <div className="md:col-span-2">
            <label htmlFor="keyword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              키워드
            </label>
            <input
              id="keyword"
              type="text"
              placeholder="과정명 혹은 태그를 입력하세요"
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              {...register('keyword')}
            />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              교육 대상
            </label>
            <select
              id="category"
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              {...register('category')}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="format" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              교육 방식
            </label>
            <select
              id="format"
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              {...register('format')}
            >
              {formats.map((format) => (
                <option key={format} value={format}>
                  {format}
                </option>
              ))}
            </select>
          </div>
        </form>
      </section>

      {noResult ? (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-10 text-center space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">조건에 맞는 과정이 없습니다</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">다른 키워드나 필터를 선택해 다시 검색해 보세요.</p>
        </div>
      ) : (
        <CourseSection title="검색 결과" courses={courses} loading={isLoading} />
      )}
    </div>
  );
};

export default CourseListPage;
