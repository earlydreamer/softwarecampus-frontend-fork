import { Camera, Edit, Mail, Phone, Shield, Building, Briefcase, MapPin, Trash2 } from 'lucide-react';
import { getAccountTypeLabel, getApprovalStatusLabel, getApprovalStatusColor } from '../data';
import type { Account, MyStats } from '../../../types';

interface SidebarProps {
    user: Account;
    onEditClick: () => void;
    onDeleteClick: () => void;
    stats: MyStats;
}

const Sidebar = ({ user, onEditClick, onDeleteClick, stats }: SidebarProps) => {
    return (
        <div className="lg:col-span-1 space-y-6">
            {/* 프로필 정보 */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="relative group mb-4">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg overflow-hidden">
                            {user.profileImage ? (
                                <img src={user.profileImage} alt={user.userName} className="w-full h-full object-cover" />
                            ) : (
                                user.userName.charAt(0).toUpperCase()
                            )}
                        </div>
                        <button 
                            onClick={onEditClick}
                            className="absolute bottom-0 right-0 p-2 bg-white dark:bg-slate-700 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Camera className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                        </button>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{user.userName}</h2>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${user.accountType === 'ADMIN' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        user.accountType === 'ACADEMY' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                            'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                        {getAccountTypeLabel(user.accountType)}
                    </span>
                    <button 
                        onClick={onEditClick}
                        className="w-full btn-secondary flex items-center justify-center gap-2"
                    >
                        <Edit className="w-4 h-4" />
                        프로필 수정
                    </button>
                </div>

                <div className="space-y-3 border-t border-slate-200 dark:border-slate-700 pt-6">
                    <div className="flex items-center gap-3 text-sm">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-600 dark:text-slate-400 truncate">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-600 dark:text-slate-400">{user.phoneNumber}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                        <Shield className="w-4 h-4 text-slate-400" />
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getApprovalStatusColor(user.approvalStatus)}`}>
                            {getApprovalStatusLabel(user.approvalStatus)}
                        </span>
                    </div>
                    {user.affiliation && (
                        <div className="flex items-center gap-3 text-sm">
                            <Building className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-600 dark:text-slate-400 truncate">{user.affiliation}</span>
                        </div>
                    )}
                    {user.position && (
                        <div className="flex items-center gap-3 text-sm">
                            <Briefcase className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-600 dark:text-slate-400">{user.position}</span>
                        </div>
                    )}
                    {user.address && (
                        <div className="flex items-center gap-3 text-sm">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-600 dark:text-slate-400 text-xs">{user.address}</span>
                        </div>
                    )}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <button
                        onClick={onDeleteClick}
                        className="w-full flex items-center justify-center gap-2 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 py-2 rounded-lg transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                        회원 탈퇴
                    </button>
                </div>
            </div>

            {/* 활동 통계 요약 */}
            <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 shadow-lg text-white">
                <h3 className="text-sm font-semibold mb-4 opacity-90">활동 요약</h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm opacity-90">작성한 글</span>
                        <span className="text-2xl font-bold">{stats.totalPosts}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm opacity-90">총 댓글</span>
                        <span className="text-2xl font-bold">{stats.totalComments}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm opacity-90">찜한 과정</span>
                        <span className="text-2xl font-bold">{stats.totalBookmarks}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm opacity-90">총 조회수</span>
                        <span className="text-2xl font-bold">{stats.totalViews}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
