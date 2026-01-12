'use client';

import { Button } from '@frontend/components/ui/Button';
import { Select } from '@frontend/components/ui/Form/Select';
import { Modal } from '@frontend/components/ui/Modal';
import { PlusIcon } from '@radix-ui/react-icons';
import { addLanguage } from '@server-actions/languages/add-language';
import { useState, useMemo } from 'react';

import isoLanguages from './iso-639-languages.json';

interface AddLanguageButtonProps {
    existingLanguages: string[];
}

export function AddLanguageButton({ existingLanguages }: AddLanguageButtonProps) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState<string>('');
    const [isAdding, setIsAdding] = useState(false);
    const [addError, setAddError] = useState<string | null>(null);

    // Filter out languages that are already added
    const availableLanguages = useMemo(
        () => isoLanguages.filter((lang) => !existingLanguages.includes(lang.code)).sort((a, b) => a.name.localeCompare(b.name)),
        [existingLanguages],
    );

    // Convert to options format for the Select component
    const languageOptions = useMemo(
        () =>
            availableLanguages.map((lang) => ({
                value: lang.code,
                label: `${lang.name} (${lang.code})`,
            })),
        [availableLanguages],
    );

    const handleAddLanguage = async () => {
        if (!selectedLanguage) return;

        setIsAdding(true);
        setAddError(null);

        try {
            await addLanguage(selectedLanguage);
            setSelectedLanguage('');
            setIsAddModalOpen(false);
        } catch (error) {
            setAddError(error instanceof Error ? error.message : 'Une erreur est survenue');
        } finally {
            setIsAdding(false);
        }
    };

    const handleClose = () => {
        setSelectedLanguage('');
        setAddError(null);
        setIsAddModalOpen(false);
    };

    return (
        <>
            <Button
                variant="contained"
                color="secondary"
                leftIcon={<PlusIcon />}
                label="Ajouter une langue"
                onClick={() => setIsAddModalOpen(true)}
            />
            <Modal
                isOpen={isAddModalOpen}
                onClose={handleClose}
                title="Ajouter une langue"
                confirmLabel="Ajouter"
                confirmLevel="primary"
                onConfirm={handleAddLanguage}
                isLoading={isAdding}
                isConfirmDisabled={!selectedLanguage}
            >
                <div style={{ marginBottom: '16px' }}>
                    <p style={{ marginBottom: '16px' }}>Sélectionnez une langue à ajouter pour les traductions de l&apos;application.</p>
                    <Select
                        value={selectedLanguage}
                        onChange={(value: string) => setSelectedLanguage(value)}
                        options={languageOptions}
                        placeholder="Sélectionner une langue"
                        isFullWidth
                    />
                    {addError && <p style={{ color: 'var(--error-color)', marginTop: '8px' }}>{addError}</p>}
                </div>
            </Modal>
        </>
    );
}
