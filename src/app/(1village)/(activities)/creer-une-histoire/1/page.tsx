import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';

import AddIcon from '@mui/icons-material/Add';
import { Grid, ButtonBase, FormControl, FormHelperText, InputLabel, MenuItem, Select } from '@mui/material';

import { isStory } from 'src/activity-types/anyActivity';
import { DEFAULT_STORY_DATA, ODD_CHOICE } from 'src/activity-types/story.constants';
import { KeepRatio } from 'src/components/KeepRatio';
import { Steps } from 'src/components/Steps';
import { StepsButton } from 'src/components/StepsButtons';
import { ImageModal } from 'src/components/activities/content/editors/ImageEditor/ImageModal';
import { BackButton } from 'src/components/buttons/BackButton';
import { DeleteButton } from 'src/components/buttons/DeleteButton';
import { useImageStoryRequests } from 'src/services/useImagesStory';
import { primaryColor, bgPage, errorColor } from 'src/styles/variables.const';
import { ActivityStatus, ActivityType } from 'types/activity.type';
import type { StoriesData } from 'types/story.type';
import { ActivityContext } from '@frontend/contexts/activityContext';
import { Title } from '@frontend/components/ui/Title';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { VillageContext } from '@frontend/contexts/villageContext';
import { ChevronRightIcon } from '@radix-ui/react-icons';
import { Button } from '@frontend/components/ui/Button';

const StoryStep1 = () => {
    const { activity, createNewActivity, setActivity } = useContext(ActivityContext);
    if (!activity || activity.type !== 'libre') {
        return null;
    }

    const { selectedPhase } = useContext(VillageContext);
    const { deleteStoryImage } = useImageStoryRequests();
    const [isError, setIsError] = useState<boolean>(false);
    const [isImageModalOpen, setIsImageModalOpen] = React.useState(false);
    const [oDDChoice, setODDChoice] = useState('');
    const data = (activity?.data as StoriesData) || { odd: ODD_CHOICE[0] };
    const isEdit = activity !== null && activity?.status !== ActivityStatus.DRAFT;

    // Create the story activity.
    const created = React.useRef(false);
    useEffect(() => {
        if (!created.current) {
            if (!('edit' in router.query) || (activity && !isStory(activity))) {
                created.current = true;
                createNewActivity(
                    ActivityType.STORY,
                    selectedPhase,
                    undefined,
                    {
                        ...DEFAULT_STORY_DATA,
                    },
                    null,
                    null,
                    undefined,
                );
            }
        }
    }, [activity, createNewActivity, router.query, selectedPhase]);

    // Update the "odd step" image url, when upload an image.
    const setImage = (imageUrl: string) => {
        const { odd } = data;
        setActivity({ data: { ...data, odd: { ...odd, inspiredStoryId: activity?.id, imageUrl, imageId: 0 } } });
    };

    useEffect(() => {
        // if user navigated to the next step already, let's show the errors if there are any.
        if (window.sessionStorage.getItem(`story-step-1-next`) === 'true') {
            setIsError(true);
            window.sessionStorage.setItem(`story-step-1-next`, 'false');
        }
    }, []);

    return (
        <PageContainer>
            <BackButton href="/creer-une-histoire" />
            <Steps
                steps={['ODD', 'Objet', 'Lieu', 'Histoire', 'Prévisualisation']}
                urls={[
                    '/creer-une-histoire/1?edit',
                    '/creer-une-histoire/2',
                    '/creer-une-histoire/3',
                    '/creer-une-histoire/4',
                    '/creer-une-histoire/5',
                ]}
                activeStep={0}
            />
            <div className="width-900">
                <Title variant="h1" marginBottom="md">
                    Choisissez et dessinez l'objectif du développement durable à atteindre
                </Title>
                <Grid container>
                    <Grid item xs={12} md={6}>
                        <div style={{ marginTop: '1.5rem' }}>
                            <div style={{ width: '100%', maxWidth: '320px', marginTop: '1rem', position: 'relative' }}>
                                <ButtonBase
                                    onClick={() => setIsImageModalOpen(true)}
                                    style={{ width: '100%', color: `${isError ? errorColor : primaryColor}` }}
                                >
                                    <KeepRatio ratio={2 / 3} width="100%">
                                        <div
                                            style={{
                                                height: '100%',
                                                width: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                border: `1px solid ${isError ? errorColor : primaryColor}`,
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
                                    </KeepRatio>
                                </ButtonBase>
                                {data.odd?.imageUrl && (
                                    <div style={{ position: 'absolute', top: '0.25rem', right: '0.25rem' }}>
                                        <DeleteButton
                                            onDelete={() => {
                                                deleteStoryImage(data.odd.imageId, data, 3);
                                                setImage('');
                                            }}
                                            confirmLabel="Êtes-vous sur de vouloir supprimer l'image ?"
                                            confirmTitle="Supprimer l'image"
                                            style={{ backgroundColor: bgPage }}
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
                                        setActivity({ data: { ...data, odd: { ...odd, description: event.target.value } } });
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
                    </Grid>
                </Grid>
            </div>
            <div style={{ textAlign: 'right', marginTop: '16px' }}>
                <Button as="a" href="/creer-une-histoire/2" color="primary" label="Étape suivante" rightIcon={<ChevronRightIcon />}></Button>
            </div>
        </PageContainer>
    );
};

export default StoryStep1;
