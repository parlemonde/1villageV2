import { ActivityProvider } from '@frontend/contexts/activityContext';

export default async function ActivitiesLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <ActivityProvider>{children}</ActivityProvider>;
}
