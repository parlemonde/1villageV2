'use client';

import { Input } from '@frontend/components/ui/Form';
import { Modal } from '@frontend/components/ui/Modal';
import type { Language } from '@server/database/schemas/languages';
import type { TranslationGroup } from '@server/i18n/get-grouped-messages';
import { saveTranslations } from '@server-actions/languages/save-translations';
import classNames from 'clsx';
import React, { useState } from 'react';

import styles from './translation-editor.module.css';

interface TranslationEditorProps {
    language: Language;
    messages: TranslationGroup[];
}
export function TranslationEditor({ language, messages }: TranslationEditorProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [messageToEditIndex, setMessageToEditIndex] = useState<{
        path: string;
        key: string;
    } | null>(null);
    const groupToEdit = messageToEditIndex ? messages.find((group) => group.path === messageToEditIndex.path) : undefined;
    const messageToEdit = messageToEditIndex && groupToEdit ? groupToEdit.messages.find((m) => m.key === messageToEditIndex.key) : undefined;
    const [tempTranslation, setTempTranslation] = React.useState('');

    const handleSaveTranslation = async () => {
        if (messageToEditIndex === null) {
            return;
        }
        setIsSaving(true);
        const newGroups = messages.map((group) =>
            group.path === messageToEditIndex.path
                ? {
                      ...group,
                      messages: group.messages.map((m) => (m.key === messageToEditIndex.key ? { ...m, traduction: tempTranslation || null } : m)),
                  }
                : group,
        );
        setMessageToEditIndex(null);
        setTempTranslation('');
        try {
            await saveTranslations(language.code, newGroups);
        } catch {
            // Ignore
        } finally {
            setIsSaving(false);
        }
    };

    const totalMessages = messages.reduce((sum, group) => sum + group.messages.length, 0);
    let messageIndex = 0;

    return (
        <>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th className={styles.headerCell} align="left" style={{ width: '40%' }}>
                            Texte original
                        </th>
                        <th className={styles.headerCell} align="left" style={{ width: '60%' }}>
                            Traduction
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {messages.map((group) => (
                        <React.Fragment key={group.path}>
                            {/* Group header row */}
                            <tr className={styles.groupRow}>
                                <td className={styles.groupCell} colSpan={2}>
                                    {group.path || 'Root'}
                                </td>
                            </tr>
                            {/* Translation rows for this group */}
                            {group.messages.map((message) => {
                                const currentValue = message.traduction;
                                const isLastMessage = ++messageIndex === totalMessages;
                                return (
                                    <tr key={`${group.path}-${message.key}`} className={styles.row}>
                                        <td
                                            className={classNames(styles.cell, {
                                                [styles.lastCell]: isLastMessage,
                                            })}
                                            align="left"
                                        >
                                            <div
                                                className={styles.clickableCell}
                                                onClick={() => {
                                                    setMessageToEditIndex({
                                                        path: group.path,
                                                        key: message.key,
                                                    });
                                                    setTempTranslation(message.traduction || '');
                                                }}
                                            >
                                                <span className={styles.originalText}>{message.original}</span>
                                            </div>
                                        </td>
                                        <td
                                            className={classNames(styles.cell, {
                                                [styles.lastCell]: isLastMessage,
                                            })}
                                            align="left"
                                        >
                                            <div
                                                className={`${styles.clickableCell} ${styles.translationCell}`}
                                                onClick={() => {
                                                    setMessageToEditIndex({
                                                        path: group.path,
                                                        key: message.key,
                                                    });
                                                    setTempTranslation(message.traduction || '');
                                                }}
                                            >
                                                {currentValue ? (
                                                    <span className={styles.translationText}>{currentValue}</span>
                                                ) : (
                                                    <span className={styles.emptyTranslation}>Aucune traduction</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
            <Modal
                isOpen={messageToEdit !== undefined}
                onClose={() => {
                    setMessageToEditIndex(null);
                    setTempTranslation('');
                }}
                title="Modifier la traduction"
                confirmLabel="Enregistrer"
                onConfirm={handleSaveTranslation}
                isConfirmDisabled={tempTranslation === ''}
                isLoading={isSaving}
            >
                {messageToEdit && (
                    <div className={styles.modalContent}>
                        <div className={styles.modalField}>
                            <label className={styles.modalLabel}>Texte original (Français)</label>
                            <div className={styles.originalTextBox}>{messageToEdit.original}</div>
                        </div>
                        <div className={styles.modalField}>
                            <label className={styles.modalLabel}>Traduction ({language.label})</label>
                            <Input
                                value={tempTranslation}
                                onChange={(e) => setTempTranslation(e.target.value)}
                                placeholder={`Traduction en ${language.label}...`}
                                isFullWidth
                                autoFocus
                            />
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
}
