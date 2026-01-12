import { Breadcrumbs } from '@frontend/components/ui/Breadcrumbs/Breadcrumbs';
import { Button } from '@frontend/components/ui/Button';
import { PageContainer } from '@frontend/components/ui/PageContainer/PageContainer';
import { Title } from '@frontend/components/ui/Title';
import { ChevronLeftIcon } from '@radix-ui/react-icons';
import { db } from '@server/database';
import { languages } from '@server/database/schemas/languages';
import { getGroupedMessages } from '@server/i18n/get-grouped-messages';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';

import { TranslationEditor } from './TranslationEditor';
import styles from './page.module.css';

interface EditTranslationPageProps {
    params: Promise<{
        languageCode: string;
    }>;
}

export default async function EditTranslationPage({ params }: EditTranslationPageProps) {
    const { languageCode } = await params;
    const languageData = await db.select().from(languages).where(eq(languages.code, languageCode)).limit(1);
    if (languageData.length === 0) {
        notFound();
    }

    const language = languageData[0];
    const { messages, progress } = await getGroupedMessages(language.code);

    return (
        <PageContainer>
            <Breadcrumbs
                breadcrumbs={[
                    { label: 'Gérer', href: '/admin/manage' },
                    { label: 'Traductions', href: '/admin/manage/translations' },
                    { label: `${language.label}` },
                ]}
            />
            <div className={styles.headerContainer}>
                <Title className={styles.title}>
                    Modifier les traductions - {language.label}
                    <span className={styles.progressBadge}>{progress}% complété</span>
                </Title>
            </div>
            <TranslationEditor language={language} messages={messages} />
            <Button
                as="a"
                color="primary"
                variant="outlined"
                label="Retour"
                href="/admin/manage/translations"
                marginTop="lg"
                leftIcon={<ChevronLeftIcon width={18} height={18} />}
            />
        </PageContainer>
    );
}
