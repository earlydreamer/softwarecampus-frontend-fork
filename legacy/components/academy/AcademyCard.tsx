import React from 'react';
import { Link } from 'react-router-dom';
import { Academy } from '../../types';

interface AcademyCardProps {
  academy: Academy;
}

/**
 * 기관 카드 컴포넌트
 * 레퍼런스: https://boottent.com/partners
 */
const AcademyCard: React.FC<AcademyCardProps> = ({ academy }) => {
  return (
    <Link
      to={`/academies/${academy.id}`}
      className="block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200"
    >
      {/* 기관 로고 영역 */}
      <div className="relative h-32 bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <img
          src={academy.logoUrl}
          alt={`${academy.name} 로고`}
          className="max-h-full max-w-full object-contain"
        />
        
        {/* 상태 배지 */}
        <div className="absolute top-2 right-2 flex gap-1">
          {academy.isRecruiting && (
            <span className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded">
              모집 중
            </span>
          )}
          {academy.isUpdated && (
            <span className="px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded">
              업데이트
            </span>
          )}
        </div>
      </div>

      {/* 기관 정보 영역 */}
      <div className="p-4">
        {/* 기관명 */}
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">
          {academy.name}
        </h3>

        {/* 기관 설명 */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 min-h-[2.5rem]">
          {academy.description}
        </p>

        {/* 과정 및 콘텐츠 정보 */}
        <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 mb-3">
          {academy.courseCount > 0 && (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              {academy.courseCount}건의 교육과정
            </span>
          )}
          {academy.contentCount > 0 && (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {academy.contentCount}건의 콘텐츠
            </span>
          )}
        </div>

        {/* 교육 분야 태그 */}
        {academy.fields.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {academy.fields.slice(0, 3).map((field, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded"
              >
                {field}
              </span>
            ))}
            {academy.fields.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                +{academy.fields.length - 3}
              </span>
            )}
          </div>
        )}

        {/* 평점 정보 (있는 경우) */}
        {academy.rating != null && academy.reviewCount != null && (
          <div className="flex items-center gap-2 text-sm">
            {academy.rating === 0 ? (
              <span className="text-gray-500 dark:text-gray-400 text-xs">
                아직 평가가 없습니다
              </span>
            ) : (
              <>
                <div className="flex items-center gap-1 text-yellow-500">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                  <span className="font-medium text-gray-900 dark:text-white">{academy.rating.toFixed(1)}</span>
                </div>
                <span className="text-gray-500 dark:text-gray-400">
                  ({academy.reviewCount.toLocaleString()}개 후기)
                </span>
              </>
            )}
          </div>
        )}
      </div>
    </Link>
  );
};

export default AcademyCard;
