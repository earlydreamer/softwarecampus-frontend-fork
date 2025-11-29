import { useState } from 'react';
import type { AcademyQA } from '../../types';
import { MessageCircle, CheckCircle2, Eye, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import QnAForm from '../common/QnAForm';
import { QNA_PER_PAGE } from '../../constants';
import { sanitizeUrl } from '../../utils/security';

interface AcademyQnAsProps {
    qnas: AcademyQA[];
    totalCount: number;
    page: number;
    onPageChange: (page: number) => void;
    isLoading?: boolean;
    onQuestionSubmit: (title: string, content: string) => void;
    onSearch?: (keyword: string) => void;
}

const AcademyQnAs = ({ qnas, totalCount, page, onPageChange, isLoading, onQuestionSubmit, onSearch }: AcademyQnAsProps) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [expandedQnaId, setExpandedQnaId] = useState<number | null>(null);
    const [searchKeyword, setSearchKeyword] = useState('');

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
                    기관 Q&A <span className="text-primary-600">({totalCount})</span>
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
                    onSubmit={(title, content) => {
                        onQuestionSubmit(title, content);
                        setIsFormOpen(false);
                    }}
                    onCancel={() => setIsFormOpen(false)}
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
                                        e.preventDefault();
                                        toggleQna(qna.id);
                                    }
                                }}
                                className="p-6 cursor-pointer hover:bg-slate-50 transition-colors outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                            >
                                <div className="flex items-start gap-4">
                                    {/* TODO: 백엔드 미지원 필드 (writer) - 현재는 데이터가 없어 대체 UI 표시 */}
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                                        {qna.writer?.avatar ? (
                                            <img src={sanitizeUrl(qna.writer.avatar)} alt={qna.writer.userName} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-slate-400 font-bold text-sm">{qna.writer?.userName?.[0] || 'Q'}</span>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            {/* TODO: 백엔드 미지원 필드 (writer) */}
                                            <span className="font-medium text-slate-900">
                                                {qna.writer?.userName || '익명'}
                                            </span>
                                            <span className="text-sm text-slate-500">
                                                {new Date(qna.createdAt).toLocaleDateString()}
                                            </span>
                                            {qna.isAnswered ?? !!qna.answerText ? (
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
                                        <div className="prose prose-sm max-w-none text-slate-600" dangerouslySetInnerHTML={{ __html: qna.questionText }} />
                                    </div>

                                    {qna.answerText && (
                                        <div className="bg-primary-50/30 p-6 border-t border-slate-100">
                                            <div className="flex items-start gap-4">
                                                {/* TODO: 백엔드 미지원 필드 (answeredBy) - 현재는 데이터가 없어 대체 UI 표시 */}
                                                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden shrink-0 border-2 border-white shadow-sm">
                                                    {qna.answeredBy?.avatar ? (
                                                        <img src={sanitizeUrl(qna.answeredBy.avatar)} alt={qna.answeredBy.userName} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-primary-600 font-bold text-sm">{qna.answeredBy?.userName?.[0] || 'A'}</span>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        {/* TODO: 백엔드 미지원 필드 (answeredBy) */}
                                                        <span className="font-bold text-primary-700">{qna.answeredBy?.userName || '담당자'}</span>
                                                        <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-bold border border-primary-200">
                                                            답변
                                                        </span>
                                                    </div>
                                                    <div className="prose prose-sm max-w-none text-slate-800 bg-white p-4 rounded-xl border border-primary-100 shadow-sm" dangerouslySetInnerHTML={{ __html: qna.answerText }} />
                                                </div>
                                            </div>
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
        </div>
    );
};

export default AcademyQnAs;
