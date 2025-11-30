import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff, CheckCircle, Building2, Mail, X } from 'lucide-react';
import type { SignupFormData, Academy } from '../types';
import AcademySelectModal from '../components/auth/AcademySelectModal';
import EmailVerificationModal from '../components/auth/EmailVerificationModal';
import TermsModal from '../components/auth/TermsModal';
import { TERMS_OF_SERVICE, PRIVACY_POLICY, MARKETING_CONSENT } from '../data/terms';
import { signup } from '../services/authService';

import {
    isValidEmail,
    isValidPassword,
    isValidPhoneNumber,
    formatPhoneNumber
} from '../utils/validation';

const SignupPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'USER' | 'ACADEMY'>('USER');
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAcademyModalOpen, setIsAcademyModalOpen] = useState(false);
    const [isEmailVerificationModalOpen, setIsEmailVerificationModalOpen] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [selectedAcademy, setSelectedAcademy] = useState<Academy | null>(null);
    const [errors, setErrors] = useState<Partial<Record<keyof SignupFormData | 'passwordConfirm' | 'submit', string>>>({});
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

    // 약관 모달 상태
    const [termsModalState, setTermsModalState] = useState<{
        isOpen: boolean;
        type: 'TERMS' | 'PRIVACY' | 'MARKETING' | null;
    }>({
        isOpen: false,
        type: null
    });

    const [formData, setFormData] = useState<SignupFormData>({
        email: '',
        password: '',
        userName: '',
        phoneNumber: '',
        address: null,
        affiliation: null,
        position: null,
        accountType: 'USER',
        academyId: null,
        termsAgreed: false,
        privacyAgreed: false,
        marketingAgreed: false,
    });

    const handleTabChange = (tab: 'USER' | 'ACADEMY') => {
        setActiveTab(tab);
        setFormData({
            email: '',
            password: '',
            userName: '',
            phoneNumber: '',
            address: null,
            affiliation: null,
            position: null,
            accountType: tab,
            academyId: null,
            termsAgreed: false,
            privacyAgreed: false,
            marketingAgreed: false,
        });
        setPasswordConfirm('');
        setSelectedAcademy(null);
        setErrors({});
        setIsEmailVerified(false);
    };

    const handleAgreementChange = (name: keyof Pick<SignupFormData, 'termsAgreed' | 'privacyAgreed' | 'marketingAgreed'>) => {
        setFormData(prev => {
            const newData = { ...prev, [name]: !prev[name] };
            // 에러 상태 초기화
            if (errors[name as keyof typeof errors]) {
                setErrors(prevErrors => ({ ...prevErrors, [name]: undefined }));
            }
            return newData;
        });
    };

    const handleAllAgreementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        setFormData(prev => ({
            ...prev,
            termsAgreed: checked,
            privacyAgreed: checked,
            marketingAgreed: checked,
        }));
        // 전체 동의 시 관련 에러 제거
        if (checked) {
            setErrors(prev => ({
                ...prev,
                termsAgreed: undefined,
                privacyAgreed: undefined
            }));
        }
    };

    const openTermsModal = (type: 'TERMS' | 'PRIVACY' | 'MARKETING') => {
        setTermsModalState({
            isOpen: true,
            type
        });
    };

    const getTermsContent = () => {
        switch (termsModalState.type) {
            case 'TERMS':
                return { title: '이용약관', content: TERMS_OF_SERVICE };
            case 'PRIVACY':
                return { title: '개인정보 수집 및 이용 동의', content: PRIVACY_POLICY };
            case 'MARKETING':
                return { title: '마케팅 정보 수신 동의', content: MARKETING_CONSENT };
            default:
                return { title: '', content: '' };
        }
    };

    const handleAcademySelect = (academy: Academy) => {
        setSelectedAcademy(academy);
        setFormData(prev => ({ ...prev, academyId: academy.id }));
        setErrors(prev => ({ ...prev, academyId: undefined }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value || null }));

        if (name === 'email') {
            setIsEmailVerified(false);
        }

        if (errors[name as keyof typeof errors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, '');

        const formattedValue = formatPhoneNumber(value);

        setFormData(prev => ({ ...prev, phoneNumber: formattedValue }));
        if (errors.phoneNumber) {
            setErrors(prev => ({ ...prev, phoneNumber: undefined }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof SignupFormData | 'passwordConfirm', string>> = {};

        if (!formData.email) {
            newErrors.email = '이메일은 필수입니다';
        } else if (!isValidEmail(formData.email)) {
            newErrors.email = '유효한 이메일 형식이 아닙니다';
        } else if (!isEmailVerified) {
            newErrors.email = '이메일 인증이 필요합니다';
        }

        if (!formData.password) {
            newErrors.password = '비밀번호는 필수입니다';
        } else if (formData.password.length < 8 || formData.password.length > 20) {
            newErrors.password = '비밀번호는 8~20자여야 합니다';
        } else if (!isValidPassword(formData.password)) {
            newErrors.password = '비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다';
        }

        if (formData.password !== passwordConfirm) {
            newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다';
        }

        if (!formData.userName) {
            newErrors.userName = '사용자명은 필수입니다';
        } else if (formData.userName.length < 2 || formData.userName.length > 50) {
            newErrors.userName = '사용자명은 2~50자여야 합니다';
        }

        if (!formData.phoneNumber) {
            newErrors.phoneNumber = '전화번호는 필수입니다';
        } else if (!isValidPhoneNumber(formData.phoneNumber)) {
            newErrors.phoneNumber = '올바른 휴대폰 번호 형식이 아닙니다 (예: 010-1234-5678)';
        }

        if (formData.accountType === 'ACADEMY' && !formData.academyId) {
            newErrors.academyId = '소속 기관을 선택해주세요';
        }

        if (!formData.termsAgreed) {
            newErrors.termsAgreed = '이용약관에 동의해주세요';
        }

        if (!formData.privacyAgreed) {
            newErrors.privacyAgreed = '개인정보 수집 및 이용에 동의해주세요';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isSubmitting || !validateForm()) {
            return;
        }

        setIsSubmitting(true);
        setErrors(prev => ({ ...prev, submit: undefined }));

        try {
            await signup(formData);
            
            setIsSuccessModalOpen(true);
        } catch (error: any) {
            console.error('회원가입 실패:', error);
            setErrors(prev => ({
                ...prev,
                submit: error.response?.data?.detail || '회원가입에 실패했습니다. 다시 시도해주세요.'
            }));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSuccessModalClose = () => {
        setIsSuccessModalOpen(false);
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">회원가입</h1>
                    <p className="mt-2 text-slate-600 dark:text-slate-400">
                        소프트웨어 캠퍼스에 오신 것을 환영합니다
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-t-2xl shadow-lg overflow-hidden">
                    <div className="flex border-b border-slate-200 dark:border-slate-700">
                        <button
                            onClick={() => handleTabChange('USER')}
                            className={`flex-1 py-4 px-6 text-center font-semibold transition ${activeTab === 'USER'
                                ? 'bg-primary-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                        >
                            일반회원
                        </button>
                        <button
                            onClick={() => handleTabChange('ACADEMY')}
                            className={`flex-1 py-4 px-6 text-center font-semibold transition ${activeTab === 'ACADEMY'
                                ? 'bg-primary-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                        >
                            기관회원
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {/* 이메일 */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                이메일 *
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    disabled={isEmailVerified}
                                    className={`flex-1 px-4 py-3 border ${errors.email ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                                        } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none disabled:bg-slate-100 dark:disabled:bg-slate-700 disabled:text-slate-500`}
                                    placeholder="example@email.com"
                                />
                                <button
                                    type="button"
                                    onClick={() => setIsEmailVerificationModalOpen(true)}
                                    disabled={!formData.email || !isValidEmail(formData.email) || isEmailVerified}
                                    className={`px-4 py-3 rounded-lg font-medium transition whitespace-nowrap ${isEmailVerified
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 cursor-default'
                                            : 'bg-primary-600 text-white hover:bg-primary-700 disabled:bg-slate-200 disabled:text-slate-500 dark:disabled:bg-slate-700 dark:disabled:text-slate-400'
                                        }`}
                                >
                                    {isEmailVerified ? (
                                        <span className="flex items-center gap-1">
                                            <CheckCircle className="w-4 h-4" />
                                            인증 완료
                                        </span>
                                    ) : (
                                        '인증하기'
                                    )}
                                </button>
                            </div>
                            {errors.email && (
                                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        {/* 사용자명 */}
                        <div>
                            <label htmlFor="userName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                사용자명 *
                            </label>
                            <input
                                type="text"
                                id="userName"
                                name="userName"
                                value={formData.userName}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-3 border ${errors.userName ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                                    } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none`}
                                placeholder="2~50자 사용자명"
                            />
                            {errors.userName && (
                                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    {errors.userName}
                                </p>
                            )}
                        </div>

                        {/* 비밀번호 */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                비밀번호 *
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 pr-12 border ${errors.password ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                                        } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none`}
                                    placeholder="8~20자, 영문+숫자+특수문자"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                    aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        {/* 비밀번호 확인 */}
                        <div>
                            <label htmlFor="passwordConfirm" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                비밀번호 확인 *
                            </label>
                            <div className="relative">
                                <input
                                    type={showPasswordConfirm ? 'text' : 'password'}
                                    id="passwordConfirm"
                                    value={passwordConfirm}
                                    onChange={(e) => {
                                        setPasswordConfirm(e.target.value);
                                        if (errors.passwordConfirm) {
                                            setErrors(prev => ({ ...prev, passwordConfirm: undefined }));
                                        }
                                    }}
                                    className={`w-full px-4 py-3 pr-12 border ${errors.passwordConfirm ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                                        } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none`}
                                    placeholder="비밀번호를 다시 입력하세요"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                    aria-label={showPasswordConfirm ? "비밀번호 확인 숨기기" : "비밀번호 확인 보기"}
                                >
                                    {showPasswordConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.passwordConfirm && (
                                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    {errors.passwordConfirm}
                                </p>
                            )}
                            {!errors.passwordConfirm && passwordConfirm && formData.password === passwordConfirm && (
                                <p className="mt-2 text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                                    <CheckCircle className="w-4 h-4" />
                                    비밀번호가 일치합니다
                                </p>
                            )}
                        </div>

                        {/* 전화번호 */}
                        <div>
                            <label htmlFor="phoneNumber" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                전화번호 *
                            </label>
                            <input
                                type="tel"
                                id="phoneNumber"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handlePhoneNumberChange}
                                className={`w-full px-4 py-3 border ${errors.phoneNumber ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                                    } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none`}
                                placeholder="010-1234-5678"
                                maxLength={13}
                            />
                            {errors.phoneNumber && (
                                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    {errors.phoneNumber}
                                </p>
                            )}
                        </div>

                        {/* 일반회원 추가 필드 */}
                        {activeTab === 'USER' && (
                            <>
                                <div>
                                    <label htmlFor="affiliation" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        소속 회사 (선택)
                                    </label>
                                    <input
                                        type="text"
                                        id="affiliation"
                                        name="affiliation"
                                        value={formData.affiliation || ''}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                                        placeholder="회사명을 입력하세요"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="position" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        직책 (선택)
                                    </label>
                                    <input
                                        type="text"
                                        id="position"
                                        name="position"
                                        value={formData.position || ''}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                                        placeholder="직책을 입력하세요"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="address" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        주소 (선택)
                                    </label>
                                    <input
                                        type="text"
                                        id="address"
                                        name="address"
                                        value={formData.address || ''}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                                        placeholder="주소를 입력하세요"
                                    />
                                </div>
                            </>
                        )}

                        {/* 기관회원 추가 필드 */}
                        {activeTab === 'ACADEMY' && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    소속 기관 *
                                </label>
                                {selectedAcademy ? (
                                    <div className="p-4 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-3 flex-1">
                                                <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-lg flex-shrink-0 flex items-center justify-center">
                                                    <Building2 className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-slate-900 dark:text-white">{selectedAcademy.name}</h4>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                                                        {selectedAcademy.description}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setIsAcademyModalOpen(true)}
                                                className="px-4 py-2 text-sm bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition flex-shrink-0"
                                            >
                                                변경
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setIsAcademyModalOpen(true)}
                                        className={`w-full px-4 py-12 border-2 border-dashed ${errors.academyId ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                                            } rounded-lg hover:border-primary-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400 hover:text-primary-600`}
                                    >
                                        <Building2 className="w-12 h-12" />
                                        <span className="font-medium">소속 기관 선택하기</span>
                                    </button>
                                )}
                                {errors.academyId && (
                                    <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.academyId}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* 약관 동의 */}
                        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="allAgreed"
                                    checked={formData.termsAgreed && formData.privacyAgreed && formData.marketingAgreed}
                                    onChange={handleAllAgreementChange}
                                    className="w-5 h-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                                />
                                <label htmlFor="allAgreed" className="font-bold text-slate-900 dark:text-white cursor-pointer select-none">
                                    전체 약관에 동의합니다
                                </label>
                            </div>

                            <div className="space-y-2 pl-1">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="termsAgreed"
                                            checked={formData.termsAgreed}
                                            onChange={() => handleAgreementChange('termsAgreed')}
                                            className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                                        />
                                        <label htmlFor="termsAgreed" className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                                            (필수) 이용약관 동의
                                        </label>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => openTermsModal('TERMS')}
                                        className="text-xs text-slate-500 underline hover:text-slate-800 dark:hover:text-slate-200"
                                    >
                                        내용 보기
                                    </button>
                                </div>
                                {errors.termsAgreed && (
                                    <p className="text-xs text-red-600 dark:text-red-400 pl-6">
                                        {errors.termsAgreed}
                                    </p>
                                )}

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="privacyAgreed"
                                            checked={formData.privacyAgreed}
                                            onChange={() => handleAgreementChange('privacyAgreed')}
                                            className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                                        />
                                        <label htmlFor="privacyAgreed" className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                                            (필수) 개인정보 수집 및 이용 동의
                                        </label>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => openTermsModal('PRIVACY')}
                                        className="text-xs text-slate-500 underline hover:text-slate-800 dark:hover:text-slate-200"
                                    >
                                        내용 보기
                                    </button>
                                </div>
                                {errors.privacyAgreed && (
                                    <p className="text-xs text-red-600 dark:text-red-400 pl-6">
                                        {errors.privacyAgreed}
                                    </p>
                                )}

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="marketingAgreed"
                                            checked={formData.marketingAgreed}
                                            onChange={() => handleAgreementChange('marketingAgreed')}
                                            className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                                        />
                                        <label htmlFor="marketingAgreed" className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                                            (선택) 마케팅 정보 수신 동의
                                        </label>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => openTermsModal('MARKETING')}
                                        className="text-xs text-slate-500 underline hover:text-slate-800 dark:hover:text-slate-200"
                                    >
                                        내용 보기
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 전역 에러 메시지 */}
                        {errors.submit && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <span>{errors.submit}</span>
                            </div>
                        )}

                        {/* 제출 버튼 */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition text-lg"
                            >
                                {isSubmitting ? '가입 중...' : '회원가입'}
                            </button>
                        </div>

                        {/* 로그인 링크 */}
                        <div className="text-center">
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                이미 계정이 있으신가요?{' '}
                                <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
                                    로그인하기
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>

            {/* 기관 선택 모달 */}
            <AcademySelectModal
                isOpen={isAcademyModalOpen}
                onClose={() => setIsAcademyModalOpen(false)}
                onSelect={handleAcademySelect}
            />

            {/* 이메일 인증 모달 */}
            <EmailVerificationModal
                isOpen={isEmailVerificationModalOpen}
                onClose={() => setIsEmailVerificationModalOpen(false)}
                email={formData.email || ''}
                onVerified={() => {
                    setIsEmailVerified(true);
                    setErrors(prev => ({ ...prev, email: undefined }));
                }}
                type="SIGNUP"
            />

            {/* 약관 모달 */}
            <TermsModal
                isOpen={termsModalState.isOpen}
                onClose={() => setTermsModalState(prev => ({ ...prev, isOpen: false }))}
                title={getTermsContent().title}
                content={getTermsContent().content}
            />

            {/* 회원가입 성공 모달 */}
            {isSuccessModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                회원가입 완료!
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 mb-8">
                                {activeTab === 'ACADEMY'
                                    ? '회원가입 요청이 완료되었습니다.\n관리자 승인 후 서비스를 이용하실 수 있습니다.'
                                    : '소프트웨어 캠퍼스의 회원이 되신 것을 환영합니다.\n로그인 후 서비스를 이용해주세요.'}
                            </p>
                            <button
                                onClick={handleSuccessModalClose}
                                className="w-full py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition"
                            >
                                로그인 페이지로 이동
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SignupPage;
