import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Title } from '@frontend/components/ui/Title';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { notFound } from 'next/navigation';

import { PreferencesForm } from './PreferencesForm';

export default async function PreferencesPage() {
    const user = await getCurrentUser();

    if (!user) {
        // Login redirection is handled by the parent layout
        return null;
    }

    // Only teachers can manage notification preferences
    if (user.role !== 'teacher') {
        notFound();
    }

    return (
        <PageContainer title="Préférences de notifications">
            <Title marginY="md" variant="h2">
                Préférences de notifications
            </Title>
            <p style={{ marginBottom: '24px', color: 'var(--font-detail-color)' }}>
                Choisissez les notifications par email que vous souhaitez recevoir.
            </p>
            <PreferencesForm
                adminPublicationSubscribed={user.adminPublicationSubscribed ?? true}
                commentActivitySubscribed={user.commentActivitySubscribed ?? true}
                userId={user.id}
            />
        </PageContainer>
    );
}
