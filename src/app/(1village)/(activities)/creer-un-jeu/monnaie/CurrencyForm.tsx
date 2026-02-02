'use client';

import { Field, Input } from '@frontend/components/ui/Form';
import { Title } from '@frontend/components/ui/Title';
import { UploadImageModal } from '@frontend/components/upload/UploadImageModal';
import { PlusIcon } from '@radix-ui/react-icons';
import type { Activity } from '@server/database/schemas/activities';
import type { CurrencyGame, GameActivity } from '@server/database/schemas/activity-types';
import Image from 'next/image';
import { useExtracted } from 'next-intl';
import { useState } from 'react';

import styles from './currency-form.module.css';
import { currencyGameHelpers } from './helpers';

interface CurrencyFormProps {
    activity: Partial<Activity & GameActivity<CurrencyGame>>;
    setActivity: (activity: Partial<Activity>) => void;
    getOrCreateDraft: () => Promise<number | null>;
    number: number; // used for array indexing, 1 means first step which uses the form, not step 1
    stepId: number;
    title: string;
}
export const CurrencyForm = ({ activity, setActivity, getOrCreateDraft, number, stepId, title }: CurrencyFormProps) => {
    const t = useExtracted('app.(1village).(activities).creer-un-jeu.monnaie');
    const index = number - 1;

    const [isOpen, setIsOpen] = useState(false);

    const { setObject } = currencyGameHelpers(activity, setActivity, index, stepId);

    return (
        <>
            <Title variant="h2" marginBottom="md">
                {title}
            </Title>
            {activity?.data?.objects?.[index]?.imageUrl ? (
                <Image
                    className={styles.image}
                    src={activity?.data?.objects?.[index].imageUrl}
                    alt={activity?.data?.objects?.[index].name ?? ''}
                    width={400}
                    height={400}
                />
            ) : (
                <PlusIcon className={styles.image + ' ' + styles.svg} onClick={() => setIsOpen(true)} />
            )}
            <Field
                name="name"
                label={t('Quel est le nom de cet objet ?')}
                marginBottom="md"
                input={
                    <Input
                        isFullWidth
                        type="text"
                        name="name"
                        value={activity?.data?.objects?.[index]?.name ?? ''}
                        onChange={(e) => setObject('name', e.target.value)}
                    />
                }
            />
            <Field
                name="price"
                label={t('Quel est son prix moyen ?')}
                marginBottom="md"
                input={
                    <Input
                        isFullWidth
                        type="number"
                        name="price"
                        min="0"
                        value={activity?.data?.objects?.[index]?.price ?? ''}
                        onChange={(e) => setObject('price', e.target.value)}
                    />
                }
            />
            <Title variant="h2" marginBottom="md">
                {t('Inventez deux prix faux à cet objet')}
            </Title>
            <p>
                {t(
                    "Vos pélicopains verront l'image de votre objet et devront trouver son vrai prix parmi 3 propositions. A vous d'inventer 2 faux prix :",
                )}
            </p>
            <Field
                name="falsePrice1"
                marginBottom="md"
                marginTop="md"
                input={
                    <Input
                        isFullWidth
                        placeholder={t('Prix inventé 1')}
                        type="number"
                        min="0"
                        name="falsePrice1"
                        value={activity?.data?.objects?.[index]?.falsePrices?.[0] ?? ''}
                        onChange={(e) => {
                            const prev = activity?.data?.objects?.[index].falsePrices || [];
                            setObject('falsePrices', [e.target.value, ...prev.slice(1)]);
                        }}
                    />
                }
            />
            <Field
                name="falsePrice2"
                marginBottom="md"
                input={
                    <Input
                        placeholder={t('Prix inventé 2')}
                        isFullWidth
                        type="number"
                        min="0"
                        name="falsePrice2"
                        value={activity?.data?.objects?.[index]?.falsePrices?.[1] ?? ''}
                        onChange={(e) => {
                            const prev = activity?.data?.objects?.[index].falsePrices || [];
                            setObject('falsePrices', [...prev.slice(0, 1), e.target.value]);
                        }}
                    />
                }
            />
            <UploadImageModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onNewImage={(imageUrl) => setObject('imageUrl', imageUrl)}
                getActivityId={getOrCreateDraft}
            />
        </>
    );
};
