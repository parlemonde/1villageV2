'use client';

import { ContentEditor } from '@frontend/components/content/ContentEditor/ContentEditor';
import type { AnyContent } from '@frontend/components/content/content.types';
import { Button } from '@frontend/components/ui/Button/Button';
import { Loader } from '@frontend/components/ui/Loader';
import { ChevronLeftIcon } from '@radix-ui/react-icons';
import type { Activity } from '@server/database/schemas/activities';
import { updatePelicoPresentation } from '@server-actions/activities/update-pelico-presentation';
import { useRouter } from 'next/navigation';
import { useExtracted } from 'next-intl';
import { useState } from 'react';

// import styles from './pelico.module.css';

interface PelicoPageProps {
    presentation: Activity | null;
}

export const PelicoPresentationPage = ({ presentation }: PelicoPageProps) => {
    const t = useExtracted('app.admin.manage.pelico');
    const router = useRouter();
    const initialData = presentation?.type === 'presentation-pelico' ? presentation.data : null;
    const [presentationData, setPresentationData] = useState<{
        title?: string;
        text?: string;
        content?: AnyContent[];
    } | null>(initialData || { content: [] });

    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    const handleContentChange = (content: AnyContent[]) => {
        setPresentationData((prev) => ({ ...prev, content }));
        setHasChanges(true);
    };

    const onSave = async () => {
        setIsSaving(true);
        try {
            await updatePelicoPresentation(presentationData);
            setHasChanges(false);
            //router.push('/admin/newportal/manage/settings');
            router.refresh();
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className={'container'}>
            <Loader isLoading={isSaving} />

            <ContentEditor
                content={presentationData?.content || []}
                setContent={handleContentChange}
                activityId={presentation?.id}
                getActivityId={async () => presentation?.id ?? null}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                <Button
                    as="a"
                    color="primary"
                    variant="outlined"
                    label={t('Retour')}
                    href="/admin/manage"
                    leftIcon={<ChevronLeftIcon width={18} height={18} />}
                />
                <Button label={t('Valider')} color="primary" variant="contained" disabled={!hasChanges} onClick={onSave} />
            </div>
        </div>
    );
};
