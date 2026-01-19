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
import { primaryColor, bgPage } from 'src/styles/variables.const';
import type { StoriesData, TaleElement } from 'types/story.type';

const StoryStep4 = () => {
  const router = useRouter();
  const { activity, updateActivity, save } = React.useContext(ActivityContext);
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
    } else if (activity && !isStory(activity)) {
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

  if (data === null || activity === null || !isStory(activity)) {
    return <div></div>;
  }

  return (
    <Base>
      <PageLayout>
        <Steps
          steps={['ODD', 'Objet', 'Lieu', 'Histoire', 'Prévisualisation']}
          urls={['/creer-une-histoire/1?edit', '/creer-une-histoire/2', '/creer-une-histoire/3', '/creer-une-histoire/4', '/creer-une-histoire/5']}
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
                      {data.tale?.imageStory ? (
                        <Image layout="fill" objectFit="cover" alt="image de l'histoire" src={data.tale?.imageStory} unoptimized />
                      ) : (
                        <AddIcon style={{ fontSize: '80px' }} />
                      )}
                    </div>
                  </KeepRatio>
                </ButtonBase>
                {data.tale?.imageStory && (
                  <div style={{ position: 'absolute', top: '0.25rem', right: '0.25rem' }}>
                    <DeleteButton
                      onDelete={() => {
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
      </PageLayout>
    </Base>
  );
};

export default StoryStep4;
