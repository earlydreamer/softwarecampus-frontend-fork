import Modal from '../ui/Modal';
import {
    useChangePassword,
    StepIndicator,
    StepVerifyPassword,
    StepEmailVerification,
    StepNewPassword,
    SuccessView,
} from './change-password';

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ChangePasswordModal = ({ isOpen, onClose }: ChangePasswordModalProps) => {
    const {
        step,
        isSuccess,
        isLoading,
        error,
        timer,
        verificationCode,
        user,
        newPassword,
        passwordChecks,
        step1Form,
        step3Form,
        handleClose,
        handleVerifyPassword,
        handleResendCode,
        handleVerifyCode,
        handleChangePassword,
        setVerificationCode,
    } = useChangePassword(onClose);

    // 성공 화면
    if (isSuccess) {
        return (
            <Modal isOpen={isOpen} onClose={handleClose} title="비밀번호 변경">
                <SuccessView />
            </Modal>
        );
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="비밀번호 변경">
            <StepIndicator currentStep={step} />

            {step === 1 && (
                <StepVerifyPassword
                    form={step1Form}
                    isLoading={isLoading}
                    error={error}
                    onSubmit={handleVerifyPassword}
                    onClose={handleClose}
                />
            )}

            {step === 2 && (
                <StepEmailVerification
                    email={user?.email || ''}
                    verificationCode={verificationCode}
                    timer={timer}
                    isLoading={isLoading}
                    error={error}
                    onCodeChange={setVerificationCode}
                    onResend={handleResendCode}
                    onVerify={handleVerifyCode}
                    onClose={handleClose}
                />
            )}

            {step === 3 && (
                <StepNewPassword
                    form={step3Form}
                    newPassword={newPassword}
                    passwordChecks={passwordChecks}
                    isLoading={isLoading}
                    error={error}
                    onSubmit={handleChangePassword}
                    onClose={handleClose}
                />
            )}
        </Modal>
    );
};

export default ChangePasswordModal;
