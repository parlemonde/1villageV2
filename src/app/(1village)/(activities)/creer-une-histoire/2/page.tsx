import { DeleteButton } from '@frontend/components/activities/DeleteButton/DeleteButton';
import { useImageStoryRequests } from '@frontend/components/activities/useImagesStory';
import { Button, IconButton } from '@frontend/components/ui/Button';
import { Field, TextArea } from '@frontend/components/ui/Form';
import { Modal } from '@frontend/components/ui/Modal';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Steps } from '@frontend/components/ui/Steps';
import { UploadImageModal } from '@frontend/components/upload/UploadImageModal';
import { ActivityContext } from '@frontend/contexts/activityContext';
import { ChevronLeftIcon, ChevronRightIcon, Pencil1Icon } from '@radix-ui/react-icons';
import type { ActivityData } from '@server/database/schemas/activity-types';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { AspectRatio } from 'radix-ui';
import React, { useContext, useState } from 'react';

const StoryStep2 = () => {
    const router = useRouter();
    const { activity, setActivity, getOrCreateDraft } = useContext(ActivityContext);
    const { deleteStoryImage } = useImageStoryRequests();
    const data = (activity?.data as ActivityData<'histoire'>) || null;
    const [isUploadImageModalOpen, setIsUploadImageModalOpen] = useState(false);
    const [isError] = useState<boolean>(false);

    /* const errorSteps = React.useMemo(() => {
        if (data !== null) {
            return getErrorSteps(data.odd, 1);
        }
        return [];
    }, [data]); */

    React.useEffect(() => {
        if (activity === null && !('activity-id' in router.query) && !sessionStorage.getItem('activity')) {
            router.push('/creer-une-histoire');
        } else if (activity && !(activity.type === 'histoire')) {
            router.push('/creer-une-histoire');
        }
    }, [activity, router]);

    /* const dataChange = (key: keyof StoryElement) => (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value.slice(0, 400);
        const { object } = data;
        const newData = { ...data, object: { ...object, [key]: value } };
        setActivity({ data: newData });
    }; */

    // Update the "object step" image url, when upload an image.
    const setImage = (imageUrl: string) => {
        const { object } = data;
        // imageId = 0 when we are changing the image of the object step.
        setActivity({ data: { ...data, object: { ...object, imageUrl, imageId: 0 } } });
    };

    /* const onNext = () => {
        onPublishActivity().catch(console.error);
        router.push('/creer-une-histoire/3');
    }; */

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
                /*errorSteps={errorSteps}*/
            />
            <div className="width-900">
                <h1>Imaginez et dessinez votre objet magique</h1>
                <p className="text">
                    Grâce à ses pouvoirs, votre objet magique doit permettre d’atteindre l’objectif du développement durable que vous avez choisi à
                    l’étape précédente.
                </p>
                <div className="grid-container">
                    <div style={{ marginTop: '1.5rem' }}>
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
                                            border: `1px solid 'var(--primary-color)'`,
                                            borderRadius: '10px',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        {data?.object?.imageUrl ? (
                                            <Image layout="fill" objectFit="cover" alt="image de l'objet" src={data?.object?.imageUrl} unoptimized />
                                        ) : (
                                            <>
                                                <IconButton as="a" href="" variant="borderless" color="primary" icon={Pencil1Icon} />
                                            </>
                                        )}
                                    </div>
                                </AspectRatio.Root>
                            </div>
                        </div>
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
                        <UploadImageModal
                            isOpen={isUploadImageModalOpen}
                            initialImageUrl={data?.object?.imageUrl || ''}
                            onClose={() => setIsUploadImageModalOpen(false)}
                            getActivityId={getOrCreateDraft}
                        />
                    </div>
                    {/* <TextField
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
                        }} /> */}
                    <Field
                        helperText={'Écrivez la description de votre image !'}
                        name="standard-multiline-static"
                        label="Décrivez l’objet magique"
                        input={
                            <TextArea
                                id="title"
                                name="title"
                                isFullWidth
                                placeholder="Écrivez la description de votre image !"
                                value={data?.object?.description || ''}
                                onChange={(e) => setActivity({ ...activity, data: { ...activity.data, title: e.target.value } })}
                                style={{ width: '100%', marginTop: '25px', color: 'primary' }}
                                //maxLength: 400,
                            />
                        }
                        marginBottom="md"
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
                </div>
            </div>
            {/* <StepsButton prev={`/creer-une-histoire/1?edit=${activity.id}`} next={onNext} /> */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '32px 0' }}>
                <Button
                    as="a"
                    href="/creer-une-histoire/1"
                    color="primary"
                    variant="outlined"
                    label="Étape précédente"
                    leftIcon={<ChevronLeftIcon />}
                />
                <Button
                    as="a"
                    href="/creer-une-histoire/3"
                    color="primary"
                    variant="outlined"
                    label="Étape suivante"
                    leftIcon={<ChevronRightIcon />}
                />
            </div>
        </PageContainer>
    );
};
export default StoryStep2;
