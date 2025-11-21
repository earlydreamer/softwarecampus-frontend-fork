import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SignupFormData, UserRole, Academy } from '../types';
import AcademySelectModal from '../components/auth/AcademySelectModal';
import { Eye, EyeOff, AlertCircle, CheckCircle, Building2 } from '../components/icons/Icons';

// 정규식 상수
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/;
const PHONE_DIGITS_REGEX = /[^0-9]/g;

// URL 안전성 검증 헬퍼 함수
const isSafeImageUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
};

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'USER' | 'ACADEMY'>('USER');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [isAcademyModalOpen, setIsAcademyModalOpen] = useState(false);
  const [selectedAcademy, setSelectedAcademy] = useState<Academy | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof SignupFormData | 'submit', string>>>({});
  const [formData, setFormData] = useState<SignupFormData>({
    userName: '',
    password: '',
    passwordConfirm: '',
    email: '',
    phoneNumber: '',
    accountType: 'USER',
    affiliation: '',
    position: '',
  });

  const handleTabChange = (tab: 'USER' | 'ACADEMY') => {
    setActiveTab(tab);
    setFormData({
      userName: '',
      password: '',
      passwordConfirm: '',
      email: '',
      phoneNumber: '',
      accountType: tab,
      affiliation: '',
      position: '',
    });
    setSelectedAcademy(null);
    setErrors({});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // 입력 시 해당 필드 에러 제거
    if (errors[name as keyof SignupFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const value = inputValue.replace(PHONE_DIGITS_REGEX, ''); // 숫자만 추출
    
    let formattedValue = value;

    // 자동 하이픈 포맷팅
    if (value.length <= 3) {
      formattedValue = value;
    } else if (value.length <= 7) {
      formattedValue = `${value.slice(0, 3)}-${value.slice(3)}`;
    } else if (value.length <= 11) {
      formattedValue = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7)}`;
    } else {
      formattedValue = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7, 11)}`;
    }

    setFormData((prev) => ({ ...prev, phoneNumber: formattedValue }));
    // 입력 시 에러 제거
    if (errors.phoneNumber) {
      setErrors((prev) => ({ ...prev, phoneNumber: undefined }));
    }
  };

  const handleAcademySelect = (academy: Academy) => {
    setSelectedAcademy(academy);
    setFormData((prev) => ({ ...prev, academyId: academy.id }));
    setErrors((prev) => ({ ...prev, academyId: undefined }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof SignupFormData, string>> = {};

    // 아이디 검증
    if (!formData.userName.trim()) {
      newErrors.userName = '아이디를 입력해주세요';
    } else if (formData.userName.length < 4) {
      newErrors.userName = '아이디는 4자 이상이어야 합니다';
    }

    // 비밀번호 검증
    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요';
    } else if (formData.password.length < 8) {
      newErrors.password = '비밀번호는 8자 이상이어야 합니다';
    } else if (!PASSWORD_REGEX.test(formData.password)) {
      newErrors.password = '비밀번호는 대소문자, 숫자, 특수문자(@$!%*?&)를 포함해야 합니다';
    }

    // 비밀번호 확인
    if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다';
    }

    // 이메일 검증
    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요';
    } else if (!EMAIL_REGEX.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다';
    }

    // 전화번호 검증
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = '전화번호를 입력해주세요';
    } else {
      const digitsOnly = formData.phoneNumber.replace(/-/g, '');
      if (digitsOnly.length < 10 || digitsOnly.length > 11) {
        newErrors.phoneNumber = '올바른 전화번호 형식이 아닙니다 (10-11자리)';
      }
    }

    // 기관회원인 경우 기관 선택 필수
    if (formData.accountType === 'ACADEMY' && !selectedAcademy) {
      newErrors.academyId = '소속 기관을 선택해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 이미 제출 중이거나 검증 실패 시 조기 반환
    if (isSubmitting) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors((prev) => ({ ...prev, submit: undefined }));

    try {
      // TODO: API 호출로 회원가입 처리
      // const response = await fetch('/api/signup', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // });
      // 
      // if (!response.ok) {
      //   throw new Error('회원가입에 실패했습니다');
      // }

      console.log('회원가입 데이터:', formData);
      
      // 성공 시 로그인 페이지로 이동
      navigate('/login', { 
        state: { message: '회원가입이 완료되었습니다! 로그인해주세요.' } 
      });
    } catch (error) {
      console.error('회원가입 실패:', error);
      setErrors((prev) => ({ 
        ...prev, 
        submit: error instanceof Error ? error.message : '회원가입에 실패했습니다. 다시 시도해주세요.' 
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">회원가입</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            소프트웨어 캠퍼스에 오신 것을 환영합니다
          </p>
        </div>

        {/* 회원 유형 선택 탭 */}
        <div className="bg-white dark:bg-gray-800 rounded-t-2xl shadow-lg overflow-hidden">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => handleTabChange('USER')}
              className={`flex-1 py-4 px-6 text-center font-semibold transition ${
                activeTab === 'USER'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              일반회원
            </button>
            <button
              onClick={() => handleTabChange('ACADEMY')}
              className={`flex-1 py-4 px-6 text-center font-semibold transition ${
                activeTab === 'ACADEMY'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              기관회원
            </button>
          </div>

          {/* 회원가입 폼 */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* 아이디 */}
            <div>
              <label htmlFor="userName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                아이디 *
              </label>
              <input
                type="text"
                id="userName"
                name="userName"
                value={formData.userName}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border ${
                  errors.userName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white`}
                placeholder="4자 이상의 아이디를 입력하세요"
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
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                비밀번호 *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 pr-12 border ${
                    errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white`}
                  placeholder="8자 이상, 대소문자, 숫자, 특수문자 포함"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
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
              <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                비밀번호 확인 *
              </label>
              <div className="relative">
                <input
                  type={showPasswordConfirm ? 'text' : 'password'}
                  id="passwordConfirm"
                  name="passwordConfirm"
                  value={formData.passwordConfirm}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 pr-12 border ${
                    errors.passwordConfirm ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white`}
                  placeholder="비밀번호를 다시 입력하세요"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
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
              {!errors.passwordConfirm && formData.passwordConfirm && formData.password === formData.passwordConfirm && (
                <p className="mt-2 text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  비밀번호가 일치합니다
                </p>
              )}
            </div>

            {/* 이메일 */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                이메일 *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border ${
                  errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white`}
                placeholder="example@email.com"
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* 전화번호 */}
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                전화번호 *
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handlePhoneNumberChange}
                className={`w-full px-4 py-3 border ${
                  errors.phoneNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white`}
                placeholder="01012345678"
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
                  <label htmlFor="affiliation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    소속 회사 (선택)
                  </label>
                  <input
                    type="text"
                    id="affiliation"
                    name="affiliation"
                    value={formData.affiliation}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    placeholder="회사명을 입력하세요"
                  />
                </div>

                <div>
                  <label htmlFor="position" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    부서 (선택)
                  </label>
                  <input
                    type="text"
                    id="position"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    placeholder="부서명을 입력하세요"
                  />
                </div>
              </>
            )}

            {/* 기관회원 추가 필드 */}
            {activeTab === 'ACADEMY' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  소속 기관 *
                </label>
                {selectedAcademy ? (
                  <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        {selectedAcademy.logoUrl && isSafeImageUrl(selectedAcademy.logoUrl) ? (
                          <img
                            src={selectedAcademy.logoUrl}
                            alt={selectedAcademy.name}
                            className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0 flex items-center justify-center">
                            <Building2 className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 dark:text-white">{selectedAcademy.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                            {selectedAcademy.description}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsAcademyModalOpen(true)}
                        className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition flex-shrink-0"
                      >
                        변경
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsAcademyModalOpen(true)}
                    className={`w-full px-4 py-12 border-2 border-dashed ${
                      errors.academyId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } rounded-lg hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-800 transition flex flex-col items-center justify-center gap-3 text-gray-500 dark:text-gray-400 hover:text-primary`}
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
                className="w-full py-4 bg-primary text-white rounded-lg font-semibold hover:bg-opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed transition text-lg"
              >
                {isSubmitting ? '가입 중...' : '회원가입'}
              </button>
            </div>

            {/* 로그인 링크 */}
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                이미 계정이 있으신가요?{' '}
                <Link to="/login" className="text-primary font-semibold hover:underline">
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
    </div>
  );
};

export default SignupPage;
