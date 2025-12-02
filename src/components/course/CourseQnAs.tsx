import { useState } from 'react';
import DOMPurify from 'dompurify';
import type { CourseQna } from '../../types';
import { MessageCircle, CheckCircle2, Eye, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Search, Paperclip, Download, Trash2, Edit3, Send } from 'lucide-react';
import QnAForm from '../common/QnAForm';
import { uploadCourseQnaFile, answerCourseQnA, updateCourseQnAAnswer, deleteCourseQnAAnswer, deleteCourseQnA } from '../../services/courseService';
import { sanitizeUrl } from '../../utils/security';
import { useAuthStore } from '../../store/authStore';
import ConfirmModal from '../common/ConfirmModal';

import { QNA_PER_PAGE } from '../../constants';

interface CourseQnAsProps {
    courseId: number;
    academyId?: number; // 과정 소속 기관 ID
    qnas: CourseQna[];
    totalCount: number;
    page: number;
    onPageChange: (page: number) => void;
    isLoading?: boolean;
    onQuestionSubmit: (title: string, content: string, fileDetails: { id: number; originName: string; fileUrl: string }[]) => void;
    onSearch?: (keyword: string) => void;
    onQnAsUpdate?: () => void; // Q&A 갱신 콜백
}

const CourseQnAs = ({ courseId, academyId, qnas, totalCount, page, onPageChange, isLoading, onQuestionSubmit, onSearch, onQnAsUpdate }: CourseQnAsProps) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [expandedQnaId, setExpandedQnaId] = useState<number | null>(null);
    const [searchKeyword, setSearchKeyword] = useState('');

    // 답변 관련 상태
    const [answerFormQnaId, setAnswerFormQnaId] = useState<number | null>(null);
    const [answerText, setAnswerText] = useState('');
    const [isAnswerSubmitting, setIsAnswerSubmitting] = useState(false);

    // 삭제 확인 모달 상태
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; qnaId: number | null; type: 'question' | 'answer' }>({
        isOpen: false,
        qnaId: null,
        type: 'question'
    });

    // 현재 사용자 정보
    const { user, isAuthenticated } = useAuthStore();

    // 답변 권한 확인 (관리자 또는 해당 기관 회원)
    const canAnswer = isAuthenticated && user && (
        user.accountType === 'ADMIN' ||
        (user.accountType === 'ACADEMY' && user.academyId === academyId)
    );

    // 질문 삭제 권한 확인 (질문자 본인 또는 관리자)
    const canDeleteQuestion = (qna: CourseQna) => {
        if (!isAuthenticated || !user) return false;
        return user.accountType === 'ADMIN' || user.id === qna.accountId;
    };

    // 답변 수정/삭제 권한 확인 (관리자 또는 답변 작성자)
    const canEditAnswer = (qna: CourseQna) => {
        if (!isAuthenticated || !user || !qna.isAnswered) return false;
        return user.accountType === 'ADMIN' || user.id === qna.answeredById;
    };

    // 답변 등록/수정 핸들러
    const handleAnswerSubmit = async (qnaId: number, isEdit: boolean) => {
        if (!answerText.trim() || isAnswerSubmitting) return;

        setIsAnswerSubmitting(true);
        try {
            if (isEdit) {
                await updateCourseQnAAnswer(qnaId, answerText);
            } else {
                await answerCourseQnA(qnaId, answerText);
            }
            setAnswerFormQnaId(null);
            setAnswerText('');
            if (onQnAsUpdate) onQnAsUpdate();
        } catch (error) {
            console.error('답변 처리 실패:', error);
        } finally {
            setIsAnswerSubmitting(false);
        }
    };

    // 답변 삭제 핸들러
    const handleDeleteAnswer = async (qnaId: number) => {
        try {
            await deleteCourseQnAAnswer(qnaId);
            if (onQnAsUpdate) onQnAsUpdate();
        } catch (error) {
            console.error('답변 삭제 실패:', error);
        }
    };

    // 질문 삭제 핸들러
    const handleDeleteQuestion = async (qnaId: number) => {
        try {
            await deleteCourseQnA(qnaId);
            if (onQnAsUpdate) onQnAsUpdate();
        } catch (error) {
            console.error('질문 삭제 실패:', error);
        }
    };

    // 삭제 확인 처리
    const handleDeleteConfirm = async () => {
        if (deleteConfirm.qnaId === null) return;

        if (deleteConfirm.type === 'question') {
            await handleDeleteQuestion(deleteConfirm.qnaId);
        } else {
            await handleDeleteAnswer(deleteConfirm.qnaId);
        }
        setDeleteConfirm({ isOpen: false, qnaId: null, type: 'question' });
    };

    // 답변 작성 폼 열기
    const openAnswerForm = (qna: CourseQna) => {
        setAnswerFormQnaId(qna.id);
        setAnswerText(qna.answerText || '');
    };

    const toggleQna = (id: number) => {
        setExpandedQnaId(expandedQnaId === id ? null : id);
    };

    const handleSearch = () => {
        if (onSearch) {
            onSearch(searchKeyword);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const totalPages = Math.ceil(totalCount / QNA_PER_PAGE);

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 animate-pulse">
                        <div className="h-4 bg-slate-200 rounded w-2/3 mb-3"></div>
                        <div className="h-16 bg-slate-200 rounded"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h3 className="text-lg font-bold text-slate-900">
                    과정 Q&A <span className="text-primary-600">({totalCount})</span>
                </h3>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <input
                            type="text"
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="질문 검색..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                        />
                        <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                    <button
                        onClick={handleSearch}
                        className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                    >
                        검색
                    </button>
                    {!isFormOpen && (
                        <button
                            onClick={() => setIsFormOpen(true)}
                            className="px-6 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors whitespace-nowrap"
                        >
                            질문하기
                        </button>
                    )}
                </div>
            </div>

            {isFormOpen && (
                <QnAForm
                    onSubmit={(title, content, fileDetails) => {
                        onQuestionSubmit(title, content, fileDetails);
                        setIsFormOpen(false);
                    }}
                    onCancel={() => setIsFormOpen(false)}
                    onFileUpload={(file) => uploadCourseQnaFile(courseId, file)}
                />
            )}

            <div className="space-y-4">
                {qnas.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-slate-500 mb-4">
                            {searchKeyword ? `'${searchKeyword}'에 대한 검색 결과가 없습니다.` : '아직 등록된 질문이 없습니다.'}
                        </p>
                        {!isFormOpen && !searchKeyword && (
                            <button
                                onClick={() => setIsFormOpen(true)}
                                className="px-6 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                            >
                                첫 질문 남기기
                            </button>
                        )}
                        {searchKeyword && (
                            <button
                                onClick={() => {
                                    setSearchKeyword('');
                                    if (onSearch) onSearch('');
                                }}
                                className="text-primary-600 hover:underline font-medium"
                            >
                                전체 목록 보기
                            </button>
                        )}
                    </div>
                ) : (
                    qnas.map(qna => (
                        <div key={qna.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-primary-200 transition-colors shadow-sm hover:shadow-md">
                            {/* 질문 헤더 (클릭 시 확장) */}
                            <div
                                role="button"
                                tabIndex={0}
                                aria-expanded={expandedQnaId === qna.id}
                                onClick={() => toggleQna(qna.id)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        if (e.key === ' ') e.preventDefault();
                                        toggleQna(qna.id);
                                    }
                                }}
                                className="p-6 cursor-pointer hover:bg-slate-50 transition-colors outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                                        <span className="text-slate-400 font-bold text-sm">{qna.writerName?.[0] || 'Q'}</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="font-medium text-slate-900">{qna.writerName || '익명'}</span>
                                            <span className="text-sm text-slate-500">
                                                {new Date(qna.createdAt).toLocaleDateString()}
                                            </span>
                                            {qna.isAnswered ? (
                                                <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100 font-medium">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    답변완료
                                                </span>
                                            ) : (
                                                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 font-medium">
                                                    답변대기
                                                </span>
                                            )}
                                        </div>
                                        <h4 className="font-semibold text-slate-900 mb-1 flex items-center gap-2 text-lg">
                                            <MessageCircle className="w-5 h-5 text-primary-600 shrink-0" />
                                            {qna.title}
                                            {qna.files && qna.files.length > 0 && (
                                                <Paperclip className="w-4 h-4 text-slate-400" aria-hidden="true" />
                                            )}
                                        </h4>
                                        <div className="flex items-center justify-between mt-3">
                                            <span className="flex items-center gap-1 text-sm text-slate-500">
                                                <Eye className="w-4 h-4" />
                                                조회 {qna.viewCount}
                                            </span>
                                            {expandedQnaId === qna.id ? (
                                                <ChevronUp className="w-5 h-5 text-slate-400" />
                                            ) : (
                                                <ChevronDown className="w-5 h-5 text-slate-400" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 질문 내용 및 답변 (확장 시 표시) */}
                            {expandedQnaId === qna.id && (
                                <div className="border-t border-slate-100 animate-fadeIn">
                                    <div className="p-6 bg-slate-50/50">
                                        <div className="prose prose-sm max-w-none text-slate-600" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(qna.questionText || '') }} />

                                        {/* 첨부파일 목록 */}
                                        {qna.files && qna.files.length > 0 && (
                                            <div className="mt-6 pt-4 border-t border-slate-200">
                                                <h5 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                                    <Paperclip className="w-4 h-4" />
                                                    첨부파일 ({qna.files.length})
                                                </h5>
                                                <div className="flex flex-wrap gap-2">
                                                    {qna.files.map(file => {
                                                        const safeUrl = sanitizeUrl(file.fileUrl);
                                                        // 유효하지 않은 URL은 렌더링하지 않음
                                                        if (!safeUrl) return null;
                                                        return (
                                                            <a
                                                                key={file.id}
                                                                href={safeUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:text-primary-600 hover:border-primary-200 transition-colors"
                                                            >
                                                                <Download className="w-4 h-4" aria-hidden="true" />
                                                                {file.originName}
                                                            </a>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* 질문 삭제 버튼 (질문자 본인 또는 관리자) */}
                                        {canDeleteQuestion(qna) && (
                                            <div className="mt-4 pt-4 border-t border-slate-200 flex justify-end">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setDeleteConfirm({ isOpen: true, qnaId: qna.id, type: 'question' });
                                                    }}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    질문 삭제
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* 답변 영역 */}
                                    {qna.isAnswered && qna.answerText && answerFormQnaId !== qna.id && (
                                        <div className="bg-primary-50/30 p-6 border-t border-slate-100">
                                            <div className="flex items-start gap-4">
                                                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden shrink-0 border-2 border-white shadow-sm">
                                                    <span className="text-primary-600 font-bold text-sm">{qna.answeredByName?.[0] || 'A'}</span>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-primary-700">{qna.answeredByName || '담당자'}</span>
                                                            <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-bold border border-primary-200">
                                                                담당자
                                                            </span>
                                                            {qna.answeredAt && (
                                                                <span className="text-sm text-slate-500">
                                                                    {new Date(qna.answeredAt).toLocaleDateString()}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {/* 답변 수정/삭제 버튼 (관리자 또는 답변 작성자) */}
                                                        {canEditAnswer(qna) && (
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        openAnswerForm(qna);
                                                                    }}
                                                                    className="flex items-center gap-1 px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded transition-colors"
                                                                >
                                                                    <Edit3 className="w-3.5 h-3.5" />
                                                                    수정
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setDeleteConfirm({ isOpen: true, qnaId: qna.id, type: 'answer' });
                                                                    }}
                                                                    className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded transition-colors"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                    삭제
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="prose prose-sm max-w-none text-slate-800 bg-white p-4 rounded-xl border border-primary-100 shadow-sm" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(qna.answerText || '') }} />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* 답변 입력/수정 폼 (관리자 또는 해당 기관 회원) */}
                                    {answerFormQnaId === qna.id && (
                                        <div className="bg-slate-50 p-6 border-t border-slate-100">
                                            <h5 className="text-sm font-semibold text-slate-700 mb-3">
                                                {qna.isAnswered ? '답변 수정' : '답변 작성'}
                                            </h5>
                                            <textarea
                                                value={answerText}
                                                onChange={(e) => setAnswerText(e.target.value)}
                                                placeholder="답변 내용을 입력하세요..."
                                                className="w-full h-32 p-4 border border-slate-200 rounded-lg resize-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                                            />
                                            <div className="flex justify-end gap-2 mt-3">
                                                <button
                                                    onClick={() => {
                                                        setAnswerFormQnaId(null);
                                                        setAnswerText('');
                                                    }}
                                                    className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                                >
                                                    취소
                                                </button>
                                                <button
                                                    onClick={() => handleAnswerSubmit(qna.id, qna.isAnswered)}
                                                    disabled={!answerText.trim() || isAnswerSubmitting}
                                                    className="flex items-center gap-2 px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    <Send className="w-4 h-4" />
                                                    {isAnswerSubmitting ? '처리중...' : (qna.isAnswered ? '수정' : '등록')}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* 답변하기 버튼 (답변이 없고, 권한이 있으면 표시) */}
                                    {!qna.isAnswered && canAnswer && answerFormQnaId !== qna.id && (
                                        <div className="p-4 border-t border-slate-100 flex justify-end">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openAnswerForm(qna);
                                                }}
                                                className="flex items-center gap-2 px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                                답변하기
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {totalPages > 0 && (
                <div className="flex justify-center items-center gap-2 pt-8 pb-4 border-t border-slate-100 mt-8">
                    <button
                        onClick={() => onPageChange(page - 1)}
                        disabled={page === 1}
                        className="p-2.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white hover:text-primary-600 hover:border-primary-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all bg-slate-50"
                        aria-label="이전 페이지"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="flex gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                            <button
                                key={pageNum}
                                onClick={() => onPageChange(pageNum)}
                                className={`w-10 h-10 rounded-lg font-bold transition-all ${page === pageNum
                                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30 scale-105'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-primary-600 hover:border-primary-200'
                                    }`}
                            >
                                {pageNum}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => onPageChange(page + 1)}
                        disabled={page === totalPages}
                        className="p-2.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white hover:text-primary-600 hover:border-primary-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all bg-slate-50"
                        aria-label="다음 페이지"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            )}

            {/* 삭제 확인 모달 */}
            <ConfirmModal
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, qnaId: null, type: 'question' })}
                onConfirm={handleDeleteConfirm}
                title={deleteConfirm.type === 'question' ? '질문 삭제' : '답변 삭제'}
                message={
                    deleteConfirm.type === 'question'
                        ? '이 질문을 삭제하시겠습니까? 답변이 있는 경우 함께 삭제됩니다.'
                        : '이 답변을 삭제하시겠습니까?'
                }
            />
        </div>
    );
};

export default CourseQnAs;
