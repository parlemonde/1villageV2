'use client';

import { Select } from '@frontend/components/ui/Form/Select';
import { Modal } from '@frontend/components/ui/Modal';
import { useState, useMemo } from 'react';

import isoLanguages from './iso-639-languages.json';

interface AddLanguageModalProps {
    isOpen: boolean;
    onClose: () => void;
    existingLanguages: string[];
}

export function AddLanguageModal({ isOpen, onClose, existingLanguages }: AddLanguageModalProps) {
    const [selectedLanguage, setSelectedLanguage] = useState<string>('');
    const [isAdding, setIsAdding] = useState(false);

    // Filter out languages that are already added
    const availableLanguages = useMemo(() => isoLanguages.filter((lang) => !existingLanguages.includes(lang.code)), [existingLanguages]);

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

        // TODO: Implement actual API call to add language
        // Simulating API call with timeout
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setIsAdding(false);
        setSelectedLanguage('');
        onClose();
    };

    const handleClose = () => {
        setSelectedLanguage('');
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
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
            </div>
        </Modal>
    );
}
