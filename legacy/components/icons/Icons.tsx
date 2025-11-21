
import React from 'react';

type IconProps = {
  className?: string;
  ariaLabel?: string;
};

export const MenuIcon: React.FC<IconProps> = ({ className, ariaLabel = '메뉴' }) => (
  <svg 
    className={className} 
    stroke="currentColor" 
    fill="none" 
    viewBox="0 0 24 24"
    role="img"
    aria-label={ariaLabel}
  >
    {ariaLabel && <title>{ariaLabel}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
  </svg>
);

export const XIcon: React.FC<IconProps> = ({ className, ariaLabel = '닫기' }) => (
  <svg 
    className={className} 
    stroke="currentColor" 
    fill="none" 
    viewBox="0 0 24 24"
    role="img"
    aria-label={ariaLabel}
  >
    {ariaLabel && <title>{ariaLabel}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
  </svg>
);

export const SunIcon: React.FC<IconProps> = ({ className, ariaLabel = '라이트 모드' }) => (
  <svg 
    className={className} 
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor"
    role="img"
    aria-label={ariaLabel}
  >
    {ariaLabel && <title>{ariaLabel}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

export const MoonIcon: React.FC<IconProps> = ({ className, ariaLabel = '다크 모드' }) => (
  <svg 
    className={className} 
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor"
    role="img"
    aria-label={ariaLabel}
  >
    {ariaLabel && <title>{ariaLabel}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

export const UserCircleIcon: React.FC<IconProps> = ({ className, ariaLabel = '사용자' }) => (
  <svg 
    className={className} 
    fill="currentColor" 
    viewBox="0 0 20 20"
    role="img"
    aria-label={ariaLabel}
  >
    {ariaLabel && <title>{ariaLabel}</title>}
    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
  </svg>
);

export const ChevronLeftIcon: React.FC<IconProps> = ({ className, ariaLabel = '이전' }) => (
  <svg 
    className={className} 
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor"
    role="img"
    aria-label={ariaLabel}
  >
    {ariaLabel && <title>{ariaLabel}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
  </svg>
);

export const ChevronRightIcon: React.FC<IconProps> = ({ className, ariaLabel = '다음' }) => (
  <svg 
    className={className} 
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor"
    role="img"
    aria-label={ariaLabel}
  >
    {ariaLabel && <title>{ariaLabel}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
  </svg>
);

export const StarIcon: React.FC<IconProps> = ({ className, ariaLabel = '별점' }) => (
  <svg 
    className={className} 
    fill="currentColor" 
    viewBox="0 0 20 20"
    role="img"
    aria-label={ariaLabel}
  >
    {ariaLabel && <title>{ariaLabel}</title>}
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

export const ChatAltIcon: React.FC<IconProps> = ({ className, ariaLabel = '댓글' }) => (
  <svg 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
    role="img"
    aria-label={ariaLabel}
  >
    {ariaLabel && <title>{ariaLabel}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

export const ArrowRightIcon: React.FC<IconProps> = ({ className, ariaLabel = '화살표 오른쪽' }) => (
  <svg 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
    role="img"
    aria-label={ariaLabel}
  >
    {ariaLabel && <title>{ariaLabel}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

export const CalendarIcon: React.FC<IconProps> = ({ className, ariaLabel = '일정' }) => (
  <svg 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
    role="img"
    aria-label={ariaLabel}
  >
    {ariaLabel && <title>{ariaLabel}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

export const DesktopIcon: React.FC<IconProps> = ({ className, ariaLabel = '컴퓨터' }) => (
  <svg 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
    role="img"
    aria-label={ariaLabel}
  >
    {ariaLabel && <title>{ariaLabel}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

export const UsersIcon: React.FC<IconProps> = ({ className, ariaLabel = '사용자들' }) => (
  <svg 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
    role="img"
    aria-label={ariaLabel}
  >
    {ariaLabel && <title>{ariaLabel}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.282-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.282.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

export const Eye: React.FC<IconProps> = ({ className, ariaLabel = '조회수' }) => (
  <svg 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
    role="img"
    aria-label={ariaLabel}
  >
    {ariaLabel && <title>{ariaLabel}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

export const MessageSquare: React.FC<IconProps> = ({ className, ariaLabel = '댓글' }) => (
  <svg 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
    role="img"
    aria-label={ariaLabel}
  >
    {ariaLabel && <title>{ariaLabel}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
  </svg>
);

export const ThumbsUp: React.FC<IconProps> = ({ className, ariaLabel = '추천' }) => (
  <svg 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
    role="img"
    aria-label={ariaLabel}
  >
    {ariaLabel && <title>{ariaLabel}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
  </svg>
);

export const Paperclip: React.FC<IconProps> = ({ className, ariaLabel = '첨부파일' }) => (
  <svg 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
    role="img"
    aria-label={ariaLabel}
  >
    {ariaLabel && <title>{ariaLabel}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
  </svg>
);

export const Send: React.FC<IconProps> = ({ className, ariaLabel = '전송' }) => (
  <svg 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
    role="img"
    aria-label={ariaLabel}
  >
    {ariaLabel && <title>{ariaLabel}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

export const Pencil: React.FC<IconProps> = ({ className, ariaLabel = '편집' }) => (
  <svg 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
    role="img"
    aria-label={ariaLabel}
  >
    {ariaLabel && <title>{ariaLabel}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);

export const Trash: React.FC<IconProps> = ({ className, ariaLabel = '삭제' }) => (
  <svg 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
    role="img"
    aria-label={ariaLabel}
  >
    {ariaLabel && <title>{ariaLabel}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

export const ChevronDown: React.FC<IconProps> = ({ className, ariaLabel = '펼치기' }) => (
  <svg 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
    role="img"
    aria-label={ariaLabel}
  >
    {ariaLabel && <title>{ariaLabel}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

export const ChevronUp: React.FC<IconProps> = ({ className, ariaLabel = '접기' }) => (
  <svg 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
    role="img"
    aria-label={ariaLabel}
  >
    {ariaLabel && <title>{ariaLabel}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
  </svg>
);

export const Search: React.FC<IconProps> = ({ className, ariaLabel = '검색' }) => (
  <svg 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
    role="img"
    aria-label={ariaLabel}
  >
    {ariaLabel && <title>{ariaLabel}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

export const Building2: React.FC<IconProps> = ({ className, ariaLabel = '건물' }) => (
  <svg 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
    role="img"
    aria-label={ariaLabel}
  >
    {ariaLabel && <title>{ariaLabel}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

export const MapPin: React.FC<IconProps> = ({ className, ariaLabel = '위치' }) => (
  <svg 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
    role="img"
    aria-label={ariaLabel}
  >
    {ariaLabel && <title>{ariaLabel}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export const Phone: React.FC<IconProps> = ({ className, ariaLabel = '전화' }) => (
  <svg 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
    role="img"
    aria-label={ariaLabel}
  >
    {ariaLabel && <title>{ariaLabel}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

export const Mail: React.FC<IconProps> = ({ className, ariaLabel = '이메일' }) => (
  <svg 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
    role="img"
    aria-label={ariaLabel}
  >
    {ariaLabel && <title>{ariaLabel}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

export const ExternalLink: React.FC<IconProps> = ({ className, ariaLabel = '외부 링크' }) => (
  <svg 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
    role="img"
    aria-label={ariaLabel}
  >
    {ariaLabel && <title>{ariaLabel}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);

export const EyeOff: React.FC<IconProps> = ({ className, ariaLabel = '숨김' }) => (
  <svg 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
    role="img"
    aria-label={ariaLabel}
  >
    {ariaLabel && <title>{ariaLabel}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

export const AlertCircle: React.FC<IconProps> = ({ className, ariaLabel = '경고' }) => (
  <svg 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
    role="img"
    aria-label={ariaLabel}
  >
    {ariaLabel && <title>{ariaLabel}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const CheckCircle: React.FC<IconProps> = ({ className, ariaLabel = '확인' }) => (
  <svg 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
    role="img"
    aria-label={ariaLabel}
  >
    {ariaLabel && <title>{ariaLabel}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// 마이페이지용 아이콘
export const UserIcon: React.FC<IconProps> = ({ className, ariaLabel = '사용자' }) => (
  <svg 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
    role="img"
    aria-label={ariaLabel}
  >
    {ariaLabel && <title>{ariaLabel}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

export const BookOpenIcon: React.FC<IconProps> = ({ className, ariaLabel = '책' }) => (
  <svg 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
    role="img"
    aria-label={ariaLabel}
  >
    {ariaLabel && <title>{ariaLabel}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

export const FileTextIcon: React.FC<IconProps> = ({ className, ariaLabel = '파일' }) => (
  <svg 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
    role="img"
    aria-label={ariaLabel}
  >
    {ariaLabel && <title>{ariaLabel}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

export const MessageSquareIcon: React.FC<IconProps> = ({ className, ariaLabel = '메시지' }) => (
  <svg 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
    role="img"
    aria-label={ariaLabel}
  >
    {ariaLabel && <title>{ariaLabel}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

export const BookmarkIcon: React.FC<IconProps> = ({ className, ariaLabel = '북마크' }) => (
  <svg 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
    role="img"
    aria-label={ariaLabel}
  >
    {ariaLabel && <title>{ariaLabel}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
  </svg>
);

export const EditIcon: React.FC<IconProps> = ({ className, ariaLabel = '편집' }) => (
  <svg 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
    role="img"
    aria-label={ariaLabel}
  >
    {ariaLabel && <title>{ariaLabel}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

export const CameraIcon: React.FC<IconProps> = ({ className, ariaLabel = '카메라' }) => (
  <svg 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
    role="img"
    aria-label={ariaLabel}
  >
    {ariaLabel && <title>{ariaLabel}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export const UploadIcon: React.FC<IconProps> = ({ className, ariaLabel = '업로드' }) => (
  <svg 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
    role="img"
    aria-label={ariaLabel}
  >
    {ariaLabel && <title>{ariaLabel}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

export const LayoutDashboard: React.FC<IconProps> = ({ className, ariaLabel = '대시보드' }) => (
  <svg 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
    role="img"
    aria-label={ariaLabel}
  >
    {ariaLabel && <title>{ariaLabel}</title>}
    <rect x="3" y="3" width="7" height="7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
    <rect x="14" y="3" width="7" height="7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
    <rect x="14" y="14" width="7" height="7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
    <rect x="3" y="14" width="7" height="7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
  </svg>
);

export const ImageIcon: React.FC<IconProps> = ({ className, ariaLabel = '이미지' }) => (
  <svg 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
    role="img"
    aria-label={ariaLabel}
  >
    {ariaLabel && <title>{ariaLabel}</title>}
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
    <circle cx="8.5" cy="8.5" r="1.5" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
    <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
  </svg>
);

export const PlusIcon: React.FC<IconProps> = ({ className, ariaLabel = '추가' }) => (
  <svg 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
    role="img"
    aria-label={ariaLabel}
  >
    {ariaLabel && <title>{ariaLabel}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

export const Trash2: React.FC<IconProps> = ({ className, ariaLabel = '삭제' }) => (
  <svg 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
    role="img"
    aria-label={ariaLabel}
  >
    {ariaLabel && <title>{ariaLabel}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6" />
  </svg>
);

export const FilterIcon: React.FC<IconProps> = ({ className, ariaLabel = '필터' }) => (
  <svg 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
    role="img"
    aria-label={ariaLabel}
  >
    {ariaLabel && <title>{ariaLabel}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

export const XCircle: React.FC<IconProps> = ({ className, ariaLabel = '취소' }) => (
  <svg 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
    role="img"
    aria-label={ariaLabel}
  >
    {ariaLabel && <title>{ariaLabel}</title>}
    <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 9l-6 6M9 9l6 6" />
  </svg>
);

