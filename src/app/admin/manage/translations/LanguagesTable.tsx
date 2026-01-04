'use client';

import { AdminTable } from '@frontend/components/AdminTable';
import { IconButton } from '@frontend/components/ui/Button';
import { Modal } from '@frontend/components/ui/Modal';
import { Tooltip } from '@frontend/components/ui/Tooltip/Tooltip';
import { Pencil1Icon, TrashIcon } from '@radix-ui/react-icons';
import { useState } from 'react';

import styles from './languages-table.module.css';

// Dummy data for available languages with translation progress
const DUMMY_LANGUAGES = [
    { code: 'fr', name: 'Français', translationProgress: 100, isDefault: true },
    { code: 'en', name: 'English', translationProgress: 75, isDefault: false },
    { code: 'de', name: 'Deutsch', translationProgress: 30, isDefault: false },
];

export function LanguagesTable() {
    const [languageToDeleteCode, setLanguageToDeleteCode] = useState<string | null>(null);
    const [isDeletingLanguage, setIsDeletingLanguage] = useState(false);

    const languageToDelete = DUMMY_LANGUAGES.find((lang) => lang.code === languageToDeleteCode);

    const handleDeleteLanguage = async () => {
        if (languageToDeleteCode === null) {
            return;
        }
        setIsDeletingLanguage(true);

        // TODO: Implement actual delete API call
        // Simulating API call with timeout
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setIsDeletingLanguage(false);
        setLanguageToDeleteCode(null);
    };

    return (
        <div>
            <AdminTable
                columns={[
                    {
                        id: 'name',
                        header: 'Langue',
                        accessor: (language) => (
                            <div>
                                {language.name}
                                {language.isDefault && <span className={styles.defaultBadge}>Par défaut</span>}
                            </div>
                        ),
                        isSortable: true,
                        getSortValue: (language) => language.name,
                    },
                    {
                        id: 'progress',
                        header: 'Status des traductions',
                        accessor: (language) => {
                            const progressClass =
                                language.translationProgress === 100
                                    ? styles.progressFillComplete
                                    : language.translationProgress >= 70
                                      ? styles.progressFillPartial
                                      : styles.progressFillLow;

                            return (
                                <div className={styles.progressContainer}>
                                    <div className={styles.progressBar}>
                                        <div
                                            className={`${styles.progressFill} ${progressClass}`}
                                            style={{ width: `${language.translationProgress}%` }}
                                        />
                                    </div>
                                    <span className={styles.progressText}>{language.translationProgress}%</span>
                                </div>
                            );
                        },
                        width: '300px',
                        isSortable: true,
                        getSortValue: (language) => language.translationProgress,
                    },
                    {
                        id: 'actions',
                        header: 'Actions',
                        accessor: (language) => (
                            <>
                                <Tooltip content="Modifier les traductions" hasArrow>
                                    <IconButton
                                        as="a"
                                        href={`/admin/manage/translations/${language.code}`}
                                        variant="borderless"
                                        color="primary"
                                        icon={Pencil1Icon}
                                    />
                                </Tooltip>
                                <Tooltip
                                    content={language.isDefault ? 'La langue par défaut ne peut pas être supprimée' : 'Supprimer la langue'}
                                    hasArrow
                                >
                                    <IconButton
                                        disabled={language.isDefault}
                                        variant="borderless"
                                        color="error"
                                        icon={TrashIcon}
                                        onClick={() => setLanguageToDeleteCode(language.code)}
                                    />
                                </Tooltip>
                            </>
                        ),
                        width: '100px',
                        align: 'right',
                        cellPadding: '0 8px',
                    },
                ]}
                data={DUMMY_LANGUAGES}
                isLoading={false}
                emptyState="Aucune langue disponible"
            />
            <Modal
                isOpen={languageToDelete !== undefined}
                onClose={() => setLanguageToDeleteCode(null)}
                title="Supprimer la langue"
                confirmLabel="Supprimer"
                confirmLevel="error"
                onConfirm={handleDeleteLanguage}
                isLoading={isDeletingLanguage}
            >
                {languageToDelete !== undefined && (
                    <p>
                        Êtes-vous sûr de vouloir supprimer la langue <strong>{languageToDelete.name}</strong> ? Cette action est irréversible et
                        supprimera toutes les traductions associées.
                    </p>
                )}
            </Modal>
        </div>
    );
}
