import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <h2 className="text-lg font-bold text-primary dark:text-primary-dark">소프트웨어캠퍼스</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              부트캠프와 직무 교육을 통해 커리어 성장을 돕는 통합 교육 플랫폼입니다.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-wider uppercase">바로가기</h3>
            <ul className="mt-4 space-y-2 text-base text-gray-600 dark:text-gray-400">
              <li><Link to="/lectures" className="hover:text-gray-900 dark:hover:text-white">강의</Link></li>
              <li><Link to="/partners" className="hover:text-gray-900 dark:hover:text-white">협력기관</Link></li>
              <li><Link to="/community" className="hover:text-gray-900 dark:hover:text-white">커뮤니티</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-wider uppercase">고객센터</h3>
            <ul className="mt-4 space-y-2 text-base text-gray-600 dark:text-gray-400">
              <li>02-1234-5678</li>
              <li>contact@swcampus.kr</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-gray-200 dark:border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 md:order-1">
            &copy; {new Date().getFullYear()} Software Campus. All rights reserved.
          </p>
          <div className="flex space-x-6 md:order-2">
            <Link to="/privacy" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">개인정보처리방침</Link>
            <Link to="/terms" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">이용약관</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
