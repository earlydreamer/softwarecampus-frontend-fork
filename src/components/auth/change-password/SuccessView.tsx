import { CheckCircle } from 'lucide-react';

const SuccessView = () => {
    return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">변경 완료!</h3>
            <p className="text-slate-600 dark:text-slate-400">
                비밀번호가 성공적으로 변경되었습니다.
            </p>
        </div>
    );
};

export default SuccessView;
