import { RequestNewPasswordForm } from './RequestNewPasswordForm';
import { ResetPasswordForm } from './ResetPasswordForm';

interface ServerPageProps {
    searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function ResetPasswordPage({ searchParams }: ServerPageProps) {
    const { error, token } = await searchParams;
    return token ? <ResetPasswordForm token={token} /> : <RequestNewPasswordForm error={error} />;
}
