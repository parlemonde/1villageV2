import Image from 'next/image';
import { useRouter } from 'next/router';
import React from 'react';

import AddIcon from '@mui/icons-material/Add';
import { TextField, Grid, ButtonBase } from '@mui/material';

import { isStory } from 'src/activity-types/anyActivity';
import { Base } from 'src/components/Base';
import { KeepRatio } from 'src/components/KeepRatio';
import { PageLayout } from 'src/components/PageLayout';
import { Steps } from 'src/components/Steps';
import { StepsButton } from 'src/components/StepsButtons';
import { ImageModal } from 'src/components/activities/content/editors/ImageEditor/ImageModal';
import { getErrorSteps } from 'src/components/activities/storyChecks';
import { DeleteButton } from 'src/components/buttons/DeleteButton';
import { ActivityContext } from 'src/contexts/activityContext';
import { useImageStoryRequests } from 'src/services/useImagesStory';
import { primaryColor, bgPage } from 'src/styles/variables.const';
import type { StoriesData, StoryElement } from 'types/story.type';

const StoryStep3 = () => {
  const router = useRouter();
  const { activity, updateActivity, save } = React.useContext(ActivityContext);
  const { deleteStoryImage } = useImageStoryRequests();
  const [isImageModalOpen, setIsImageModalOpen] = React.useState(false);
  const data = (activity?.data as StoriesData) || null;

  const errorSteps = React.useMemo(() => {
    const errors = [];
    if (data !== null) {
      if (getErrorSteps(data.odd, 1).length > 0) {
        errors.push(0);
      }
      if (getErrorSteps(data.object, 2).length > 0) {
        errors.push(1);
      }
      return errors;
    }
    return [];
  }, [data]);

  React.useEffect(() => {
    if (activity === null && !('activity-id' in router.query) && !sessionStorage.getItem('activity')) {
      router.push('/creer-une-histoire');
    } else if (activity && !isStory(activity)) {
      router.push('/creer-une-histoire');
    }
  }, [activity, router]);

  const dataChange = (key: keyof StoryElement) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.slice(0, 400);
    const { place } = data;
    const newData = { ...data, place: { ...place, [key]: value } };
    updateActivity({ data: newData });
  };

  // Update the "place step" image url, when upload an image.
  const setImage = (imageUrl: string) => {
    const { object, place } = data;
    // imageId = 0 when we are changing the image of the object step.
    updateActivity({
      data: {
        ...data,
        object: { ...object, inspiredStoryId: activity?.id },
        place: { ...place, inspiredStoryId: activity?.id, imageUrl, imageId: 0 },
        isOriginal: true,
      },
    });
  };

  const onNext = () => {
    save().catch(console.error);
    router.push('/creer-une-histoire/4');
  };

  if (data === null || activity === null || !isStory(activity)) {
    return <div></div>;
  }

  return (
    <Base>
      <PageLayout>
        <Steps
          steps={['ODD', 'Objet', 'Lieu', 'Histoire', 'Prévisualisation']}
          urls={['/creer-une-histoire/1?edit', '/creer-une-histoire/2', '/creer-une-histoire/3', '/creer-une-histoire/4', '/creer-une-histoire/5']}
          activeStep={2}
          errorSteps={errorSteps}
        />
        <div className="width-900">
          <h1>Imaginez et dessinez votre lieu extraordinaire</h1>
          <p className="text">
            Tout comme l’objet magique, ce lieu extraordinaire doit permettre d’atteindre l’objectif du développement durable que vous avez choisi à
            l’étape précédente.
          </p>
          <Grid container>
            <Grid item xs={12} md={6}>
              <div style={{ marginTop: '1.5rem' }}>
                <div style={{ width: '100%', maxWidth: '320px', marginTop: '1rem', position: 'relative' }}>
                  <ButtonBase onClick={() => setIsImageModalOpen(true)} style={{ width: '100%', color: `${primaryColor}` }}>
                    <KeepRatio ratio={2 / 3} width="100%">
                      <div
                        style={{
                          height: '100%',
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          border: `1px solid ${primaryColor}`,
                          borderRadius: '10px',
                          justifyContent: 'center',
                        }}
                      >
                        {data.place?.imageUrl ? (
                          <Image layout="fill" objectFit="cover" alt="image du lieu" src={data.place?.imageUrl} unoptimized />
                        ) : (
                          <AddIcon style={{ fontSize: '80px' }} />
                        )}
                      </div>
                    </KeepRatio>
                  </ButtonBase>
                  {data.place?.imageUrl && (
                    <div style={{ position: 'absolute', top: '0.25rem', right: '0.25rem' }}>
                      <DeleteButton
                        onDelete={() => {
                          deleteStoryImage(data.place.imageId, data, 2);
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
                    imageUrl={data.place?.imageUrl || ''}
                    setImageUrl={setImage}
                  />
                </div>
              </div>
              <TextField
                id="standard-multiline-static"
                label="Décrivez le lieu extraordinaire"
                value={data.place?.description || ''}
                onChange={dataChange('description')}
                variant="outlined"
                multiline
                maxRows={4}
                style={{ width: '100%', marginTop: '25px', color: 'primary' }}
                inputProps={{
                  maxLength: 400,
                }}
              />
              {data.place?.description ? (
                <div style={{ width: '100%', textAlign: 'right' }}>
                  <span className="text text--small">{data.place.description.length}/400</span>
                </div>
              ) : (
                <div style={{ width: '100%', textAlign: 'right' }}>
                  <span className="text text--small">0/400</span>
                </div>
              )}
            </Grid>
          </Grid>
        </div>
        <StepsButton prev={`/creer-une-histoire/2`} next={onNext} />
      </PageLayout>
    </Base>
  );
};

export default StoryStep3;
