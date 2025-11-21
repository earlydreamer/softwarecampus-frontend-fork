import { Link } from 'react-router-dom';

interface PlaceholderPageProps {
    title: string;
    description: string;
    ctaLabel?: string;
    ctaHref?: string;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
    title,
    description,
    ctaLabel = '메인으로 가기',
    ctaHref = '/'
}) => {
    return (
        <div className="min-h-[60vh] flex items-center justify-center bg-slate-50">
            <div className="text-center p-8 glass-panel rounded-2xl max-w-lg mx-4">
                <h1 className="text-3xl font-bold text-slate-900 mb-4">{title}</h1>
                <p className="text-slate-600 mb-8">{description}</p>
                <Link
                    to={ctaHref}
                    className="btn-primary inline-block"
                >
                    {ctaLabel}
                </Link>
            </div>
        </div>
    );
};

export default PlaceholderPage;
