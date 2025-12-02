import type { Course } from '../../types';

interface CourseCurriculumProps {
    course: Course;
}

const CourseCurriculum = ({ course }: CourseCurriculumProps) => {
    const curriculumData = course?.curriculums;

    // null/undefined 체크 및 빈 배열 체크
    if (!curriculumData || curriculumData.length === 0) {
        return (
            <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full mb-4">
                    <svg className="w-8 h-8 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    커리큘럼 정보가 준비 중입니다
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    자세한 커리큘럼은 곧 업데이트될 예정입니다.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {curriculumData.map((curriculum, index) => (
                <div
                    key={curriculum.id || `chapter-${index}`}
                    className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:border-primary-200 dark:hover:border-primary-700 transition-colors bg-white dark:bg-slate-800/50"
                >
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-primary-600 dark:text-primary-400">
                            Chapter {curriculum.chapterNumber}
                        </span>
                        {curriculum.chapterTime != null && curriculum.chapterTime > 0 && (
                            <span className="text-sm text-slate-500 dark:text-slate-400">
                                총 {curriculum.chapterTime}시간
                            </span>
                        )}
                    </div>
                    <h3 className="font-medium text-slate-800 dark:text-slate-200 mb-2">
                        {curriculum.chapterName}
                    </h3>
                    {curriculum.chapterDetail && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 whitespace-pre-line">
                            {curriculum.chapterDetail}
                        </p>
                    )}
                </div>
            ))}
        </div>
    );
};

export default CourseCurriculum;
