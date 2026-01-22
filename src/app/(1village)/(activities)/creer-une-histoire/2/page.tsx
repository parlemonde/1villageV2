import { DeleteButton } from '@frontend/components/activities/DeleteButton/DeleteButton';
import { Modal } from '@frontend/components/ui/Modal';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Steps } from '@frontend/components/ui/Steps';
import { ActivityContext } from '@frontend/contexts/activityContext';
import type { ActivityData } from '@server/database/schemas/activity-types';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { AspectRatio } from 'radix-ui';
import React, { useContext, useState } from 'react';

const StoryStep2 = () => {
    const router = useRouter();
    const { activity, onUpdateActivity, onPublishActivity } = useContext(ActivityContext);
    const { deleteStoryImage } = useImageStoryRequests();
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const data = (activity?.data as ActivityData<'histoire'>) || null;

    const errorSteps = React.useMemo(() => {
        if (data !== null) {
            return getErrorSteps(data.odd, 1);
        }
        return [];
    }, [data]);

    React.useEffect(() => {
        if (activity === null && !('activity-id' in router.query) && !sessionStorage.getItem('activity')) {
            router.push('/creer-une-histoire');
        } else if (activity && !(activity.type === 'histoire')) {
            router.push('/creer-une-histoire');
        }
    }, [activity, router]);

    const dataChange = (key: keyof StoryElement) => (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value.slice(0, 400);
        const { object } = data;
        const newData = { ...data, object: { ...object, [key]: value } };
        onUpdateActivity({ data: newData });
    };

    // Update the "object step" image url, when upload an image.
    const setImage = (imageUrl: string) => {
        const { object } = data;
        // imageId = 0 when we are changing the image of the object step.
        //onUpdateActivity({ data: { ...data, object: { ...object, imageUrl, imageId: 0 } } });
        onUpdateActivity();
    };

    const onNext = () => {
        onPublishActivity().catch(console.error);
        router.push('/creer-une-histoire/3');
    };

    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleDelete = () => {
        deleteStoryImage(data.odd.imageId, data, 1);
        setImage('');
    };

    if (data === null || activity === null || !(activity?.type === 'histoire')) {
        return <div></div>;
    }
    return (
        <PageContainer>
            <Steps
                steps={[
                    { label: 'ODD', href: '/creer-une-histoire/1?edit' },
                    { label: 'Objet', href: '/creer-une-histoire/2' },
                    { label: 'Lieu', href: '/creer-une-histoire/3' },
                    { label: 'Histoire', href: '/creer-une-histoire/4' },
                    { label: 'Prévisualisation', href: '/creer-une-histoire/5' },
                ]}
                activeStep={1}
                errorSteps={errorSteps}
            />
            <div className="width-900">
                <h1>Imaginez et dessinez votre objet magique</h1>
                <p className="text">
                    Grâce à ses pouvoirs, votre objet magique doit permettre d’atteindre l’objectif du développement durable que vous avez choisi à
                    l’étape précédente.
                </p>
                <Grid container>
                    <Grid item xs={12} md={6}>
                        <div style={{ marginTop: '1.5rem' }}>
                            <div style={{ width: '100%', maxWidth: '320px', marginTop: '1rem', position: 'relative' }}>
                                <ButtonBase onClick={() => setIsImageModalOpen(true)} style={{ width: '100%', color: 'var(--primary-color)' }}>
                                    <div style={{ width: '100%' }}>
                                        <AspectRatio.Root ratio={2 / 3}>
                                            <div
                                                style={{
                                                    height: '100%',
                                                    width: '100%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    border: `1px solid 'var(--primary-color)'`,
                                                    borderRadius: '10px',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                {data?.object?.imageUrl ? (
                                                    <Image
                                                        layout="fill"
                                                        objectFit="cover"
                                                        alt="image de l'objet"
                                                        src={data?.object?.imageUrl}
                                                        unoptimized
                                                    />
                                                ) : (
                                                    <AddIcon style={{ fontSize: '80px' }} />
                                                )}
                                            </div>
                                        </AspectRatio.Root>
                                    </div>
                                </ButtonBase>
                                {data?.object?.imageUrl && (
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
                                    imageUrl={data?.object?.imageUrl || ''}
                                    setImageUrl={setImage}
                                />
                            </div>
                        </div>
                        <TextField
                            helperText={'Écrivez la description de votre image !'}
                            id="standard-multiline-static"
                            label="Décrivez l’objet magique"
                            value={data?.object?.description || ''}
                            onChange={dataChange('description')}
                            variant="outlined"
                            multiline
                            maxRows={4}
                            style={{ width: '100%', marginTop: '25px', color: 'primary' }}
                            inputProps={{
                                maxLength: 400,
                            }}
                        />
                        {data?.object?.description ? (
                            <div style={{ width: '100%', textAlign: 'right' }}>
                                <span className="text text--small">{data.object.description.length}/400</span>
                            </div>
                        ) : (
                            <div style={{ width: '100%', textAlign: 'right' }}>
                                <span className="text text--small">0/400</span>
                            </div>
                        )}
                    </Grid>
                </Grid>
            </div>
            <StepsButton prev={`/creer-une-histoire/1?edit=${activity.id}`} next={onNext} />
        </PageContainer>
    );
};
export default StoryStep2;
