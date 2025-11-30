import type { Step } from './useChangePassword';

interface StepIndicatorProps {
    currentStep: Step;
}

const StepIndicator = ({ currentStep }: StepIndicatorProps) => {
    return (
        <div className="flex justify-center mb-6">
            <div className="flex items-center">
                <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        currentStep >= 1 ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-500'
                    }`}
                    aria-label="단계 1: 본인 확인"
                    aria-current={currentStep === 1 ? 'step' : undefined}
                >
                    1
                </div>
                <div className={`w-12 h-1 ${currentStep >= 2 ? 'bg-primary-600' : 'bg-slate-200'}`} />
                <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        currentStep >= 2 ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-500'
                    }`}
                    aria-label="단계 2: 이메일 인증"
                    aria-current={currentStep === 2 ? 'step' : undefined}
                >
                    2
                </div>
                <div className={`w-12 h-1 ${currentStep >= 3 ? 'bg-primary-600' : 'bg-slate-200'}`} />
                <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        currentStep >= 3 ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-500'
                    }`}
                    aria-label="단계 3: 새 비밀번호 설정"
                    aria-current={currentStep === 3 ? 'step' : undefined}
                >
                    3
                </div>
            </div>
        </div>
    );
};

export default StepIndicator;
