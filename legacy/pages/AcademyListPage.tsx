import React, { useEffect, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import AcademyCard from '../components/academy/AcademyCard';
import { AcademyField } from '../types';
import { fetchAcademies } from '../services/academyService';

interface AcademyFilterForm {
  keyword: string;
  field: AcademyField;
  isRecruiting: string; // 'all' | 'true' | 'false'
}

const fields: AcademyField[] = [
  '전체',
  '웹개발',
  '모바일',
  '데이터·AI',
  '클라우드·보안',
  'IoT·임베디드·반도체',
  '게임·블록체인',
  '기획·마케팅·기타',
  '디자인·3D',
  '프로젝트·취준·창업'
];

const fieldMap: Record<string, AcademyField> = {
  all: '전체',
  web: '웹개발',
  mobile: '모바일',
  data: '데이터·AI',
  cloud: '클라우드·보안',
  iot: 'IoT·임베디드·반도체',
  game: '게임·블록체인',
  planning: '기획·마케팅·기타',
  design: '디자인·3D',
  project: '프로젝트·취준·창업'
};

const reverseFieldMap: Record<AcademyField, string> = {
  웹개발: 'web',
  모바일: 'mobile',
  '데이터·AI': 'data',
  '클라우드·보안': 'cloud',
  'IoT·임베디드·반도체': 'iot',
  '게임·블록체인': 'game',
  '기획·마케팅·기타': 'planning',
  '디자인·3D': 'design',
  '프로젝트·취준·창업': 'project',
  전체: 'all'
};

const AcademyListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const isInternalUpdateRef = useRef(false);

  // URL을 단일 진실 공급원으로 사용
  const currentFilters = useMemo(() => {
    const fieldParam = searchParams.get('field');
    const recruitingParam = searchParams.get('recruiting');
    const keywordParam = searchParams.get('q');

    return {
      keyword: keywordParam || '',
      field: (fieldParam && fieldMap[fieldParam]) || '전체',
      isRecruiting: recruitingParam || 'all'
    };
  }, [searchParams]);

  const { register, handleSubmit, reset, watch } = useForm<AcademyFilterForm>({
    defaultValues: currentFilters
  });

  // URL이 외부에서 변경되었을 때만 폼 상태를 리셋
  useEffect(() => {
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
      if (formData.field && formData.field !== '전체') {
        next.set('field', reverseFieldMap[formData.field]);
      }
      if (formData.isRecruiting && formData.isRecruiting !== 'all') {
        next.set('recruiting', formData.isRecruiting);
      }

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
  const queryFilters = useMemo(() => {
    const filters: {
      keyword?: string;
      field?: AcademyField;
      isRecruiting?: boolean;
    } = {};

    if (currentFilters.keyword.trim()) {
      filters.keyword = currentFilters.keyword.trim();
    }
    if (currentFilters.field && currentFilters.field !== '전체') {
      filters.field = currentFilters.field;
    }
    if (currentFilters.isRecruiting !== 'all') {
      filters.isRecruiting = currentFilters.isRecruiting === 'true';
    }

    return filters;
  }, [currentFilters]);

  const { data: academies = [], isLoading } = useQuery({
    queryKey: ['academies', queryFilters],
    queryFn: () => fetchAcademies(queryFilters)
  });

  const noResult = !isLoading && academies.length === 0;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* 페이지 헤더 */}
      <section className="text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
          훈련기관 목록
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          {academies.length > 0
            ? `${academies.length}곳의 교육기관을 찾았어요.`
            : '검색 조건에 맞는 교육기관을 찾아보세요.'}
        </p>
      </section>

      {/* 필터 영역 */}
      <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6 md:p-8">
        <form
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
          onSubmit={handleSubmit(() => {
            // 폼 제출 시 기본 동작 방지
          })}
        >
          {/* 키워드 검색 */}
          <div className="md:col-span-2">
            <label htmlFor="keyword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              키워드
            </label>
            <input
              id="keyword"
              type="text"
              placeholder="기관명 또는 태그를 입력하세요"
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              {...register('keyword')}
            />
          </div>

          {/* 교육 분야 필터 */}
          <div>
            <label htmlFor="field" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              교육 분야
            </label>
            <select
              id="field"
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              {...register('field')}
            >
              {fields.map((field) => (
                <option key={field} value={field}>
                  {field}
                </option>
              ))}
            </select>
          </div>

          {/* 모집 여부 필터 */}
          <div>
            <label htmlFor="isRecruiting" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              모집 여부
            </label>
            <select
              id="isRecruiting"
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              {...register('isRecruiting')}
            >
              <option value="all">전체</option>
              <option value="true">모집 중</option>
              <option value="false">모집 마감</option>
            </select>
          </div>
        </form>
      </section>

      {/* 기관 목록 */}
      <section>
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : noResult ? (
          <div className="text-center py-20">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              검색 결과가 없습니다
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              다른 검색 조건으로 다시 시도해보세요.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {academies.map((academy) => (
              <AcademyCard key={academy.id} academy={academy} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AcademyListPage;
