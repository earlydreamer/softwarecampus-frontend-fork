import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Academy } from '../../types';
import { mockAcademies } from '../../data/mockAcademyData';
import { Search, XIcon, Building2, MapPin, Phone, Mail, ExternalLink } from '../icons/Icons';

// URL 안전성 검증 헬퍼 함수
const isSafeImageUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
};

interface AcademySelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (academy: Academy) => void;
}

const AcademySelectModal: React.FC<AcademySelectModalProps> = ({ isOpen, onClose, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [academies] = useState<Academy[]>(mockAcademies);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // 모달이 열릴 때 body 스크롤 방지 및 포커스 관리
  useEffect(() => {
    if (isOpen) {
      // 현재 포커스된 요소 저장
      previousActiveElement.current = document.activeElement as HTMLElement;
      
      // body 스크롤 방지
      document.body.style.overflow = 'hidden';
      
      // 모달 내부 첫 번째 포커스 가능한 요소로 포커스 이동
      setTimeout(() => {
        const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements && focusableElements.length > 0) {
          focusableElements[0].focus();
        }
      }, 100);
    } else {
      document.body.style.overflow = 'unset';
      
      // 모달이 닫힐 때 이전에 포커스된 요소로 복원
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Escape 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // 포커스 트랩 구현
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);

    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredAcademies = academies.filter((academy) => {
    const matchesSearch =
      academy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      academy.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      academy.address.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const handleSelect = (academy: Academy) => {
    onSelect(academy);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col"
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 id="modal-title" className="text-2xl font-bold text-gray-900 dark:text-white">소속 기관 선택</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              소속된 교육기관을 선택해주세요
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            aria-label="모달 닫기"
          >
            <XIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* 검색 */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="기관명, 주소, 설명으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* 기관 목록 */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredAcademies.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-2">검색 결과가 없습니다</p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                다른 검색어를 입력해보세요
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredAcademies.map((academy) => (
                <button
                  key={academy.id}
                  onClick={() => handleSelect(academy)}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-700/50 transition text-left group"
                >
                  <div className="flex items-start gap-4">
                    {isSafeImageUrl(academy.logoUrl) ? (
                      <img
                        src={academy.logoUrl}
                        alt={academy.name}
                        className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0 flex items-center justify-center">
                        <Building2 className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-primary transition">
                          {academy.name}
                        </h3>
                        {academy.rating && (
                          <div className="flex items-center gap-1 text-sm flex-shrink-0">
                            <span className="text-yellow-500">★</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {academy.rating.toFixed(1)}
                            </span>
                            <span className="text-gray-400">({academy.reviewCount})</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {academy.description}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{academy.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 flex-shrink-0" />
                          <span>{academy.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{academy.email}</span>
                        </div>
                        {academy.website && (
                          <div className="flex items-center gap-2">
                            <ExternalLink className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{academy.website}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {academy.fields.slice(0, 3).map((field, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md"
                          >
                            {field}
                          </span>
                        ))}
                        {academy.fields.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-md">
                            +{academy.fields.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-b-2xl">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              찾으시는 기관이 없나요?
            </p>
            <Link
              to="/academy/create"
              onClick={onClose}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition font-medium text-sm"
            >
              기관 등록하기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcademySelectModal;
