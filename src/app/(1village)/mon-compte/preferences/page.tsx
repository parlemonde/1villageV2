import { PageContainer } from '@frontend/components/ui/PageContainer';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { notFound } from 'next/navigation';
import { getExtracted } from 'next-intl/server';

import { PreferencesForm } from './PreferencesForm';

export default async function PreferencesPage() {
    const user = await getCurrentUser();
    const t = await getExtracted('app.(1village).mon-compte.preferences');

    if (!user) {
        // Login redirection is handled by the parent layout
        return null;
    }

    // Only teachers can manage notification preferences
    if (user.role !== 'teacher') {
        notFound();
    }

    return (
        <PageContainer title={t('Préférences de notifications')}>
            <PreferencesForm
                adminPublicationSubscribed={user.adminPublicationSubscribed ?? true}
                commentActivitySubscribed={user.commentActivitySubscribed ?? true}
            />
        </PageContainer>
    );
}
