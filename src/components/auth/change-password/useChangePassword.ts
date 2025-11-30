import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { verifyCurrentPassword, sendPasswordChangeCode, changePassword } from '../../../services/authService';
import { useAuthStore } from '../../../store/authStore';
import { getPasswordStrengthChecks, type PasswordStrengthChecks } from '../../../utils/validation';

export type Step = 1 | 2 | 3;

export interface Step1FormData {
    currentPassword: string;
}

export interface Step3FormData {
    newPassword: string;
    confirmPassword: string;
}

export const useChangePassword = (onClose: () => void) => {
    // 상태 관리
    const [step, setStep] = useState<Step>(1);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [timer, setTimer] = useState(180); // 3분
    const [verificationCode, setVerificationCode] = useState('');
    
    const { user } = useAuthStore();

    // Step 1: 현재 비밀번호 폼
    const step1Form = useForm<Step1FormData>({
        mode: 'onChange',
        defaultValues: { currentPassword: '' }
    });

    // Step 3: 새 비밀번호 폼
    const step3Form = useForm<Step3FormData>({
        mode: 'onChange',
        defaultValues: { newPassword: '', confirmPassword: '' }
    });

    const newPassword = step3Form.watch('newPassword');

    // 타이머 로직
    useEffect(() => {
        if (step === 2 && timer > 0) {
            const interval = setInterval(() => setTimer(t => t - 1), 1000);
            return () => clearInterval(interval);
        }
    }, [step, timer]);

    // 모달 닫기 시 상태 초기화
    const handleClose = useCallback(() => {
        setStep(1);
        setError(null);
        setVerificationCode('');
        setTimer(180);
        setIsSuccess(false);
        step1Form.reset();
        step3Form.reset();
        onClose();
    }, [onClose, step1Form, step3Form]);

    // Step 1: 현재 비밀번호 확인
    const handleVerifyPassword = useCallback(async (data: Step1FormData) => {
        setIsLoading(true);
        setError(null);
        try {
            await verifyCurrentPassword(data.currentPassword);
            // 성공 시 즉시 이메일 인증 코드 발송
            if (user?.email) {
                await sendPasswordChangeCode(user.email);
                setTimer(180);
                setStep(2);
            }
        } catch (err: unknown) {
            const axiosError = err as { response?: { data?: { detail?: string } } };
            const errorMsg = axiosError.response?.data?.detail || '비밀번호 확인에 실패했습니다.';
            setError(errorMsg);
        } finally {
            setIsLoading(false);
        }
    }, [user?.email]);

    // Step 2: 인증 코드 재발송
    const handleResendCode = useCallback(async () => {
        if (!user?.email) return;
        setIsLoading(true);
        setError(null);
        try {
            await sendPasswordChangeCode(user.email);
            setTimer(180);
        } catch (err: unknown) {
            const axiosError = err as { response?: { data?: { detail?: string } } };
            setError(axiosError.response?.data?.detail || '재발송에 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    }, [user?.email]);

    // Step 2 → Step 3 진행
    const handleVerifyCode = useCallback(() => {
        if (verificationCode.length === 6) {
            setError(null);
            setStep(3);
        }
    }, [verificationCode]);

    // Step 3: 최종 비밀번호 변경
    const handleChangePassword = useCallback(async (data: Step3FormData) => {
        if (data.newPassword !== data.confirmPassword) {
            setError('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            await changePassword(verificationCode, data.newPassword);
            setIsSuccess(true);
            setTimeout(() => {
                handleClose();
            }, 2000);
        } catch (err: unknown) {
            const axiosError = err as { response?: { data?: { detail?: string } } };
            const errorMsg = axiosError.response?.data?.detail || '비밀번호 변경에 실패했습니다.';
            if (errorMsg.includes('만료')) {
                setStep(2);
                setTimer(0);
            }
            setError(errorMsg);
        } finally {
            setIsLoading(false);
        }
    }, [verificationCode, handleClose]);

    // 비밀번호 강도 체크 (유틸리티 함수 사용)
    const passwordChecks: PasswordStrengthChecks = getPasswordStrengthChecks(newPassword || '');

    return {
        // 상태
        step,
        isSuccess,
        isLoading,
        error,
        timer,
        verificationCode,
        user,
        newPassword,
        passwordChecks,
        
        // 폼
        step1Form,
        step3Form,
        
        // 핸들러
        handleClose,
        handleVerifyPassword,
        handleResendCode,
        handleVerifyCode,
        handleChangePassword,
        setVerificationCode,
    };
};
