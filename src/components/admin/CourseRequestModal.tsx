import React, { useState, useEffect } from 'react';
import { X, Edit2, Upload } from 'lucide-react';
import type { CourseApprovalRequest } from '../../services/mockAdminData';

export interface CourseFormState extends Partial<CourseApprovalRequest> {
    imageFile?: File;
}

interface CourseRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CourseFormState) => void;
    initialData?: CourseApprovalRequest | null;
}

const CourseRequestModal: React.FC<CourseRequestModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialData
}) => {
    const [form, setForm] = useState<CourseFormState>({
        courseTitle: '',
        category: '프론트엔드',
        target: '취업예정자',
        format: '온라인',
        recruitStart: '',
        recruitEnd: '',
        courseStart: '',
        courseEnd: '',
        cost: 0,
        isKdt: false,
        isNailbaeum: false,
        isOffline: false,
        location: '',
        description: '',
        imageUrl: ''
    });
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setForm({ ...initialData });
            } else {
                // 초기화
                setForm({
                    courseTitle: '',
                    category: '프론트엔드',
                    target: '취업예정자',
                    format: '온라인',
                    recruitStart: '',
                    recruitEnd: '',
                    courseStart: '',
                    courseEnd: '',
                    cost: 0,
                    isKdt: false,
                    isNailbaeum: false,
                    isOffline: false,
                    location: '',
                    description: '',
                    imageUrl: ''
                });
            }
        }
    }, [isOpen, initialData]);

    // Cleanup object URL on unmount or when imageUrl changes
    useEffect(() => {
        return () => {
            if (form.imageUrl && form.imageUrl.startsWith('blob:')) {
                URL.revokeObjectURL(form.imageUrl);
            }
        };
    }, [form.imageUrl]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Revoke old URL if it exists
            if (form.imageUrl && form.imageUrl.startsWith('blob:')) {
                URL.revokeObjectURL(form.imageUrl);
            }

            const imageUrl = URL.createObjectURL(file);
            setForm(prev => ({
                ...prev,
                imageFile: file,
                imageUrl: imageUrl
            }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.courseTitle || form.courseTitle.trim() === '') {
            setError('과정명을 입력해주세요.');
            return;
        }
        setError(null);
        onSubmit(form);
    };

    if (!isOpen) return null;

    const isEditing = !!initialData;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
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

                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                과정명 <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={form.courseTitle || ''}
                                onChange={e => {
                                    setForm({ ...form, courseTitle: e.target.value });
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
                                카테고리
                            </label>
                            <select
                                value={form.category || '프론트엔드'}
                                onChange={e => setForm({ ...form, category: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary-500 outline-none"
                            >
                                <option value="프론트엔드">프론트엔드</option>
                                <option value="백엔드">백엔드</option>
                                <option value="풀스택">풀스택</option>
                                <option value="데브옵스/인프라">데브옵스/인프라</option>
                                <option value="인공지능/데이터">인공지능/데이터</option>
                                <option value="모바일/앱">모바일/앱</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                대상
                            </label>
                            <select
                                value={form.target || '취업예정자'}
                                onChange={e => setForm({ ...form, target: e.target.value as any })}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary-500 outline-none"
                            >
                                <option value="취업예정자">취업예정자</option>
                                <option value="재직자">재직자</option>
                            </select>
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
                                onChange={e => setForm({ ...form, cost: parseInt(e.target.value) || 0 })}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                        </div>
                        <div className="flex flex-col gap-2 justify-center">
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
        </div>
    );
};

export default CourseRequestModal;
