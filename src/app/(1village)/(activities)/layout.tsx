import { ActivityProvider } from '@frontend/contexts/activityContext';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { redirect } from 'next/navigation';

export default async function ActivitiesLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const user = await getCurrentUser();
    if (user?.role === 'parent') {
        redirect('/');
    }
    return <ActivityProvider>{children}</ActivityProvider>;
}
