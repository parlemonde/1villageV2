'use client';

import { Field, Input } from '@frontend/components/ui/Form';
import { Title } from '@frontend/components/ui/Title';
import { UploadImageModal } from '@frontend/components/upload/UploadImageModal';
import { PlusIcon } from '@radix-ui/react-icons';
import type { Activity } from '@server/database/schemas/activities';
import type { GameActivity, IdiomGame } from '@server/database/schemas/activity-types';
import Image from 'next/image';
import { useExtracted } from 'next-intl';
import { useState } from 'react';

import { idiomGameHelpers } from './helpers';
import styles from './idiom-form.module.css';

interface IdiomFormProps {
    activity: Partial<Activity & GameActivity<IdiomGame>>;
    setActivity: (activity: Partial<Activity>) => void;
    getOrCreateDraft: () => Promise<number | null>;
    number: number; // used for array indexing, 1 means first step which uses the form, not step 1
    stepId: number;
}

export const IdiomForm = ({ activity, setActivity, getOrCreateDraft, number, stepId }: IdiomFormProps) => {
    const t = useExtracted('app.(1village).(activities).creer-un-jeu.expression');

    const index = number - 1;

    const [isOpen, setIsOpen] = useState(false);

    const { setIdiom } = idiomGameHelpers(activity, setActivity, index, stepId);

    return (
        <>
            <Title variant="h2" marginBottom="md">
                {t('Dessinez votre expression')}
            </Title>
            {activity?.data?.idioms?.[index]?.imageUrl ? (
                <Image className={styles.image} src={activity?.data?.idioms?.[index].imageUrl} alt="" width={400} height={400} />
            ) : (
                <PlusIcon className={styles.image + ' ' + styles.svg} onClick={() => setIsOpen(true)} />
            )}
            <Field
                name="idiom"
                label={t("Écrivez l'expression dans la langue que vous avez choisie juste avant")}
                marginBottom="md"
                input={
                    <Input
                        isFullWidth
                        type="text"
                        name="idiom"
                        value={activity?.data?.idioms?.[index]?.value ?? ''}
                        onChange={(e) => setIdiom('value', e.target.value)}
                    />
                }
            />
            <Field
                name="meaning"
                label={t('Que signifie cette expression ?')}
                marginBottom="md"
                input={
                    <Input
                        isFullWidth
                        type="text"
                        name="meaning"
                        value={activity?.data?.idioms?.[index]?.meaning ?? ''}
                        onChange={(e) => setIdiom('meaning', e.target.value)}
                    />
                }
            />
            <Title variant="h2" marginBottom="md">
                {t('Inventez deux significations fausses à cette expression')}
            </Title>
            <p>
                {t(
                    "Vos pélicopains verront le dessin de votre expression et devront trouver sa vraie signification parmi 3 propositions. A vous d'inventer 2 fausses significations :",
                )}
            </p>
            <Field
                name="falseMeaning1"
                marginBottom="md"
                marginTop="md"
                input={
                    <Input
                        isFullWidth
                        type="text"
                        name="falseMeaning1"
                        value={activity?.data?.idioms?.[index]?.falseMeanings?.[0] ?? ''}
                        onChange={(e) => {
                            const prev = activity?.data?.idioms?.[index].falseMeanings || [];
                            setIdiom('falseMeanings', [e.target.value, ...prev.slice(1)]);
                        }}
                    />
                }
            />
            <Field
                name="falseMeaning2"
                marginBottom="md"
                input={
                    <Input
                        isFullWidth
                        type="text"
                        name="falseMeaning2"
                        value={activity?.data?.idioms?.[index]?.falseMeanings?.[1] ?? ''}
                        onChange={(e) => {
                            const prev = activity?.data?.idioms?.[index].falseMeanings || [];
                            setIdiom('falseMeanings', [...prev.slice(0, 1), e.target.value]);
                        }}
                    />
                }
            />
            <UploadImageModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onNewImage={(imageUrl) => setIdiom('imageUrl', imageUrl)}
                getActivityId={getOrCreateDraft}
            />
        </>
    );
};
