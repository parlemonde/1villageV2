import styles from '@app/(1village)/(activities)/creer-une-histoire/page.module.css';
import { BackButton } from '@frontend/components/activities/BackButton/BackButton';
import { DeleteButton } from '@frontend/components/activities/DeleteButton/DeleteButton';
import { Button } from '@frontend/components/ui/Button';
import { Modal } from '@frontend/components/ui/Modal';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Steps } from '@frontend/components/ui/Steps';
import { Title } from '@frontend/components/ui/Title';
import { ActivityContext } from '@frontend/contexts/activityContext';
import { UserContext } from '@frontend/contexts/userContext';
import type { ActivityData } from '@server/database/schemas/activity-types';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { AspectRatio, Select } from 'radix-ui';
import { useContext, useEffect, useRef, useState } from 'react';

const StoryStep1 = () => {
    const { activity, onCreateActivity, onUpdateActivity } = useContext(ActivityContext);

    //const { selectedPhase } = useContext(VillageContext);
    const { deleteStoryImage } = useImageStoryRequests();
    const [isError, setIsError] = useState<boolean>(false);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [oDDChoice, setODDChoice] = useState('');
    const data = (activity?.data as ActivityData<'histoire'>) || { odd: oDDChoice[0] };
    //const isEdit = activity !== null && activity?.status !== ActivityStatus.DRAFT;
    const { user } = useContext(UserContext);
    const isPelico = user.role === 'admin' || user.role === 'mediator';
    const router = useRouter();

    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleDelete = () => {
        deleteStoryImage(data.odd.imageId, data, 3);
        setImage('');
    };

    // Create the story activity.
    const created = useRef(false);
    useEffect(() => {
        if (!created.current) {
            if (!('edit' in router.query) || (activity && !(activity.type === 'histoire'))) {
                created.current = true;
                onCreateActivity('histoire', isPelico);
            }
        }
    }, [activity, isPelico, onCreateActivity, router.query]);

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

    if (!activity || activity.type !== 'histoire') {
        return null;
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
                                        <DeleteButton onClick={() => setIsModalOpen(true)} style={{ backgroundColor: 'var(--background-color)' }} />
                                        <Modal
                                            isOpen={isModalOpen}
                                            title={"Êtes-vous sur de vouloir supprimer l'image ?"}
                                            confirmLabel="Supprimer l'image"
                                            onClose={() => {
                                                setIsModalOpen(false);
                                            }}
                                            onConfirm={() => {
                                                handleDelete();
                                                setIsModalOpen(false);
                                            }}
                                        ></Modal>
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
