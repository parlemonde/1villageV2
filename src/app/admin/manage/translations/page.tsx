'use client';

import { Breadcrumbs } from '@frontend/components/ui/Breadcrumbs/Breadcrumbs';
import { Button } from '@frontend/components/ui/Button';
import { PageContainer } from '@frontend/components/ui/PageContainer/PageContainer';
import { Title } from '@frontend/components/ui/Title';
import { ChevronLeftIcon, PlusIcon } from '@radix-ui/react-icons';
import { useState } from 'react';

import { AddLanguageModal } from './AddLanguageModal';
import { LanguagesTable } from './LanguagesTable';
import styles from './page.module.css';

// Dummy list of existing languages (these would come from your API/database)
const EXISTING_LANGUAGES = ['fr', 'en', 'de'];

export default function AdminManageTranslationsPage() {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    return (
        <PageContainer>
            <Breadcrumbs breadcrumbs={[{ label: 'Gérer', href: '/admin/manage' }, { label: 'Traductions' }]} />
            <div className={styles.headerContainer}>
                <Title className={styles.title}>Gestion des traductions</Title>
                <Button
                    variant="contained"
                    color="secondary"
                    leftIcon={<PlusIcon />}
                    label="Ajouter une langue"
                    onClick={() => setIsAddModalOpen(true)}
                />
            </div>
            <LanguagesTable />
            <AddLanguageModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} existingLanguages={EXISTING_LANGUAGES} />
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
