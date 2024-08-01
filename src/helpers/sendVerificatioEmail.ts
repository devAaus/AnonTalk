import { resend } from '@/lib/resend';
import VerificationEmail from '../../emails/VerificationEmail';
import { ApiResponse } from '@/types/ApiResponse';

export const sendVerificatioEmail = async (
    email: string,
    username: string,
    otp: string
): Promise<ApiResponse> => {

    try {
        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject: 'Verification Code',
            react: VerificationEmail({ username, otp: otp }),
        });

        return {
            success: true,
            message: "Verification email sent",
        };
    } catch (error) {
        console.error("Error sending verification email", error);

        return {
            success: false,
            message: "Failed to send verification email"
        };
    }

}