import React, { useEffect, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import CourseSection from '../components/home/CourseSection';
import { fetchCourses } from '../services/courseService';
import { Search } from 'lucide-react';

interface CourseFilterForm {
    keyword: string;
    category: string; // categoryName for detailed filtering
    categoryType: 'ALL' | 'EMPLOYEE' | 'JOB_SEEKER'; // 백엔드 CategoryType enum에 맞춤
    isOffline: 'ALL' | 'true' | 'false'; // 백엔드 isOffline boolean에 맞춤
}

// 백엔드 CategoryType enum과 일치
const categoryTypes: Array<{ value: CourseFilterForm['categoryType']; label: string }> = [
    { value: 'ALL', label: '전체' },
    { value: 'EMPLOYEE', label: '재직자' },
    { value: 'JOB_SEEKER', label: '취업예정자' }
];

// 백엔드 isOffline boolean에 맞춤
const classFormats: Array<{ value: CourseFilterForm['isOffline']; label: string }> = [
    { value: 'ALL', label: '전체' },
    { value: 'false', label: '온라인' },
    { value: 'true', label: '오프라인' }
];

// URL 파라미터 매핑 (백엔드 API와 호환)
const targetMap: Record<string, CourseFilterForm['categoryType']> = {
    employee: 'EMPLOYEE',
    student: 'JOB_SEEKER',
    jobseeker: 'JOB_SEEKER'
};

const formatMap: Record<string, CourseFilterForm['isOffline']> = {
    online: 'false',
    offline: 'true'
};

const reverseTargetMap: Record<string, string> = {
    EMPLOYEE: 'employee',
    JOB_SEEKER: 'student'
};

const reverseFormatMap: Record<string, string> = {
    'true': 'offline',
    'false': 'online'
};

const CourseListPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const isInternalUpdateRef = useRef(false);

    const currentFilters = useMemo(() => {
        const targetParam = searchParams.get('target');
        const formatParam = searchParams.get('format');
        const keywordParam = searchParams.get('q');
        const categoryParam = searchParams.get('category'); // 카테고리명 필터

        return {
            keyword: keywordParam || '',
            category: categoryParam || '', // categoryName
            categoryType: (targetParam && targetMap[targetParam]) || 'ALL' as CourseFilterForm['categoryType'],
            isOffline: (formatParam && formatMap[formatParam]) || 'ALL' as CourseFilterForm['isOffline']
        };
    }, [searchParams]);

    const { register, handleSubmit, reset, watch } = useForm<CourseFilterForm>({
        defaultValues: currentFilters
    });

    useEffect(() => {
        if (isInternalUpdateRef.current) {
            isInternalUpdateRef.current = false;
            return;
        }
        reset(currentFilters);
    }, [currentFilters, reset]);

    useEffect(() => {
        const subscription = watch((formData) => {
            const next = new URLSearchParams();

            if (formData.keyword?.trim()) {
                next.set('q', formData.keyword.trim());
            }
            if (formData.categoryType && formData.categoryType !== 'ALL') {
                next.set('target', reverseTargetMap[formData.categoryType]);
            }
            if (formData.isOffline && formData.isOffline !== 'ALL') {
                next.set('format', reverseFormatMap[formData.isOffline]);
            }
            // category는 URL에서 직접 받음 (네비게이션에서 설정)
            const categoryParam = searchParams.get('category');
            if (categoryParam) {
                next.set('category', categoryParam);
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

    const queryFilters = useMemo(
        () => ({
            keyword: currentFilters.keyword.trim() || undefined,
            category: currentFilters.category || undefined, // categoryName 필터 추가
            categoryType: currentFilters.categoryType !== 'ALL' ? currentFilters.categoryType : undefined,
            isOffline: currentFilters.isOffline !== 'ALL' ? currentFilters.isOffline === 'true' : undefined
        }),
        [currentFilters]
    );

    const { data: courses = [], isLoading } = useQuery({
        queryKey: ['courses', queryFilters],
        queryFn: () => fetchCourses(queryFilters)
    });

    const noResult = !isLoading && courses.length === 0;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
                <section className="glass-panel p-8 rounded-2xl">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">전체 강의 목록</h1>
                    <form
                        className="grid grid-cols-1 md:grid-cols-4 gap-6"
                        onSubmit={handleSubmit(() => { })}
                    >
                        <div className="md:col-span-2">
                            <label htmlFor="keyword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                키워드
                            </label>
                            <div className="relative">
                                <input
                                    id="keyword"
                                    type="text"
                                    placeholder="과정명 혹은 태그를 입력하세요"
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pl-11 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                    {...register('keyword')}
                                />
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="categoryType" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                교육 대상
                            </label>
                            <select
                                id="categoryType"
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all appearance-none"
                                {...register('categoryType')}
                            >
                                {categoryTypes.map((cat) => (
                                    <option key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="isOffline" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                교육 방식
                            </label>
                            <select
                                id="isOffline"
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all appearance-none"
                                {...register('isOffline')}
                            >
                                {classFormats.map((format) => (
                                    <option key={format.value} value={format.value}>
                                        {format.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </form>
                </section>

                {noResult ? (
                    <div className="glass-panel p-12 text-center rounded-2xl border-dashed border-2 border-slate-200">
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">조건에 맞는 과정이 없습니다</h2>
                        <p className="text-slate-500">다른 키워드나 필터를 선택해 다시 검색해 보세요.</p>
                    </div>
                ) : (
                    <CourseSection title="검색 결과" courses={courses} loading={isLoading} />
                )}
            </div>
        </div>
    );
};

export default CourseListPage;
