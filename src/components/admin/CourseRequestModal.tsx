import type * as React from 'react';
import { useState, useEffect, useRef, useId, useCallback } from 'react';
import { X, Edit2, Upload, RefreshCw } from 'lucide-react';
import type { CourseApprovalRequest, CourseTarget, CategoryType, AdminAcademy } from '../../types';
import { getCourseCategories, getAdminAcademies, type CourseCategoryResponse } from '../../services/adminService';
import AlertModal from '../ui/AlertModal';

export interface CourseFormState extends Partial<CourseApprovalRequest> {
    imageFile?: File;
    selectedAcademyId?: number; // 관리자가 선택한 기관 ID
}

interface CourseRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CourseFormState) => void;
    initialData?: CourseApprovalRequest | null;
    isAdmin?: boolean; // 관리자 여부
    defaultAcademyId?: number; // 기관 회원일 경우 기본 기관 ID
}

const CourseRequestModal: React.FC<CourseRequestModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    isAdmin = false,
    defaultAcademyId
}) => {
    const titleId = useId();
    const modalRef = useRef<HTMLDivElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);

    const [form, setForm] = useState<CourseFormState>({
        courseName: '',
        category: '',
        target: '취업예정자',
        format: '온라인',
        recruitStart: '',
        recruitEnd: '',
        courseStart: '',
        courseEnd: '',
        cost: 0,
        classDay: '평일', // 기본값: 평일
        isKdt: false,
        isNailbaeum: false,
        isOffline: false,
        location: '',
        description: '',
        imageUrl: '',
        selectedAcademyId: defaultAcademyId
    });
    const [error, setError] = useState<string | null>(null);

    // AlertModal 상태
    const [alertModal, setAlertModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'error' | 'warning' | 'info';
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info'
    });

    /**
     * 이미지 파일 유효성 검증 헬퍼 함수
     * @param file - 검증할 파일
     * @returns 오류 메시지 또는 null (유효한 경우)
     */
    const validateImageFile = (file: File): string | null => {
        if (!file.type.startsWith('image/')) {
            return '이미지 파일만 업로드 가능합니다.';
        }
        if (file.size > 5 * 1024 * 1024) {
            return '파일 크기는 5MB를 초과할 수 없습니다.';
        }
        return null;
    };

    /**
     * 오류 모달 표시 헬퍼 함수
     */
    const showErrorModal = (message: string) => {
        setAlertModal({
            isOpen: true,
            title: '파일 업로드 오류',
            message,
            type: 'error'
        });
    };

    // 카테고리 목록 상태
    const [categories, setCategories] = useState<CourseCategoryResponse[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(false);
    const [categoryLoadError, setCategoryLoadError] = useState<string | null>(null);

    // 기관 목록 상태 (관리자용)
    const [academies, setAcademies] = useState<AdminAcademy[]>([]);
    const [isLoadingAcademies, setIsLoadingAcademies] = useState(false);
    const [academyLoadError, setAcademyLoadError] = useState<string | null>(null);

    // blob URL을 추적하기 위한 ref
    const blobUrlRef = useRef<string | null>(null);

    /**
     * 기관 목록 로드 함수 (관리자용)
     */
    const loadAcademies = useCallback(async () => {
        setIsLoadingAcademies(true);
        setAcademyLoadError(null);
        try {
            const { academies } = await getAdminAcademies('APPROVED');
            setAcademies(academies);
            // 첫 번째 기관을 기본값으로 설정 (함수형 업데이트로 stale closure 방지)
            if (academies.length > 0) {
                setForm(prev => prev.selectedAcademyId ? prev : { ...prev, selectedAcademyId: academies[0].id });
            }
        } catch (err) {
            console.error('기관 목록 로드 실패:', err);
            setAcademyLoadError('기관 목록을 불러오는데 실패했습니다.');
        } finally {
            setIsLoadingAcademies(false);
        }
    }, []);

    // 기관 목록 로드 (관리자일 경우에만)
    useEffect(() => {
        if (isOpen && isAdmin) {
            loadAcademies();
        }
    }, [isOpen, isAdmin, loadAcademies]);

    // 카테고리 목록 로드
    useEffect(() => {
        if (isOpen) {
            const loadCategories = async () => {
                setIsLoadingCategories(true);
                setCategoryLoadError(null);
                try {
                    // 대상(target)에 따라 카테고리 타입 결정
                    // form.target은 의존성 배열에 포함되어 있으므로 최신 값을 참조함
                    const categoryType: CategoryType = form.target === '재직자' ? 'EMPLOYEE' : 'JOB_SEEKER';
                    const data = await getCourseCategories(categoryType);
                    setCategories(data);

                    // 첫 번째 카테고리를 기본값으로 설정 (함수형 업데이트 사용)
                    setForm(prev => {
                        // 이미 카테고리가 설정되어 있고, 해당 카테고리가 새 목록에도 존재하면 유지
                        const currentCategoryExists = data.some(c => c.categoryName === prev.category);
                        if (prev.category && currentCategoryExists) {
                            return prev;
                        }
                        // 아니면 첫 번째 카테고리로 설정
                        if (data.length > 0) {
                            return { ...prev, category: data[0].categoryName };
                        }
                        return prev;
                    });
                } catch (err) {
                    console.error('카테고리 로드 실패:', err);
                    setCategoryLoadError('카테고리 목록을 불러오는데 실패했습니다.');
                } finally {
                    setIsLoadingCategories(false);
                }
            };
            loadCategories();
        }
    }, [isOpen, form.target]);

    useEffect(() => {
        if (isOpen) {
            // 모달이 열릴 때 현재 포커스된 요소 저장
            previousFocusRef.current = document.activeElement as HTMLElement;

            // 모달 내부로 포커스 이동 (접근성)
            const timer = setTimeout(() => {
                modalRef.current?.focus();
            }, 0);

            if (initialData) {
                setForm({ ...initialData, selectedAcademyId: initialData.academyId });
            } else {
                // 초기화
                setForm({
                    courseName: '',
                    category: '',
                    target: '취업예정자',
                    format: '온라인',
                    recruitStart: '',
                    recruitEnd: '',
                    courseStart: '',
                    courseEnd: '',
                    cost: 0,
                    classDay: '평일', // 기본값
                    isKdt: false,
                    isNailbaeum: false,
                    isOffline: false,
                    location: '',
                    description: '',
                    imageUrl: '',
                    selectedAcademyId: defaultAcademyId
                });
            }

            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Escape') {
                    e.preventDefault();
                    onClose();
                }

                if (e.key === 'Tab' && modalRef.current) {
                    const focusableElements = modalRef.current.querySelectorAll(
                        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                    );

                    if (focusableElements.length === 0) return;

                    const firstElement = focusableElements[0] as HTMLElement;
                    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

                    if (e.shiftKey) {
                        if (document.activeElement === firstElement) {
                            e.preventDefault();
                            lastElement.focus();
                        }
                    } else {
                        if (document.activeElement === lastElement) {
                            e.preventDefault();
                            firstElement.focus();
                        }
                    }
                }
            };

            document.addEventListener('keydown', handleKeyDown);

            return () => {
                clearTimeout(timer);
                document.removeEventListener('keydown', handleKeyDown);
                // 모달이 닫힐 때 이전 포커스 복원
                previousFocusRef.current?.focus();
            };
        }
    }, [isOpen, initialData, onClose, defaultAcademyId]);

    // Cleanup blob URL on unmount only
    useEffect(() => {
        return () => {
            // unmount 시에만 ref에 저장된 blob URL revoke
            if (blobUrlRef.current) {
                URL.revokeObjectURL(blobUrlRef.current);
                blobUrlRef.current = null;
            }
        };
    }, []); // 빈 배열: unmount 시에만 실행

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // 파일 유효성 검사 (헬퍼 함수 사용)
            const validationError = validateImageFile(file);
            if (validationError) {
                showErrorModal(validationError);
                e.target.value = ''; // 입력 초기화
                return;
            }

            // 이전 blob URL이 있으면 revoke (ref에 저장된 것만)
            if (blobUrlRef.current) {
                URL.revokeObjectURL(blobUrlRef.current);
            }

            const imageUrl = URL.createObjectURL(file);
            blobUrlRef.current = imageUrl; // ref에 새 blob URL 저장

            setForm(prev => ({
                ...prev,
                imageFile: file,
                imageUrl: imageUrl
            }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.courseName || form.courseName.trim() === '') {
            setError('과정명을 입력해주세요.');
            return;
        }
        setError(null);
        onSubmit(form);
    };

    if (!isOpen) return null;

    const isEditing = !!initialData;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            ref={modalRef}
            tabIndex={-1}
        >
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
                    <h3
                        id={titleId}
                        className="text-lg font-bold text-slate-900 dark:text-white"
                    >
                        {isEditing ? '과정 수정 요청' : '과정 등록 요청'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Image Upload */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            과정 대표 이미지
                        </label>
                        <div
                            className={`relative w-full h-48 rounded-xl border-2 border-dashed transition-colors flex flex-col items-center justify-center cursor-pointer overflow-hidden ${form.imageUrl
                                ? 'border-primary-500 bg-slate-50'
                                : 'border-slate-300 hover:border-primary-400 bg-slate-50 hover:bg-slate-100'
                                }`}
                            onClick={() => document.getElementById('course-image-input')?.click()}
                        >
                            {form.imageUrl ? (
                                <>
                                    <img
                                        src={form.imageUrl}
                                        alt="Preview"
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                        <p className="text-white font-medium flex items-center gap-2">
                                            <Edit2 className="w-4 h-4" /> 이미지 변경
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center p-4">
                                    <div className="w-12 h-12 rounded-full bg-primary-50 text-primary-500 flex items-center justify-center mx-auto mb-3">
                                        <Upload className="w-6 h-6" />
                                    </div>
                                    <p className="text-sm font-medium text-slate-700">
                                        클릭하여 업로드
                                    </p>
                                </div>
                            )}
                            <input
                                id="course-image-input"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                            />
                        </div>
                    </div>

                    {/* 기관 선택 (관리자만 표시) */}
                    {isAdmin && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                훈련기관 <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={form.selectedAcademyId || ''}
                                onChange={e => setForm({ ...form, selectedAcademyId: Number(e.target.value) })}
                                disabled={isLoadingAcademies}
                                className={`w-full px-4 py-2 rounded-lg border ${academyLoadError ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary-500 outline-none disabled:opacity-50`}
                            >
                                {isLoadingAcademies ? (
                                    <option value="">로딩 중...</option>
                                ) : academyLoadError ? (
                                    <option value="">기관 목록 로드 실패</option>
                                ) : academies.length === 0 ? (
                                    <option value="">승인된 기관이 없습니다</option>
                                ) : (
                                    academies.map(academy => (
                                        <option key={academy.id} value={academy.id}>
                                            {academy.name}
                                        </option>
                                    ))
                                )}
                            </select>
                            {academyLoadError && (
                                <div className="mt-1 flex items-center justify-between">
                                    <p className="text-sm text-red-500">{academyLoadError}</p>
                                    <button
                                        type="button"
                                        onClick={loadAcademies}
                                        disabled={isLoadingAcademies}
                                        className="text-xs text-primary-600 hover:underline flex items-center gap-1 disabled:opacity-50"
                                    >
                                        <RefreshCw className={`w-3 h-3 ${isLoadingAcademies ? 'animate-spin' : ''}`} />
                                        다시 시도
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                과정명 <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={form.courseName || ''}
                                onChange={e => {
                                    setForm({ ...form, courseName: e.target.value });
                                    if (error) setError(null);
                                }}
                                className={`w-full px-4 py-2 rounded-lg border ${error ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:ring-primary-500'
                                    } bg-white dark:bg-slate-900 focus:ring-2 outline-none transition-colors`}
                                placeholder="과정명을 입력하세요"
                            />
                            {error && (
                                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                                    <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                                    {error}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                대상
                            </label>
                            <select
                                value={form.target || '취업예정자'}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                    const newTarget = e.target.value as CourseTarget;
                                    setForm({ ...form, target: newTarget, category: '' });
                                }}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary-500 outline-none"
                            >
                                <option value="취업예정자">취업예정자</option>
                                <option value="재직자">재직자</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                카테고리
                            </label>
                            <select
                                value={form.category || ''}
                                onChange={e => setForm({ ...form, category: e.target.value })}
                                disabled={isLoadingCategories}
                                className={`w-full px-4 py-2 rounded-lg border ${categoryLoadError ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary-500 outline-none disabled:opacity-50`}
                            >
                                {isLoadingCategories ? (
                                    <option value="">로딩 중...</option>
                                ) : categoryLoadError ? (
                                    <option value="">카테고리 로드 실패</option>
                                ) : categories.length === 0 ? (
                                    <option value="">카테고리 없음</option>
                                ) : (
                                    categories.map(cat => (
                                        <option key={cat.id} value={cat.categoryName}>
                                            {cat.categoryName}
                                        </option>
                                    ))
                                )}
                            </select>
                            {categoryLoadError && (
                                <p className="mt-1 text-sm text-red-500">{categoryLoadError}</p>
                            )}
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                모집 시작일
                            </label>
                            <input
                                type="date"
                                value={form.recruitStart || ''}
                                onChange={e => setForm({ ...form, recruitStart: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                모집 종료일
                            </label>
                            <input
                                type="date"
                                value={form.recruitEnd || ''}
                                onChange={e => setForm({ ...form, recruitEnd: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                교육 시작일
                            </label>
                            <input
                                type="date"
                                value={form.courseStart || ''}
                                onChange={e => setForm({ ...form, courseStart: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                교육 종료일
                            </label>
                            <input
                                type="date"
                                value={form.courseEnd || ''}
                                onChange={e => setForm({ ...form, courseEnd: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Cost & Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                수강료 (원)
                            </label>
                            <input
                                type="number"
                                value={form.cost || 0}
                                onChange={e => setForm({ ...form, cost: parseInt(e.target.value, 10) || 0 })}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                수업 요일
                            </label>
                            <select
                                value={form.classDay || '평일'}
                                onChange={e => setForm({ ...form, classDay: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary-500 outline-none"
                            >
                                <option value="평일">평일</option>
                                <option value="주말">주말</option>
                                <option value="평일+주말">평일+주말</option>
                                <option value="월수금">월수금</option>
                                <option value="화목">화목</option>
                                <option value="자유 선택">자유 선택</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2 flex flex-col gap-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.isKdt || false}
                                    onChange={e => setForm({ ...form, isKdt: e.target.checked })}
                                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                                />
                                <span className="text-sm text-slate-700 dark:text-slate-300">K-Digital Training</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.isNailbaeum || false}
                                    onChange={e => setForm({ ...form, isNailbaeum: e.target.checked })}
                                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                                />
                                <span className="text-sm text-slate-700 dark:text-slate-300">국민내일배움카드</span>
                            </label>
                        </div>
                    </div>

                    {/* Offline & Location */}
                    <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.isOffline || false}
                                onChange={e => setForm({ ...form, isOffline: e.target.checked, format: e.target.checked ? '오프라인' : '온라인' })}
                                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                            />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">오프라인 과정</span>
                        </label>
                        {form.isOffline && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    강의 장소
                                </label>
                                <input
                                    type="text"
                                    value={form.location || ''}
                                    onChange={e => setForm({ ...form, location: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary-500 outline-none"
                                    placeholder="상세 주소를 입력하세요"
                                />
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            과정 설명
                        </label>
                        <textarea
                            value={form.description || ''}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary-500 outline-none h-32 resize-none"
                            placeholder="과정에 대한 상세 설명을 입력하세요"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
                        >
                            {isEditing ? '수정 요청' : '등록 요청'}
                        </button>
                    </div>
                </form>
            </div>

            {/* 파일 업로드 오류 모달 */}
            <AlertModal
                isOpen={alertModal.isOpen}
                onClose={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
                title={alertModal.title}
                message={alertModal.message}
                type={alertModal.type}
            />
        </div>
    );
};

export default CourseRequestModal;
