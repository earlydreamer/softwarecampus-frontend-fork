import React, { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchAcademyById } from '../services/academyService';
import { mockAcademyQnAs } from '../data/mockAcademyQnAData';
import { AcademyQnA } from '../types';
import { useAuthStore } from '../store/authStore';

const AcademyDetailPage: React.FC = () => {
  const params = useParams<{ academyId: string }>();
  const academyId = Number(params.academyId);
  const { isAuthenticated, user } = useAuthStore();
  
  // 탭 상태 관리
  const [activeTab, setActiveTab] = useState<'intro' | 'courses' | 'qna'>('intro');
  const [qnaList, setQnaList] = useState<AcademyQnA[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [showQnAForm, setShowQnAForm] = useState(false);

  // 유효한 academyId인지 확인
  const isValidAcademyId = Boolean(params.academyId) && !Number.isNaN(academyId);

  const { data: academy, isLoading } = useQuery({
    queryKey: ['academy', academyId],
    queryFn: () => fetchAcademyById(academyId),
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
    enabled: isValidAcademyId
  });

  // Q&A 데이터 로드
  React.useEffect(() => {
    if (academyId) {
      setQnaList(mockAcademyQnAs[academyId] || []);
    }
  }, [academyId]);

  // Q&A 제출 핸들러
  const handleSubmitQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !isAuthenticated || !user) return;

    // 임시 ID 생성 (실제로는 백엔드에서 생성됨)
    const tempId = Math.max(0, ...qnaList.map(q => q.id)) + 1;
    
    const newQnA: AcademyQnA = {
      id: tempId,
      academyId,
      question: newQuestion.trim(),
      author: {
        id: 9999, // Mock 환경에서 임시 사용자 ID
        name: user.id || '익명', // Mock 환경: User 객체에 name 필드가 없어 id 사용
        avatar: undefined
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
      // answer와 answeredAt은 기관이 답변할 때 추가됨
    };

    setQnaList([newQnA, ...qnaList]);
    setNewQuestion('');
    setShowQnAForm(false);
  };

  // 섹션으로 스크롤 이동
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // 훅 호출 이후에 리다이렉션 처리
  if (!isValidAcademyId) {
    return <Navigate to="/academies" replace />;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="h-64 animate-pulse-fast rounded-xl bg-gray-200 dark:bg-gray-700" />
      </div>
    );
  }

  if (!academy) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">404</h1>
        <p className="text-gray-600 dark:text-gray-400">요청하신 교육기관을 찾을 수 없습니다.</p>
        <div className="flex justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center px-5 py-2.5 rounded-md bg-primary text-white text-sm font-semibold hover:bg-opacity-90 transition"
          >
            메인으로 돌아가기
          </Link>
          <Link
            to="/academies"
            className="inline-flex items-center px-5 py-2.5 rounded-md border border-gray-300 dark:border-gray-600 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            기관 목록 보기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 상단 헤더 영역 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
          <div className="p-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* 로고 */}
              <div className="flex-shrink-0 w-48 h-24 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center justify-center p-4 border border-gray-200 dark:border-gray-700">
                <img
                  src={academy.logoUrl}
                  alt={`${academy.name} 로고`}
                  className="max-w-full max-h-full object-contain"
                />
              </div>

              {/* 기관 정보 */}
              <div className="flex-1 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {academy.name}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                      {academy.description}
                    </p>
                  </div>
                  
                  {/* 상태 배지 */}
                  <div className="flex flex-col gap-2">
                    {academy.isRecruiting && (
                      <span className="px-3 py-1 bg-green-500 text-white text-sm font-medium rounded-full whitespace-nowrap">
                        모집 중
                      </span>
                    )}
                    {academy.isUpdated && (
                      <span className="px-3 py-1 bg-blue-500 text-white text-sm font-medium rounded-full whitespace-nowrap">
                        업데이트
                      </span>
                    )}
                  </div>
                </div>

                {/* 통계 정보 */}
                <div className="flex flex-wrap gap-6 text-sm">
                  {academy.courseCount > 0 && (
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300">
                        <strong className="font-semibold">{academy.courseCount}건</strong>의 교육과정
                      </span>
                    </div>
                  )}
                  {academy.contentCount > 0 && (
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300">
                        <strong className="font-semibold">{academy.contentCount}건</strong>의 콘텐츠
                      </span>
                    </div>
                  )}
                  {academy.rating && academy.reviewCount && (
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-yellow-500 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300">
                        <strong className="font-semibold">{academy.rating.toFixed(1)}</strong> ({academy.reviewCount.toLocaleString()}개 후기)
                      </span>
                    </div>
                  )}
                </div>

                {/* 교육 분야 태그 */}
                {academy.fields.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {academy.fields.map((field, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-dark text-sm font-medium rounded-full"
                      >
                        {field}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6 sticky top-16 z-10">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                setActiveTab('intro');
                scrollToSection('intro-section');
              }}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'intro'
                  ? 'text-primary dark:text-primary-dark border-b-2 border-primary dark:border-primary-dark'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              기관 소개
            </button>
            <button
              onClick={() => {
                setActiveTab('courses');
                scrollToSection('courses-section');
              }}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'courses'
                  ? 'text-primary dark:text-primary-dark border-b-2 border-primary dark:border-primary-dark'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              교육과정 ({academy.courseCount})
            </button>
            <button
              onClick={() => {
                setActiveTab('qna');
                scrollToSection('qna-section');
              }}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'qna'
                  ? 'text-primary dark:text-primary-dark border-b-2 border-primary dark:border-primary-dark'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Q&A ({qnaList.length})
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 메인 컨텐츠 */}
          <div className="lg:col-span-2 space-y-8">
            {/* 기관 소개 섹션 */}
            <section id="intro-section" className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 scroll-mt-32">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">기관 소개</h2>
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {academy.description}
                </p>
              </div>
              
              {/* 주요 특징 */}
              {academy.tags.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">주요 특징</h3>
                  <div className="flex flex-wrap gap-2">
                    {academy.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* 교육과정 섹션 */}
            <section id="courses-section" className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 scroll-mt-32">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                교육과정 ({academy.courseCount}건)
              </h2>
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <p className="text-lg font-medium">교육과정 목록은 준비 중입니다.</p>
                <p className="text-sm mt-2">곧 다양한 교육 과정을 만나보실 수 있습니다.</p>
              </div>
            </section>

            {/* Q&A 섹션 */}
            <section id="qna-section" className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 scroll-mt-32">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Q&A ({qnaList.length})
                </h2>
                {isAuthenticated && !showQnAForm && (
                  <button
                    onClick={() => setShowQnAForm(true)}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors text-sm font-medium"
                  >
                    질문하기
                  </button>
                )}
              </div>

              {/* 질문 작성 폼 */}
              {showQnAForm && (
                <form onSubmit={handleSubmitQuestion} className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <textarea
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="궁금한 점을 질문해주세요..."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    rows={4}
                    required
                  />
                  <div className="flex justify-end gap-2 mt-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowQnAForm(false);
                        setNewQuestion('');
                      }}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors text-sm font-medium"
                    >
                      질문 등록
                    </button>
                  </div>
                </form>
              )}

              {/* 로그인 유도 메시지 */}
              {!isAuthenticated && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    질문을 작성하려면{' '}
                    <Link to="/login" className="font-semibold underline hover:text-blue-600 dark:hover:text-blue-400">
                      로그인
                    </Link>
                    이 필요합니다.
                  </p>
                </div>
              )}

              {/* Q&A 목록 */}
              {qnaList.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-lg font-medium">아직 등록된 질문이 없습니다.</p>
                  <p className="text-sm mt-2">첫 번째 질문을 남겨보세요!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {qnaList.map((qna) => (
                    <div key={qna.id} className="p-5 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                      {/* 질문 */}
                      <div className="mb-3">
                        <div className="flex items-start gap-3 mb-2">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                            <span className="text-primary dark:text-primary-dark text-sm font-bold">Q</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-900 dark:text-white">{qna.author.name}</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(qna.createdAt).toLocaleDateString('ko-KR')}
                              </span>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300">{qna.question}</p>
                          </div>
                        </div>
                      </div>

                      {/* 답변 */}
                      {qna.answer ? (
                        <div className="ml-11 pl-4 border-l-2 border-primary/30 dark:border-primary/40">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                              <span className="text-green-600 dark:text-green-400 text-sm font-bold">A</span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-gray-900 dark:text-white">{academy.name}</span>
                                <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded">
                                  답변완료
                                </span>
                                {qna.answeredAt && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {new Date(qna.answeredAt).toLocaleDateString('ko-KR')}
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-700 dark:text-gray-300">{qna.answer}</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="ml-11 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                          <p className="text-sm text-gray-500 dark:text-gray-400 italic">답변 대기 중입니다...</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            {/* 연락처 정보 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-32">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">연락처 정보</h3>
              <div className="space-y-4">
                {/* 주소 */}
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">주소</p>
                    <p className="text-sm text-gray-900 dark:text-white mt-1">{academy.address}</p>
                  </div>
                </div>

                {/* 전화번호 */}
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">전화번호</p>
                    <a
                      href={`tel:${academy.phone}`}
                      className="text-sm text-primary hover:underline mt-1 block"
                    >
                      {academy.phone}
                    </a>
                  </div>
                </div>

                {/* 이메일 */}
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">이메일</p>
                    <a
                      href={`mailto:${academy.email}`}
                      className="text-sm text-primary hover:underline mt-1 block break-all"
                    >
                      {academy.email}
                    </a>
                  </div>
                </div>

                {/* 웹사이트 */}
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">웹사이트</p>
                    <a
                      href={academy.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline mt-1 block break-all"
                    >
                      {academy.website}
                    </a>
                  </div>
                </div>

                {/* 설립일 */}
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">설립일</p>
                    <p className="text-sm text-gray-900 dark:text-white mt-1">
                      {new Date(academy.establishedDate).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA 버튼 */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <a
                  href={academy.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center px-4 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-opacity-90 transition-colors"
                >
                  공식 홈페이지 방문
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 네비게이션 */}
        <div className="mt-8 flex justify-center">
          <Link
            to="/academies"
            className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            기관 목록으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AcademyDetailPage;
