'use client';

import { ActivityCard } from '@frontend/components/activities/ActivityCard';
import { Button } from '@frontend/components/ui/Button';
import { Field, Input } from '@frontend/components/ui/Form';
import { Switch } from '@frontend/components/ui/Form/Switch';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { SectionContainer } from '@frontend/components/ui/SectionContainer';
import { Steps } from '@frontend/components/ui/Steps';
import { UploadImageModal } from '@frontend/components/upload/UploadImageModal';
import { ActivityContext } from '@frontend/contexts/activityContext';
import { UserContext } from '@frontend/contexts/userContext';
import { ChevronRightIcon, ChevronLeftIcon } from '@radix-ui/react-icons';
import { useMemo, useContext, useState } from 'react';

export default function FreeContentStep2() {
    const { user: currentUser } = useContext(UserContext);
    const { activity, setActivity } = useContext(ActivityContext);
    const [isUploadImageModalOpen, setIsUploadImageModalOpen] = useState(false);

    const currentDate = useMemo(() => new Date(), []);

    if (!activity || activity.type !== 'libre') {
        return null;
    }

    return (
        <>
            <PageContainer title="Publication de contenu libre">
                <Steps
                    steps={[
                        { label: 'Contenu', href: '/contenu-libre/1', status: (activity.data?.content || []).length > 0 ? 'success' : 'warning' },
                        { label: 'Forme', href: '/contenu-libre/2' },
                        { label: 'Pré-visualiser', href: '/contenu-libre/3' },
                    ]}
                    activeStep={2}
                    marginBottom="sm"
                />

                <SectionContainer title="Ajustez l'apparence de votre publication">
                    <Field
                        label="Titre"
                        name="title"
                        input={
                            <Input
                                id="title"
                                name="title"
                                isFullWidth
                                placeholder="Entrez le titre de votre publication"
                                value={activity.data?.title || ''}
                                onChange={(e) => setActivity({ ...activity, data: { ...activity.data, title: e.target.value } })}
                            />
                        }
                        marginBottom="md"
                    />
                    <Field
                        label="Extrait"
                        name="extract"
                        input={
                            <Input
                                id="extract"
                                name="extract"
                                isFullWidth
                                placeholder="Entrez l'extrait de votre publication"
                                value={activity.data?.resume || ''}
                                onChange={(e) => setActivity({ ...activity, data: { ...activity.data, resume: e.target.value } })}
                            />
                        }
                        marginBottom="md"
                    />
                    <Switch
                        id="isPinned"
                        name="isPinned"
                        label="Épingler la publication ?"
                        isChecked={activity.isPinned || false}
                        onChange={(checked) => setActivity({ ...activity, isPinned: checked })}
                        marginBottom="md"
                    />
                    <div style={{ marginBottom: '16px' }}>
                        <label>Image principale de votre publication</label>
                        <Button
                            marginLeft="sm"
                            label={activity.data?.cardImageUrl ? 'Changer' : 'Choisir une image'}
                            color="primary"
                            size="sm"
                            onClick={() => setIsUploadImageModalOpen(true)}
                        />
                        {activity.data?.cardImageUrl && (
                            <Button
                                marginLeft="sm"
                                label="Supprimer"
                                color="error"
                                size="sm"
                                onClick={() => setActivity({ ...activity, data: { ...activity.data, cardImageUrl: undefined } })}
                            />
                        )}
                        <UploadImageModal
                            isOpen={isUploadImageModalOpen}
                            onClose={() => setIsUploadImageModalOpen(false)}
                            initialImageUrl={activity.data?.cardImageUrl}
                            onNewImage={(imageUrl) => setActivity({ ...activity, data: { ...activity.data, cardImageUrl: imageUrl } })}
                        />
                    </div>
                    {activity.data?.cardImageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={activity.data.cardImageUrl} alt="Image principale de la publication" style={{ width: 'auto', height: '150px' }} />
                    )}
                </SectionContainer>

                <SectionContainer title="Aperçu de votre publication">
                    <p style={{ marginBottom: '16px' }}>Voilà à quoi ressemblera votre publication dans le fil d&apos;activité</p>
                    <ActivityCard user={currentUser} activity={{ ...activity, publishDate: currentDate.toISOString() }} shouldDisableButtons />
                </SectionContainer>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button as='a' href='/contenu-libre/1' color="primary" variant="outlined" label="Étape précédente" leftIcon={<ChevronLeftIcon />} />
                    <Button as='a' href='/contenu-libre/3' color="primary" label="Étape suivante" rightIcon={<ChevronRightIcon />}></Button>
                </div>
            </PageContainer>
        </>
    );
}
