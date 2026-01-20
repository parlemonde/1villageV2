import Image from 'next/image';
import React, { useContext, useEffect, useRef, useState } from 'react';

import { PageContainer } from '@frontend/components/ui/PageContainer';
import { ChevronRightIcon } from '@radix-ui/react-icons';
import { Button } from '@frontend/components/ui/Button';
import { ActivityContext } from '@frontend/contexts/activityContext';
import { Title } from '@frontend/components/ui/Title';
import { Steps } from '@frontend/components/ui/Steps';

import styles from '../page.module.css';
import { BackButton } from '@frontend/components/activities/BackButton/BackButton';
import { useRouter } from 'next/router';
import { UserContext } from '@frontend/contexts/userContext';
import { AspectRatio } from 'radix-ui';

const StoryStep1 = () => {
    const { activity, onCreateActivity, onUpdateActivity } = useContext(ActivityContext);
    if (!activity || activity.type !== 'histoire') {
        return null;
    }

    //const { selectedPhase } = useContext(VillageContext);
    const { deleteStoryImage } = useImageStoryRequests();
    const [isError, setIsError] = useState<boolean>(false);
    const [isImageModalOpen, setIsImageModalOpen] = React.useState(false);
    const [oDDChoice, setODDChoice] = useState('');
    const data = (activity?.data as StoriesData) || { odd: oDDChoice[0] };
    //const isEdit = activity !== null && activity?.status !== ActivityStatus.DRAFT;
    const { user } = useContext(UserContext);
    const isPelico = user.role === 'admin' || user.role === 'mediator';
    const router = useRouter();

    // Create the story activity.
    const created = useRef(false);
    useEffect(() => {
        if (!created.current) {
            if (!('edit' in router.query) || (activity && !(activity.type === 'histoire'))) {
                created.current = true;
                onCreateActivity('histoire', isPelico);
            }
        }
    }, [activity, onCreateActivity]);

    // Update the "odd step" image url, when upload an image.
    const setImage = (imageUrl: string) => {
        const { odd } = data;
        //onUpdateActivity({ data: { ...data, odd: { ...odd, inspiredStoryId: activity?.id, imageUrl, imageId: 0 } } });
    };

    useEffect(() => {
        // if user navigated to the next step already, let's show the errors if there are any.
        if (window.sessionStorage.getItem(`story-step-1-next`) === 'true') {
            setIsError(true);
            window.sessionStorage.setItem(`story-step-1-next`, 'false');
        }
    }, []);

    function setIsUploadImageModalOpen(arg0: boolean): void {
        throw new Error('Function not implemented.');
    }

    return (
        <PageContainer>
            <BackButton href="/creer-une-histoire" label="Retour" />
            <Steps
                steps={[
                    { label: 'ODD', href: '/creer-une-histoire/1?edit' },
                    { label: 'Objet', href: '/creer-une-histoire/2' },
                    { label: 'Lieu', href: '/creer-une-histoire/3' },
                    { label: 'Histoire', href: '/creer-une-histoire/4' },
                    { label: 'Prévisualisation', href: '/creer-une-histoire/5' },
                ]}
                activeStep={0}
            />

            <div className="width-900">
                <Title variant="h1" marginBottom="md">
                    Choisissez et dessinez l'objectif du développement durable à atteindre
                </Title>
                <div className={styles['odd-container']}>
                    <div className={styles['odd-column']}>
                        <div className={styles['odd-image-wrapper']}>
                            <div style={{ width: '100%', maxWidth: '320px', marginTop: '1rem', position: 'relative' }}>
                                <Button
                                    marginLeft="sm"
                                    label={activity.data?.text ? 'Changer' : 'Choisir une image'}
                                    color="primary"
                                    size="sm"
                                    onClick={() => setIsUploadImageModalOpen(true)}
                                    style={{ width: '100%', color: isError ? 'var(--error-color)' : 'var(--primary-color)' }}
                                />
                                <div style={{ width: '100%' }}>
                                    <AspectRatio.Root ratio={2 / 3}>
                                        <div
                                            style={{
                                                height: '100%',
                                                width: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                border: `1px solid ${isError ? 'var(--error-color)' : 'var(--primary-color)'}`,
                                                borderRadius: '10px',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            {data.odd?.imageUrl ? (
                                                <Image
                                                    layout="fill"
                                                    objectFit="cover"
                                                    alt="image de l'objectif de développement durable"
                                                    src={data.odd?.imageUrl}
                                                    unoptimized
                                                />
                                            ) : (
                                                <AddIcon style={{ fontSize: '80px' }} />
                                            )}
                                        </div>
                                    </AspectRatio.Root>
                                </div>

                                {data.odd?.imageUrl && (
                                    <div style={{ position: 'absolute', top: '0.25rem', right: '0.25rem' }}>
                                        <DeleteButton
                                            onDelete={() => {
                                                deleteStoryImage(data.odd.imageId, data, 3);
                                                setImage('');
                                            }}
                                            confirmLabel="Êtes-vous sur de vouloir supprimer l'image ?"
                                            confirmTitle="Supprimer l'image"
                                            style={{ backgroundColor: 'var(--background-color)' }}
                                        />
                                    </div>
                                )}
                                <ImageModal
                                    id={0}
                                    isModalOpen={isImageModalOpen}
                                    setIsModalOpen={setIsImageModalOpen}
                                    imageUrl={data.odd?.imageUrl || ''}
                                    setImageUrl={setImage}
                                />
                            </div>
                            <FormControl variant="outlined" className="full-width" style={{ marginTop: '1rem' }}>
                                <InputLabel id="select-ODD">ODD</InputLabel>
                                <Select
                                    error={isError && data?.odd?.description === ''}
                                    labelId="select-ODD"
                                    id="select-ODD-outlined"
                                    value={oDDChoice || data.odd?.description}
                                    onChange={(event: { target: { value: string } }) => {
                                        setODDChoice(event.target.value as string);
                                        const { odd } = data;
                                        //onUpdateActivity({ data: { ...data, odd: { ...odd, description: event.target.value } } });
                                        onUpdateActivity();
                                    }}
                                    label="Village"
                                >
                                    {(ODD_CHOICE || []).map((v: { choice: any }, index: number) => (
                                        <MenuItem value={v.choice} key={index + 1}>
                                            {v.choice}
                                        </MenuItem>
                                    ))}
                                </Select>
                                <FormHelperText>Choisissez votre ODD </FormHelperText>
                            </FormControl>
                        </div>
                    </div>
                </div>
            </div>
            <div style={{ textAlign: 'right', marginTop: '16px' }}>
                <Button as="a" href="/creer-une-histoire/2" color="primary" label="Étape suivante" rightIcon={<ChevronRightIcon />}></Button>
            </div>
        </PageContainer>
    );
};

export default StoryStep1;
function useImageStoryRequests(): { deleteStoryImage: any } {
    throw new Error('Function not implemented.');
}
