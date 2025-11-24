import { useState, useId } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { AlertCircle } from 'lucide-react';

const LoginPage = () => {
    const navigate = useNavigate();
    const login = useAuthStore(state => state.login);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const emailId = useId();
    const passwordId = useId();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const success = await login(email, password);
            if (success) {
                navigate('/');
            } else {
                setError('이메일 또는 비밀번호가 올바르지 않습니다.');
            }
        } catch (err) {
            setError('로그인 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 py-20">
            <div className="glass-panel p-8 rounded-2xl w-full max-w-md">
                <h1 className="text-3xl font-bold text-center mb-8 text-slate-900 dark:text-white">로그인</h1>

                {/* 샘플 계정 안내 */}
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">테스트 계정</p>
                    <div className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
                        <p>• 관리자: admin@test.com / test</p>
                        <p>• 사용자: user@test.com / test</p>
                        <p>• 교육기관: academy@test.com / user</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-400 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div>
                        <label htmlFor={emailId} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">이메일</label>
                        <input
                            type="email"
                            id={emailId}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                            placeholder="이메일 입력 (예: user@test.com)"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor={passwordId} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">비밀번호</label>
                        <input
                            type="password"
                            id={passwordId}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                            placeholder="비밀번호 입력"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full btn-primary py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? '로그인 중...' : '로그인'}
                    </button>
                </form>
                <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                    계정이 없으신가요? <Link to="/signup" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">회원가입</Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
