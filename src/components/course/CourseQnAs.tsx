import type { CourseQnA } from '../../types';
import { MessageCircle, CheckCircle2, Eye } from 'lucide-react';

interface CourseQnAsProps {
    qnas: CourseQnA[];
    isLoading?: boolean;
}

const CourseQnAs = ({ qnas, isLoading }: CourseQnAsProps) => {
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

    if (!qnas || qnas.length === 0) {
        return (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-slate-500">아직 등록된 질문이 없습니다.</p>
                <button className="mt-4 px-6 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors">
                    첫 질문 남기기
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">
                    과정 Q&A <span className="text-primary-600">({qnas.length})</span>
                </h3>
                <button className="px-6 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors">
                    질문하기
                </button>
            </div>

            <div className="space-y-4">
                {qnas.map(qna => (
                    <div key={qna.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-primary-200 transition-colors">
                        {/* 질문 */}
                        <div className="p-6">
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
                                        {qna.isAnswered && (
                                            <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                                                <CheckCircle2 className="w-3 h-3" />
                                                답변완료
                                            </span>
                                        )}
                                    </div>
                                    <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                                        <MessageCircle className="w-5 h-5 text-primary-600" />
                                        {qna.title}
                                    </h4>
                                    <p className="text-slate-600 leading-relaxed">{qna.content}</p>
                                    <div className="mt-3 flex items-center gap-4 text-sm text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <Eye className="w-4 h-4" />
                                            조회 {qna.viewCount}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 답변 */}
                        {qna.answer && (
                            <div className="bg-slate-50 p-6 border-t border-slate-200">
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
                                        <p className="text-slate-700 leading-relaxed">{qna.answer.content}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CourseQnAs;
