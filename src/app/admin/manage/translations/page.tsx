import { Breadcrumbs } from '@frontend/components/ui/Breadcrumbs/Breadcrumbs';
import { Button } from '@frontend/components/ui/Button';
import { PageContainer } from '@frontend/components/ui/PageContainer/PageContainer';
import { Title } from '@frontend/components/ui/Title';
import { ChevronLeftIcon } from '@radix-ui/react-icons';
import { db } from '@server/database';
import { languages } from '@server/database/schemas/languages';
import { getAllProgress } from '@server/i18n/get-progress';
import { asc } from 'drizzle-orm';

import { AddLanguageButton } from './AddLanguageButton';
import { LanguagesTable } from './LanguagesTable';
import styles from './page.module.css';

export default async function AdminManageTranslationsPage() {
    const availableLanguages = await db.select().from(languages).orderBy(asc(languages.createdAt));
    const progressPerLanguages = await getAllProgress(availableLanguages.map((l) => l.code));

    return (
        <PageContainer>
            <Breadcrumbs breadcrumbs={[{ label: 'Gérer', href: '/admin/manage' }, { label: 'Traductions' }]} />
            <div className={styles.headerContainer}>
                <Title className={styles.title}>Gestion des traductions</Title>
                <AddLanguageButton existingLanguages={availableLanguages.map((l) => l.code)} />
            </div>
            <LanguagesTable languages={availableLanguages} progressPerLanguages={progressPerLanguages} />
            <Button
                as="a"
                color="primary"
                variant="outlined"
                label="Retour"
                href="/admin/manage"
                marginTop="lg"
                leftIcon={<ChevronLeftIcon width={18} height={18} />}
            />
        </PageContainer>
    );
}
