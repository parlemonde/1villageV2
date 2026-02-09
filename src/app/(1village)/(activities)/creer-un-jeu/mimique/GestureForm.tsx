'use client';

import { IconButton } from '@frontend/components/ui/Button';
import { Field, Input } from '@frontend/components/ui/Form';
import { Title } from '@frontend/components/ui/Title';
import { VideoPlayer } from '@frontend/components/ui/VideoPlayer';
import { UploadVideoModal } from '@frontend/components/upload/UploadVideoModal';
import { Pencil1Icon, PlusIcon } from '@radix-ui/react-icons';
import type { Activity } from '@server/database/schemas/activities';
import type { GameActivity, GestureGame } from '@server/database/schemas/activity-types';
import { useExtracted } from 'next-intl';
import { useState } from 'react';

import styles from './gesture-form.module.css';
import { gestureGameHelpers } from './helpers';

interface GestureFormProps {
    activity: Partial<Activity & GameActivity<GestureGame>>;
    setActivity: (activity: Partial<Activity>) => void;
    getOrCreateDraft: () => Promise<number | null>;
    number: number; // used for array indexing, 1 means first step which uses the form, not step 1
    stepId: number;
    title: string;
}
export const GestureForm = ({ activity, setActivity, getOrCreateDraft, number, stepId, title }: GestureFormProps) => {
    const t = useExtracted('app.(1village).(activities).creer-un-jeu.mimique');
    const index = number - 1;

    const [isOpen, setIsOpen] = useState(false);

    const { setGesture } = gestureGameHelpers(activity, setActivity, index, stepId);

    return (
        <>
            <Title variant="h2" marginBottom="md">
                {title}
            </Title>
            <p>{t("Importez une vidéo d'un enfant qui fait la mimique. Mais attention, ne révélez pas à l'oral sa signification !")}</p>
            {activity?.data?.gestures?.[index]?.videoUrl ? (
                <div className={styles.videoContainer}>
                    <VideoPlayer src={activity?.data?.gestures?.[index].videoUrl} />
                    <IconButton icon={Pencil1Icon} className={styles.editIcon} color="primary" variant="contained" onClick={() => setIsOpen(true)} />
                </div>
            ) : (
                <PlusIcon className={styles.svg} onClick={() => setIsOpen(true)} />
            )}
            <Field
                name="meaning"
                label={t('Que signifie cette mimique ?')}
                marginBottom="md"
                input={
                    <Input
                        isFullWidth
                        type="text"
                        name="meaning"
                        value={activity?.data?.gestures?.[index]?.meaning ?? ''}
                        onChange={(e) => setGesture('meaning', e.target.value)}
                    />
                }
            />
            <Field
                name="origin"
                label={t("Quelle est l'origine de cette mimique ?")}
                marginBottom="md"
                input={
                    <Input
                        isFullWidth
                        type="text"
                        name="origin"
                        value={activity?.data?.gestures?.[index]?.origin ?? ''}
                        onChange={(e) => setGesture('origin', e.target.value)}
                    />
                }
            />
            <Title variant="h2" marginBottom="md">
                {t('Inventez deux significations fausses à cette mimique')}
            </Title>
            <p>
                {t(
                    "Vos pélicopains verront la vidéo de votre mimique et devront trouver sa vraie signification parmi 3 propositions. A vous d'inventer 2 fausses significations :",
                )}
            </p>
            <Field
                name="falseMeaning1"
                marginBottom="md"
                marginTop="md"
                input={
                    <Input
                        isFullWidth
                        placeholder={t('Signification inventée 1')}
                        type="text"
                        name="falseMeaning1"
                        value={activity?.data?.gestures?.[index]?.falseMeanings?.[0] ?? ''}
                        onChange={(e) => {
                            const prev = activity?.data?.gestures?.[index]?.falseMeanings || [];
                            setGesture('falseMeanings', [e.target.value, ...prev.slice(1)]);
                        }}
                    />
                }
            />
            <Field
                name="falseMeaning2"
                marginBottom="md"
                input={
                    <Input
                        placeholder={t('Signification inventée 2')}
                        isFullWidth
                        type="text"
                        name="falseMeaning2"
                        value={activity?.data?.gestures?.[index]?.falseMeanings?.[1] ?? ''}
                        onChange={(e) => {
                            const prev = activity?.data?.gestures?.[index]?.falseMeanings;
                            const newValue = prev ? [...prev.slice(0, 1), e.target.value] : ['', e.target.value];
                            setGesture('falseMeanings', newValue);
                        }}
                    />
                }
            />
            <UploadVideoModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onNewVideo={(videoUrl) => setGesture('videoUrl', videoUrl)}
                getActivityId={getOrCreateDraft}
            />
        </>
    );
};
