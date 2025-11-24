import { useParams } from 'react-router-dom';

const CommunityEditPage = () => {
    const { postId } = useParams();
    return (
        <div className="container mx-auto px-4 py-20">
            <div className="glass-panel p-8 rounded-2xl max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">글 수정: {postId}</h1>
                <p className="text-slate-600">게시글을 수정하세요.</p>
            </div>
        </div>
    );
};

export default CommunityEditPage;
