import { useState } from 'react';
import type { AcademyQnA } from '../../types';
import { MessageCircle, CheckCircle2, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import AcademyQnAForm from './AcademyQnAForm';

interface AcademyQnAsProps {
    qnas: AcademyQnA[];
    isLoading?: boolean;
    onQuestionSubmit: (title: string, content: string) => void;
}

const AcademyQnAs = ({ qnas, isLoading, onQuestionSubmit }: AcademyQnAsProps) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [expandedQnaId, setExpandedQnaId] = useState<number | null>(null);

    const toggleQna = (id: number) => {
        setExpandedQnaId(expandedQnaId === id ? null : id);
    };

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
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">
                    기관 Q&A <span className="text-primary-600">({qnas.length})</span>
                </h3>
                {!isFormOpen && (
                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="px-6 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                    >
                        질문하기
                    </button>
                )}
            </div>

            {isFormOpen && (
                <AcademyQnAForm
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
                        <p className="text-slate-500">아직 등록된 질문이 없습니다.</p>
                        {!isFormOpen && (
                            <button
                                onClick={() => setIsFormOpen(true)}
                                className="mt-4 px-6 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                            >
                                첫 질문 남기기
                            </button>
                        )}
                    </div>
                ) : (
                    qnas.map(qna => (
                        <div key={qna.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-primary-200 transition-colors">
                            {/* 질문 헤더 (클릭 시 확장) */}
                            <div
                                onClick={() => toggleQna(qna.id)}
                                className="p-6 cursor-pointer hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                                        {qna.author.avatar ? (
                                            <img src={qna.author.avatar} alt={qna.author.userName} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-slate-400 font-bold text-sm">{qna.author.userName[0]}</span>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="font-medium text-slate-900">{qna.author.userName}</span>
                                            <span className="text-sm text-slate-500">
                                                {new Date(qna.createdAt).toLocaleDateString()}
                                            </span>
                                            {qna.isAnswered ? (
                                                <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    답변완료
                                                </span>
                                            ) : (
                                                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                                                    답변대기
                                                </span>
                                            )}
                                        </div>
                                        <h4 className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
                                            <MessageCircle className="w-5 h-5 text-primary-600" />
                                            {qna.title}
                                        </h4>
                                        <div className="flex items-center justify-between mt-2">
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
                                <div className="border-t border-slate-100">
                                    <div className="p-6 bg-slate-50/50">
                                        <div className="prose prose-sm max-w-none text-slate-600" dangerouslySetInnerHTML={{ __html: qna.content }} />
                                    </div>

                                    {qna.answer && (
                                        <div className="bg-primary-50/30 p-6 border-t border-slate-100">
                                            <div className="flex items-start gap-4">
                                                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden shrink-0">
                                                    {qna.answer.answeredBy.avatar ? (
                                                        <img src={qna.answer.answeredBy.avatar} alt={qna.answer.answeredBy.userName} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-primary-600 font-bold text-sm">{qna.answer.answeredBy.userName[0]}</span>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="font-medium text-primary-600">{qna.answer.answeredBy.userName}</span>
                                                        <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-medium">
                                                            담당자
                                                        </span>
                                                        <span className="text-sm text-slate-500">
                                                            {new Date(qna.answer.answeredAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <div className="prose prose-sm max-w-none text-slate-700" dangerouslySetInnerHTML={{ __html: qna.answer.content }} />
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
        </div>
    );
};

export default AcademyQnAs;
