'use client';

import { CheckIcon } from '@radix-ui/react-icons';
import type { Language } from '@server/database/schemas/languages';
import { updateLocale } from '@server-actions/settings/update-locale';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import styles from './language-selector.module.css';

interface LanguageSelectorProps {
    currentLocale: string;
    languages: Language[];
}

export function LanguageSelector({ currentLocale, languages }: LanguageSelectorProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [selectedLocale, setSelectedLocale] = useState(currentLocale);
    const [error, setError] = useState<string | null>(null);

    const handleLanguageChange = async (locale: string) => {
        if (locale === currentLocale) return;
        setSelectedLocale(locale);
        setError(null);
        startTransition(async () => {
            try {
                await updateLocale(locale);
                // Refresh the page to apply the new locale
                router.refresh();
            } catch {
                setError('Une erreur est survenue lors du changement de langue.');
                setSelectedLocale(currentLocale);
            }
        });
    };

    return (
        <div className={styles.container}>
            {error && (
                <div className={styles.errorCard}>
                    <p className={styles.errorText}>{error}</p>
                </div>
            )}

            <div className={styles.languageGrid}>
                {languages.map((language) => {
                    const isSelected = selectedLocale === language.code;
                    const isLoading = isPending && selectedLocale === language.code;

                    return (
                        <div
                            key={language.code}
                            className={`${styles.languageCard} ${isSelected ? styles.selectedCard : ''}`}
                            onClick={() => !isPending && handleLanguageChange(language.code)}
                        >
                            <div className={styles.languageContent}>
                                <div className={styles.languageInfo}>
                                    <h4 className={styles.languageLabel}>{language.label}</h4>
                                    <span className={styles.languageCode}>{language.code.toUpperCase()}</span>
                                    {language.isDefault && <span className={styles.defaultBadge}>Par défaut</span>}
                                </div>
                                {isSelected && !isLoading && (
                                    <div className={styles.checkIcon}>
                                        <CheckIcon />
                                    </div>
                                )}
                                {isLoading && (
                                    <div className={styles.spinner}>
                                        <div className={styles.spinnerInner} />
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
