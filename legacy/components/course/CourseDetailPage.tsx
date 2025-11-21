import React from 'react';
import { Course } from '../../types';
import { StarIcon, CalendarIcon, DesktopIcon, UsersIcon } from '../icons/Icons';
import { getLargeImageUrl } from '../../utils/imageUtils';

interface CourseDetailPageProps {
  course: Course;
}

const InfoItem: React.FC<{ icon: React.ReactNode; label: string; value: string | number }> = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="text-primary dark:text-primary-dark">{icon}</div>
    <div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-base font-semibold text-gray-900 dark:text-white">{value}</p>
    </div>
  </div>
);

const CourseDetailPage: React.FC<CourseDetailPageProps> = ({ course }) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          <div className="md:col-span-2">
            <div className="mb-4">
              <span className="text-sm font-semibold text-primary dark:text-primary-dark">{course.institution}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-6">
              {course.title}
            </h1>

            <div className="w-full aspect-video rounded-lg overflow-hidden mb-8 shadow-lg">
              <img
                src={getLargeImageUrl(course.imageUrl)}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex flex-wrap gap-2 mb-8">
              {course.tags.map((tag, index) => (
                <span
                  key={`${tag}-${index}`}
                  className="text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <InfoItem
                icon={<StarIcon className="w-6 h-6" />}
                label="수강 평점"
                value={`${course.rating.toFixed(1)} (${course.reviewCount}개 리뷰)`}
              />
              <InfoItem
                icon={<CalendarIcon className="w-6 h-6" />}
                label="교육 기간"
                value={course.duration}
              />
              <InfoItem icon={<DesktopIcon className="w-6 h-6" />} label="교육 방식" value={course.format} />
              <InfoItem icon={<UsersIcon className="w-6 h-6" />} label="교육 대상" value={course.category} />
            </div>

            <section className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">과정 소개</h2>
              <p className="leading-relaxed">{course.description}</p>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">이 과정에서 얻게 되는 것</h3>
              <ul className="list-disc list-inside space-y-2">
                {course.highlights.map((item, index) => (
                  <li key={`${item}-${index}`}>{item}</li>
                ))}
              </ul>
            </section>
          </div>

          <aside className="md:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">지금 바로 시작해 보세요</h3>
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      // TODO: 수강 신청 로직 구현
                      console.log('수강 신청:', course.title);
                    }}
                    aria-label="수강 신청하기"
                    className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-opacity-90 transition"
                  >
                    수강 신청하기
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      // TODO: 찜하기 로직 구현
                      console.log('찜하기:', course.title);
                    }}
                    aria-label="찜하기"
                    className="w-full flex justify-center items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-gray-700 dark:text-gray-200 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    찜하기
                  </button>
                </div>
                <ul className="mt-6 space-y-3 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✔</span>
                    수료증 발급
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✔</span>
                    주차별 프로젝트 실습
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✔</span>
                    현업 멘토 라이브 세션
                  </li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
