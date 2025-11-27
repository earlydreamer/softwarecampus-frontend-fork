import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import CourseSection from '../components/home/CourseSection';
import { fetchCourses } from '../services/courseService';
import { Search, ChevronDown } from 'lucide-react';

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

interface FilterDropdownProps {
    label: string;
    value: string;
    options: { value: string; label: string }[];
    onChange: (value: any) => void;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({ label, value, options, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find((o) => o.value === value);
    const displayLabel = selectedOption ? selectedOption.label : options[0].label;
    const isActive = value !== 'ALL';

    return (
        <div className="flex flex-col gap-1.5" ref={dropdownRef}>
            <span className="text-xs font-semibold text-slate-500 ml-1">{label}</span>
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`flex items-center justify-between gap-2 w-36 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${isActive
                        ? 'border-primary-200 bg-primary-50 text-primary-700'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                >
                    <span className="truncate">{displayLabel}</span>
                    <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                    <div className="absolute top-full left-0 mt-1 w-full min-w-[144px] bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2 text-sm transition-colors ${value === option.value
                                    ? 'bg-primary-50 text-primary-700 font-medium'
                                    : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
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

    const { register, handleSubmit, reset, watch, setValue } = useForm<CourseFilterForm>({
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

    const { data: courses = [], isLoading, isError } = useQuery({
        queryKey: ['courses', queryFilters],
        queryFn: () => fetchCourses(queryFilters)
    });

    const noResult = !isLoading && courses.length === 0;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                {/* Header & Search Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">전체 강의 목록</h1>
                        <p className="text-slate-500 dark:text-slate-400">원하는 강의를 검색하고 필터링하여 찾아보세요.</p>
                    </div>
                </div>

                {/* Filter Panel */}
                <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <form onSubmit={handleSubmit(() => { })}>
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Search Bar */}
                            <div className="flex flex-col gap-1.5 flex-grow max-w-xl">
                                <label htmlFor="keyword" className="text-xs font-semibold text-slate-500 ml-1">과정 검색</label>
                                <div className="relative">
                                    <input
                                        id="keyword"
                                        type="text"
                                        placeholder="과정명, 기술 스택, 혹은 키워드로 검색..."
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-5 py-2.5 pl-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all shadow-sm"
                                        {...register('keyword')}
                                    />
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                </div>
                            </div>

                            {/* Dropdown Filters */}
                            <div className="flex flex-wrap gap-3">
                                <FilterDropdown
                                    label="교육 대상"
                                    value={watch('categoryType')}
                                    options={categoryTypes}
                                    onChange={(val) => setValue('categoryType', val)}
                                />
                                <FilterDropdown
                                    label="교육 방식"
                                    value={watch('isOffline')}
                                    options={classFormats}
                                    onChange={(val) => setValue('isOffline', val)}
                                />
                            </div>
                        </div>
                    </form>
                </section>

                {isError ? (
                    <div className="glass-panel p-12 text-center rounded-2xl border-dashed border-2 border-slate-200">
                        <p className="text-slate-500">데이터를 불러오는 데 실패했습니다.</p>
                    </div>
                ) : noResult ? (
                    <div className="glass-panel p-12 text-center rounded-2xl border-dashed border-2 border-slate-200">
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">조건에 맞는 과정이 없습니다</h2>
                        <p className="text-slate-500">다른 키워드나 필터를 선택해 다시 검색해 보세요.</p>
                    </div>
                ) : (
                    <CourseSection title="검색 결과" courses={courses} loading={isLoading} viewMode="grid" />
                )}
            </div>
        </div>
    );
};

export default CourseListPage;
