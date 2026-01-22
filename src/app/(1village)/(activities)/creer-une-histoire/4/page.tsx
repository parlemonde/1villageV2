import { DeleteButton } from '@frontend/components/activities/DeleteButton/DeleteButton';
import { Modal } from '@frontend/components/ui/Modal';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { ActivityContext } from '@frontend/contexts/activityContext';
import type { ActivityData } from '@server/database/schemas/activity-types';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { AspectRatio } from 'radix-ui';
import React, { useState } from 'react';

const StoryStep4 = () => {
    const router = useRouter();
    const { activity, updateActivity, save } = React.useContext(ActivityContext);
    const [isImageModalOpen, setIsImageModalOpen] = React.useState(false);
    const data = (activity?.data as ActivityData<'histoire'>) || null;

    const errorSteps = React.useMemo(() => {
        const errors = [];
        if (data !== null) {
            if (getErrorSteps(data.odd, 1).length > 0) {
                errors.push(0);
            }
            if (getErrorSteps(data.object, 2).length > 0) {
                errors.push(1);
            }
            if (getErrorSteps(data.place, 3).length > 0) {
                errors.push(2);
            }
            return errors;
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

    const dataChange = (key: keyof TaleElement) => (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        const { tale } = data;
        const newData = { ...data, tale: { ...tale, [key]: value } };
        updateActivity({ data: newData });
    };

    // Update the "object step" image url, when upload an image.
    const setImage = (imageStory: string) => {
        const { tale } = data;
        updateActivity({ data: { ...data, tale: { ...tale, imageStory } } });
    };

    const onNext = () => {
        save().catch(console.error);
        router.push('/creer-une-histoire/5');
    };

    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleDelete = () => {
        setImage('');
    };

    if (data === null || activity === null || !(activity.type === 'histoire')) {
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
                activeStep={3}
                errorSteps={errorSteps}
            />
            <div className="width-900">
                <h1>Décrivez et dessinez votre village-monde idéal</h1>
                <p className="text">
                    Racontez aux pélicopains à quoi ressemble votre village-monde idéal, comment il fonctionne et comment il atteint l’objectif du
                    développement durable que vous avez choisi.
                </p>
                <Grid container>
                    <Grid item xs={12} md={6}>
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
                                            {data.tale?.imageStory ? (
                                                <Image
                                                    layout="fill"
                                                    objectFit="cover"
                                                    alt="image de l'histoire"
                                                    src={data.tale?.imageStory}
                                                    unoptimized
                                                />
                                            ) : (
                                                <AddIcon style={{ fontSize: '80px' }} />
                                            )}
                                        </div>
                                    </AspectRatio.Root>
                                </div>
                            </ButtonBase>
                            {data.tale?.imageStory && (
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
                                imageUrl={data.tale?.imageStory || ''}
                                setImageUrl={setImage}
                            />
                        </div>
                    </Grid>
                    <TextField
                        id="standard-multiline-static"
                        label="Ecrivez l’histoire de votre village-monde idéal"
                        rows={8}
                        multiline
                        value={data.tale?.tale || ''}
                        onChange={dataChange('tale')}
                        variant="outlined"
                        style={{ width: '100%', marginTop: '25px', color: 'primary' }}
                    />
                </Grid>
            </div>
            <StepsButton prev="/creer-une-histoire/3" next={onNext} />
        </PageContainer>
    );
};

export default StoryStep4;
