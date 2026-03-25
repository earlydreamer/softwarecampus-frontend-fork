import { Link } from 'react-router-dom';

interface LegalDocumentPageProps {
    title: string;
    description: string;
    content: string;
}

const LegalDocumentPage = ({ title, description, content }: LegalDocumentPageProps) => {
    const [notice, ...sections] = content.split('\n\n');

    return (
        <div className="min-h-screen bg-slate-50 py-12 dark:bg-slate-900">
            <div className="mx-auto max-w-4xl px-4">
                <div className="mb-8">
                    <Link
                        to="/signup"
                        className="mb-4 inline-flex items-center text-sm font-medium text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    >
                        회원가입으로 돌아가기
                    </Link>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{title}</h1>
                    <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
                </div>

                <section className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-medium leading-6 text-amber-950">
                    {notice}
                </section>

                <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                    <div className="space-y-6 whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-slate-200">
                        {sections.map((section, index) => (
                            <section key={`${title}-${index}`}>{section}</section>
                        ))}
                    </div>
                </article>
            </div>
        </div>
    );
};

export default LegalDocumentPage;
