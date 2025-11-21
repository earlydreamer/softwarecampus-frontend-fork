import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AcademyCreateFormData } from '../types';
import { AlertCircle, ChevronLeftIcon } from '../components/icons/Icons';

const AcademyCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Partial<Record<keyof AcademyCreateFormData, string>>>({});
  const [formData, setFormData] = useState<AcademyCreateFormData>({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    businessNumber: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // 입력 시 해당 필드 에러 제거
    if (errors[name as keyof AcademyCreateFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleWebsiteBlur = () => {
    if (formData.website && formData.website.trim()) {
      const trimmedWebsite = formData.website.trim();
      
      // http:// 또는 https://로 시작하지 않으면 자동 추가
      if (!trimmedWebsite.startsWith('http://') && !trimmedWebsite.startsWith('https://')) {
        setFormData((prev) => ({ ...prev, website: `https://${trimmedWebsite}` }));
      }
    }
  };

  const handleBusinessNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, ''); // 숫자만 추출
    let formattedValue = value;

    // 자동 하이픈 포맷팅 (XXX-XX-XXXXX)
    if (value.length <= 3) {
      formattedValue = value;
    } else if (value.length <= 5) {
      formattedValue = `${value.slice(0, 3)}-${value.slice(3)}`;
    } else if (value.length <= 10) {
      formattedValue = `${value.slice(0, 3)}-${value.slice(3, 5)}-${value.slice(5)}`;
    } else {
      formattedValue = `${value.slice(0, 3)}-${value.slice(3, 5)}-${value.slice(5, 10)}`;
    }

    setFormData((prev) => ({ ...prev, businessNumber: formattedValue }));
    // 입력 시 에러 제거
    if (errors.businessNumber) {
      setErrors((prev) => ({ ...prev, businessNumber: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof AcademyCreateFormData, string>> = {};

    // 기관명 검증
    if (!formData.name.trim()) {
      newErrors.name = '기관명을 입력해주세요';
    } else if (formData.name.length < 2) {
      newErrors.name = '기관명은 2자 이상이어야 합니다';
    }

    // 설명 검증
    if (!formData.description.trim()) {
      newErrors.description = '기관 소개를 입력해주세요';
    } else if (formData.description.length < 10) {
      newErrors.description = '기관 소개는 10자 이상이어야 합니다';
    }

    // 주소 검증
    if (!formData.address.trim()) {
      newErrors.address = '주소를 입력해주세요';
    }

    // 전화번호 검증
    const phoneRegex = /^0[0-9]{1,2}-?[0-9]{3,4}-?[0-9]{4}$/;
    if (!formData.phone) {
      newErrors.phone = '전화번호를 입력해주세요';
    } else if (!phoneRegex.test(formData.phone.replace(/-/g, ''))) {
      newErrors.phone = '올바른 전화번호 형식이 아닙니다 (예: 02-1234-5678)';
    }

    // 이메일 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다';
    }

    // 웹사이트 검증 (선택적이지만 입력 시 형식 검증)
    if (formData.website) {
      try {
        const url = new URL(formData.website);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
          newErrors.website = '웹사이트 주소는 http:// 또는 https://로 시작해야 합니다';
        }
      } catch {
        newErrors.website = '올바른 웹사이트 주소 형식이 아닙니다 (예: https://www.example.com)';
      }
    }

    // 사업자등록번호 검증
    const cleanBusinessNumber = formData.businessNumber.replace(/-/g, '');
    if (!formData.businessNumber) {
      newErrors.businessNumber = '사업자등록번호를 입력해주세요';
    } else if (cleanBusinessNumber.length !== 10) {
      newErrors.businessNumber = '올바른 사업자등록번호 형식이 아닙니다 (예: 123-45-67890)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      // TODO: API 호출로 기관 등록 처리
      console.log('기관 등록 데이터:', formData);

      // 성공 시 회원가입 페이지로 돌아가기
      alert('기관 등록 요청이 완료되었습니다!\n관리자 승인 후 선택 가능합니다.');
      navigate('/signup');
    } catch (error) {
      console.error('기관 등록 실패:', error);
      alert('기관 등록에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* 뒤로 가기 버튼 */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary mb-6 transition"
        >
          <ChevronLeftIcon className="w-5 h-5" />
          <span>뒤로 가기</span>
        </button>

        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">교육 기관 등록</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            새로운 교육 기관 정보를 등록해주세요
          </p>
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              ℹ️ 등록하신 기관은 관리자 검토 후 승인됩니다. 승인 완료 시 이메일로 안내드립니다.
            </p>
          </div>
        </div>

        {/* 등록 폼 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 기관명 */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                기관명 *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border ${
                  errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white`}
                placeholder="예: 한국소프트웨어인재개발원"
              />
              {errors.name && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* 기관 소개 */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                기관 소개 *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className={`w-full px-4 py-3 border ${
                  errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white resize-none`}
                placeholder="기관의 특징과 교육 철학을 간단히 소개해주세요 (10자 이상)"
              />
              {errors.description && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.description}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {formData.description.length}자
              </p>
            </div>

            {/* 주소 */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                주소 *
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border ${
                  errors.address ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white`}
                placeholder="예: 서울 강남구 테헤란로 212"
              />
              {errors.address && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.address}
                </p>
              )}
            </div>

            {/* 전화번호 */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                대표 전화번호 *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border ${
                  errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white`}
                placeholder="02-1234-5678"
              />
              {errors.phone && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.phone}
                </p>
              )}
            </div>

            {/* 이메일 */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                대표 이메일 *
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
                placeholder="info@example.com"
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* 웹사이트 */}
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                웹사이트 (선택)
              </label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                onBlur={handleWebsiteBlur}
                className={`w-full px-4 py-3 border ${
                  errors.website ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white`}
                placeholder="www.example.com"
              />
              {errors.website && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.website}
                </p>
              )}
            </div>

            {/* 사업자등록번호 */}
            <div>
              <label htmlFor="businessNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                사업자등록번호 *
              </label>
              <input
                type="text"
                id="businessNumber"
                name="businessNumber"
                value={formData.businessNumber}
                onChange={handleBusinessNumberChange}
                className={`w-full px-4 py-3 border ${
                  errors.businessNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white`}
                placeholder="1234567890"
                maxLength={12}
              />
              {errors.businessNumber && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.businessNumber}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                사업자등록번호 10자리를 입력해주세요 (예: 1234567890)
              </p>
            </div>

            {/* 제출 버튼 */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                취소
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-opacity-90 transition"
              >
                등록 요청
              </button>
            </div>
          </form>
        </div>

        {/* 안내사항 */}
        <div className="mt-6 p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
          <h3 className="font-bold text-gray-900 dark:text-white mb-3">📋 등록 안내사항</h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>제출하신 정보는 관리자 검토 후 승인됩니다 (영업일 기준 1-3일 소요)</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>허위 정보 등록 시 승인이 거부될 수 있습니다</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>승인 완료 시 등록하신 이메일로 안내 메일이 발송됩니다</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>문의사항은 고객센터(help@softwarecampus.com)로 연락주세요</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AcademyCreatePage;
