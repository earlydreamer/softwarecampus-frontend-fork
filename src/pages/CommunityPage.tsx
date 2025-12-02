import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import type { BoardCategory } from '../types';
import { BOARD_CATEGORY_LABELS } from '../types';
import { fetchBoardPosts } from '../services/communityService';
import { MessageSquare, ThumbsUp, Eye, PenSquare, Search, SlidersHorizontal, X } from 'lucide-react';

type SortType = 'latest' | 'popular' | 'views' | 'comments';
type SearchType = 'all' | 'title' | 'content' | 'title_content' | 'author' | 'comment';

const SEARCH_TYPE_LABELS: Record<SearchType, string> = {
    all: '전체',
    title: '제목',
    content: '내용',
    title_content: '제목+내용',
    author: '글쓴이',
    comment: '댓글'
};

const CommunityPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchInput, setSearchInput] = useState('');

    const allowedCategories: BoardCategory[] = ['NOTICE', 'QUESTION', 'COURSE_STORY', 'CODING_STORY'];

    const categoryParam = searchParams.get('category');
    const currentCategory: BoardCategory | undefined =
        categoryParam && allowedCategories.includes(categoryParam as BoardCategory)
            ? (categoryParam as BoardCategory)
            : undefined;

    const pageParam = searchParams.get('page');
    const parsedPage = pageParam ? parseInt(pageParam, 10) : 1;
    const currentPage = !isNaN(parsedPage) && parsedPage >= 1 ? parsedPage : 1;

    const searchKeyword = searchParams.get('search') || '';
    const searchType = (searchParams.get('searchType') as SearchType) || 'all';
    const sortType = (searchParams.get('sort') as SortType) || 'latest';

    // URL에서 검색어가 변경되면 input 동기화
    useEffect(() => {
        setSearchInput(searchKeyword);
    }, [searchKeyword]);

    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['boardPosts', currentCategory, currentPage, searchKeyword, searchType, sortType],
        queryFn: () => fetchBoardPosts(currentCategory, currentPage, 20, searchKeyword, sortType, searchType),
    });

    // 서버에서 이미 정렬/필터/페이징된 데이터 사용
    const posts = data?.posts || [];
    const totalCount = data?.total || 0;
    const totalPages = data?.totalPages || Math.ceil(totalCount / 20);
    const startIndex = (currentPage - 1) * 20;
    const endIndex = Math.min(startIndex + 20, totalCount);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const newParams = new URLSearchParams(searchParams);
        if (searchInput.trim()) {
            newParams.set('search', searchInput.trim());
        } else {
            newParams.delete('search');
        }
        newParams.set('page', '1');
        setSearchParams(newParams);
    };

    const handleClearSearch = () => {
        setSearchInput('');
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('search');
        newParams.set('page', '1');
        setSearchParams(newParams);
    };

    const handleSortChange = (newSortType: SortType) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('sort', newSortType);
        newParams.set('page', '1');
        setSearchParams(newParams);
    };

    const handleSearchTypeChange = (newSearchType: SearchType) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('searchType', newSearchType);
        newParams.set('page', '1');
        setSearchParams(newParams);
    };

    const handleCategoryChange = (category: BoardCategory | undefined) => {
        const newParams = new URLSearchParams(searchParams);
        if (category) {
            newParams.set('category', category);
        } else {
            newParams.delete('category');
        }
        newParams.set('page', '1');
        setSearchParams(newParams);
    };

    const handlePageChange = (page: number) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('page', page.toString());
        setSearchParams(newParams);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const diffHours = Math.floor(diff / (1000 * 60 * 60));
        const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (diffHours < 24) {
            return `${diffHours}시간 전`;
        } else if (diffDays < 7) {
            return `${diffDays}일 전`;
        } else {
            return date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
        }
    };

    const categories: (BoardCategory | undefined)[] = [undefined, 'NOTICE', 'QUESTION', 'COURSE_STORY', 'CODING_STORY'];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">커뮤니티</h1>
                        <p className="text-slate-600 dark:text-slate-400">
                            소프트웨어캠퍼스 수강생들과 소통하고 정보를 공유하세요.
                        </p>
                    </div>
                    <Link
                        to={`/community/write${currentCategory ? `?category=${currentCategory}` : ''}`}
                        className="btn-primary flex items-center gap-2"
                    >
                        <PenSquare className="w-4 h-4" />
                        글쓰기
                    </Link>
                </div>

                {/* 카테고리 탭 */}
                <div className="glass-panel rounded-2xl overflow-hidden mb-6">
                    <div className="flex overflow-x-auto">
                        {categories.map((category) => (
                            <button
                                key={category || 'all'}
                                onClick={() => handleCategoryChange(category)}
                                className={`flex-1 min-w-[100px] py-4 px-4 text-sm font-semibold transition-all relative whitespace-nowrap ${currentCategory === category
                                    ? 'text-primary-600 dark:text-primary-400 bg-white/80 dark:bg-slate-700/50'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/40 dark:hover:bg-slate-700/30'
                                    }`}
                            >
                                {category ? BOARD_CATEGORY_LABELS[category] : '전체'}
                                {currentCategory === category && (
                                    <div className="absolute bottom-0 left-0 w-full h-1 bg-primary-600 dark:bg-primary-500" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 필터 및 글 목록 통합 영역 */}
                <div className="glass-panel rounded-2xl overflow-hidden mb-6">
                    {/* 필터 영역 */}
                    <div className="p-5 border-b border-slate-200 dark:border-slate-700 bg-white/30 dark:bg-slate-800/30">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <div className="flex items-center gap-2">
                                <SlidersHorizontal className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">정렬</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => handleSortChange('latest')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${sortType === 'latest'
                                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                                        }`}
                                >
                                    최신순
                                </button>
                                <button
                                    onClick={() => handleSortChange('popular')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${sortType === 'popular'
                                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                                        }`}
                                >
                                    추천순
                                </button>
                                <button
                                    onClick={() => handleSortChange('views')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${sortType === 'views'
                                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                                        }`}
                                >
                                    조회순
                                </button>
                                <button
                                    onClick={() => handleSortChange('comments')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${sortType === 'comments'
                                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                                        }`}
                                >
                                    댓글순
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 글 목록 */}
                    <div className="bg-white/50 dark:bg-slate-800/50 min-h-[400px]">
                        <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-3 bg-slate-50/80 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-600 text-sm font-semibold text-slate-600 dark:text-slate-300">
                            <div className="col-span-1 text-center">번호</div>
                            <div className="col-span-1 text-center">카테고리</div>
                            <div className="col-span-5">제목</div>
                            <div className="col-span-2 text-center">작성자</div>
                            <div className="col-span-1 text-center">조회</div>
                            <div className="col-span-1 text-center">추천</div>
                            <div className="col-span-1 text-center">작성일</div>
                        </div>

                        {isLoading && (
                            <div className="py-20 text-center">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                                <p className="mt-2 text-slate-500 dark:text-slate-400">로딩 중...</p>
                            </div>
                        )}

                        {isError && (
                            <div className="py-20 text-center">
                                <p className="text-red-500 dark:text-red-400 mb-4">
                                    게시글을 불러오는데 실패했습니다.
                                </p>
                                <button
                                    onClick={() => refetch()}
                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                                >
                                    다시 시도
                                </button>
                            </div>
                        )}

                        {!isLoading && !isError && posts.length === 0 && (
                            <div className="py-20 text-center text-slate-500 dark:text-slate-400">
                                {searchKeyword ? '검색 결과가 없습니다.' : '등록된 게시글이 없습니다.'}
                            </div>
                        )}

                        {!isLoading && !isError && posts.map((post) => (
                            <div
                                key={post.id}
                                className="border-b border-slate-100 dark:border-slate-700 last:border-b-0 hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors"
                            >
                                <Link
                                    to={`/community/${post.id}`}
                                    className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-4 items-center"
                                >
                                    <div className="col-span-1 text-center text-sm text-slate-500">
                                        {post.id}
                                    </div>
                                    <div className="col-span-1 text-center">
                                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${post.category === 'NOTICE' ? 'bg-rose-100 text-rose-700' :
                                            post.category === 'QUESTION' ? 'bg-blue-100 text-blue-700' :
                                                'bg-emerald-100 text-emerald-700'
                                            }`}>
                                            {BOARD_CATEGORY_LABELS[post.category]}
                                        </span>
                                    </div>
                                    <div className="col-span-5">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-medium text-slate-900 dark:text-white hover:text-primary-600 truncate">
                                                {post.title}
                                            </h3>
                                            {(post.commentCount ?? 0) > 0 && (
                                                <span className="flex items-center gap-0.5 text-primary-600 text-xs font-medium bg-primary-50 px-1.5 py-0.5 rounded">
                                                    <MessageSquare className="w-3 h-3" />
                                                    {post.commentCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-span-2 text-center text-sm text-slate-600">
                                        {post.account.userName}
                                    </div>
                                    <div className="col-span-1 text-center text-sm text-slate-500">
                                        {post.hits}
                                    </div>
                                    <div className="col-span-1 text-center text-sm text-slate-500">
                                        {post.likeCount}
                                    </div>
                                    <div className="col-span-1 text-center text-xs text-slate-400">
                                        {formatDate(post.createdAt)}
                                    </div>
                                </Link>

                                {/* Mobile View */}
                                <Link to={`/community/${post.id}`} className="block md:hidden px-4 py-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${post.category === 'NOTICE' ? 'bg-rose-100 text-rose-700' :
                                            post.category === 'QUESTION' ? 'bg-blue-100 text-blue-700' :
                                                'bg-emerald-100 text-emerald-700'
                                            }`}>
                                            {BOARD_CATEGORY_LABELS[post.category]}
                                        </span>
                                        <span className="text-xs text-slate-400">{formatDate(post.createdAt)}</span>
                                    </div>
                                    <h3 className="font-medium text-slate-900 mb-2 line-clamp-1">
                                        {post.title}
                                    </h3>
                                    <div className="flex items-center justify-between text-sm text-slate-500">
                                        <span>{post.account.userName}</span>
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {post.hits}</span>
                                            <span className="flex items-center gap-1"><ThumbsUp className="w-3.5 h-3.5" /> {post.likeCount}</span>
                                            <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> {post.commentCount}</span>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 검색창 */}
                <div className="glass-panel rounded-2xl p-5 mb-8">
                    <form onSubmit={handleSearch}>
                        {/* 검색 기준 선택 */}
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">검색 기준:</span>
                            {(Object.keys(SEARCH_TYPE_LABELS) as SearchType[]).map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => handleSearchTypeChange(type)}
                                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${searchType === type
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                                        }`}
                                >
                                    {SEARCH_TYPE_LABELS[type]}
                                </button>
                            ))}
                        </div>

                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder={`${SEARCH_TYPE_LABELS[searchType]}에서 검색 후 엔터...`}
                                className="w-full pl-12 pr-24 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                {searchInput && (
                                    <button
                                        type="button"
                                        onClick={handleClearSearch}
                                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    className="px-4 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
                                >
                                    검색
                                </button>
                            </div>
                        </div>
                        {searchKeyword && (
                            <div className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                                <span className="font-semibold text-primary-600">{SEARCH_TYPE_LABELS[searchType]}</span>에서 '<span className="font-semibold text-primary-600">{searchKeyword}</span>' 검색: 총 <span className="font-semibold text-primary-600">{totalCount}개</span>
                            </div>
                        )}
                    </form>
                </div>

                {/* 페이징 */}
                {!isLoading && !isError && totalPages > 0 && (
                    <div className="flex flex-col items-center gap-4">
                        {/* 페이지 정보 */}
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                            전체 <span className="font-semibold text-primary-600">{totalCount}개</span> 중 {startIndex + 1}-{endIndex}
                        </div>

                        {/* 페이지 네비게이션 */}
                        <div className="flex justify-center gap-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                이전
                            </button>

                            {/* 페이지 번호들 - 최대 7개만 표시 */}
                            {(() => {
                                const pageNumbers = [];
                                const maxVisible = 7;
                                let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                                let endPage = Math.min(totalPages, startPage + maxVisible - 1);

                                if (endPage - startPage < maxVisible - 1) {
                                    startPage = Math.max(1, endPage - maxVisible + 1);
                                }

                                // 첫 페이지
                                if (startPage > 1) {
                                    pageNumbers.push(
                                        <button
                                            key={1}
                                            onClick={() => handlePageChange(1)}
                                            className="w-10 h-10 rounded-lg font-medium transition-all bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                                        >
                                            1
                                        </button>
                                    );
                                    if (startPage > 2) {
                                        pageNumbers.push(
                                            <span key="ellipsis1" className="px-2 text-slate-400">...</span>
                                        );
                                    }
                                }

                                // 중간 페이지들
                                for (let i = startPage; i <= endPage; i++) {
                                    pageNumbers.push(
                                        <button
                                            key={i}
                                            onClick={() => handlePageChange(i)}
                                            className={`w-10 h-10 rounded-lg font-medium transition-all ${currentPage === i
                                                ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                                                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                                                }`}
                                        >
                                            {i}
                                        </button>
                                    );
                                }

                                // 마지막 페이지
                                if (endPage < totalPages) {
                                    if (endPage < totalPages - 1) {
                                        pageNumbers.push(
                                            <span key="ellipsis2" className="px-2 text-slate-400">...</span>
                                        );
                                    }
                                    pageNumbers.push(
                                        <button
                                            key={totalPages}
                                            onClick={() => handlePageChange(totalPages)}
                                            className="w-10 h-10 rounded-lg font-medium transition-all bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                                        >
                                            {totalPages}
                                        </button>
                                    );
                                }

                                return pageNumbers;
                            })()}

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                다음
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommunityPage;
