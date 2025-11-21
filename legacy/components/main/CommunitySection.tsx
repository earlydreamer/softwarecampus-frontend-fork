import React from 'react';
import { Link } from 'react-router-dom';
import { CommunityPost } from '../../types';
import { ArrowRightIcon } from '../icons/Icons';
import Skeleton from '../ui/Skeleton';

interface CommunitySectionProps {
  posts: CommunityPost[];
  loading: boolean;
}

const PostCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow space-y-3">
    <Skeleton className="h-5 w-3/4" />
    <div className="flex justify-between items-center text-sm">
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-4 w-1/4" />
    </div>
  </div>
);

const boardColors: Record<string, string> = {
  공지사항: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  문의사항: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  진로이야기: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  코딩이야기: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
};

const CommunitySection: React.FC<CommunitySectionProps> = ({ posts, loading }) => {
  const isEmpty = !loading && posts.length === 0;

  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">커뮤니티 베스트</h2>
        <Link to="/community" className="flex items-center space-x-1 text-sm font-medium text-primary dark:text-primary-dark hover:underline">
          <span>더보기</span>
          <ArrowRightIcon className="w-4 h-4" />
        </Link>
      </div>
      
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-10 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">등록된 게시글이 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading
            ? Array.from({ length: 3 }).map((_, index) => <PostCardSkeleton key={`skeleton-${index}`} />)
            : posts.map((post) => (
                <Link
                  to={`/community/${post.id}`}
                  key={post.id}
                  className="block p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow transform hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${boardColors[post.board] ?? ''}`}>
                      {post.board}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{post.createdAt}</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 truncate">{post.title}</h3>
                  <div className="flex justify-between items-center mt-3 text-sm text-gray-500 dark:text-gray-400">
                    <span>{post.author}</span>
                    <span>추천 {post.recommendations}</span>
                  </div>
                </Link>
              ))}
        </div>
      )}
    </section>
  );
};

export default CommunitySection;
