'use client';

import { AdminTable } from '@frontend/components/AdminTable';
import { IconButton } from '@frontend/components/ui/Button';
import { Modal } from '@frontend/components/ui/Modal';
import { Tooltip } from '@frontend/components/ui/Tooltip/Tooltip';
import { Pencil1Icon, TrashIcon } from '@radix-ui/react-icons';
import type { Language } from '@server/database/schemas/languages';
import { deleteLanguage } from '@server-actions/languages/delete-language';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import styles from './languages-table.module.css';

interface LanguagesTableProps {
    languages: Language[];
    progressPerLanguages: Record<string, number>;
}

export function LanguagesTable({ languages, progressPerLanguages }: LanguagesTableProps) {
    const router = useRouter();
    const [languageToDeleteCode, setLanguageToDeleteCode] = useState<string | null>(null);
    const [isDeletingLanguage, setIsDeletingLanguage] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const languageToDelete = languages.find((lang) => lang.code === languageToDeleteCode);

    const handleDeleteLanguage = async () => {
        if (languageToDeleteCode === null) {
            return;
        }
        setIsDeletingLanguage(true);
        setDeleteError(null);

        try {
            await deleteLanguage(languageToDeleteCode);
            router.refresh(); // Refresh the page data
        } catch (error) {
            setDeleteError(error instanceof Error ? error.message : 'Une erreur est survenue');
        } finally {
            setIsDeletingLanguage(false);
            setLanguageToDeleteCode(null);
        }
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
                                {language.label}
                                {language.isDefault && <span className={styles.defaultBadge}>Par défaut</span>}
                            </div>
                        ),
                        isSortable: true,
                        getSortValue: (language) => language.label,
                    },
                    {
                        id: 'progress',
                        header: 'Status des traductions',
                        accessor: (language) => {
                            const progress = language.isDefault ? 100 : progressPerLanguages[language.code] || 0;
                            const progressClass =
                                progress === 100 ? styles.progressFillComplete : progress >= 70 ? styles.progressFillPartial : styles.progressFillLow;

                            return (
                                <div className={styles.progressContainer}>
                                    <div className={styles.progressBar}>
                                        <div className={`${styles.progressFill} ${progressClass}`} style={{ width: `${progress}%` }} />
                                    </div>
                                    <span className={styles.progressText}>{progress}%</span>
                                </div>
                            );
                        },
                        width: '300px',
                        isSortable: true,
                        getSortValue: (language) => (language.isDefault ? 100 : progressPerLanguages[language.code] || 0),
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
                data={languages}
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
                    <>
                        <p>
                            Êtes-vous sûr de vouloir supprimer la langue <strong>{languageToDelete.label}</strong> ? Cette action est irréversible et
                            supprimera toutes les traductions associées.
                        </p>
                        {deleteError && <p style={{ color: 'var(--error-color)', marginTop: '8px' }}>{deleteError}</p>}
                    </>
                )}
            </Modal>
        </div>
    );
}
