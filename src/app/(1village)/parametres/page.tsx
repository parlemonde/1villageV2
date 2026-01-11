import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Title } from '@frontend/components/ui/Title';
import { db } from '@server/database';
import { languages } from '@server/database/schemas/languages';
import { getLocale } from 'next-intl/server';

import { LanguageSelector } from './LanguageSelector';

export default async function SettingsPage() {
    const currentLocale = await getLocale();
    const availableLanguages = await db.query.languages.findMany({
        orderBy: languages.createdAt,
    });

    return (
        <PageContainer title="Paramètres">
            <section style={{ marginBottom: '32px' }}>
                <Title marginY="sm" variant="h3">
                    Langue de l&apos;interface
                </Title>
                <p style={{ marginBottom: '16px', color: 'var(--font-detail-color)' }}>
                    Choisissez la langue dans laquelle vous souhaitez afficher l&apos;application.
                </p>
                <LanguageSelector currentLocale={currentLocale} languages={availableLanguages} />
            </section>
        </PageContainer>
    );
}
