import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';

import { Tooltip, Button, Backdrop, CircularProgress } from '@mui/material';

import { isStory } from 'src/activity-types/anyActivity';
import { Base } from 'src/components/Base';
import { ImageStepContainer } from 'src/components/FinalStep/ImageStepContainer';
import { PageLayout } from 'src/components/PageLayout';
import { Steps } from 'src/components/Steps';
import { StepsButton } from 'src/components/StepsButtons';
import { getErrorSteps } from 'src/components/activities/storyChecks';
import { ActivityContext } from 'src/contexts/activityContext';
import { UserContext } from 'src/contexts/userContext';
import { ActivityStatus, ActivityType } from 'types/activity.type';
import type { StoriesData } from 'types/story.type';
import { UserType } from 'types/user.type';

const StoryStep5 = () => {
  const router = useRouter();
  const { activity, save, updateActivity } = React.useContext(ActivityContext);
  const { user } = React.useContext(UserContext);
  const [isLoading, setIsLoading] = React.useState(false);
  const data = (activity?.data as StoriesData) || null;
  const isEdit = activity !== null && activity.status !== ActivityStatus.DRAFT;
  const isObservator = user?.type === UserType.OBSERVATOR;

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
      if (getErrorSteps(data.tale, 4).length > 0) {
        errors.push(3);
      }
      return errors;
    }
    return [];
  }, [data]);

  const isValid = errorSteps.length === 0;

  React.useEffect(() => {
    if (activity === null && !('activity-id' in router.query) && !sessionStorage.getItem('activity')) {
      router.push('/creer-une-histoire');
    } else if (activity && !isStory(activity) && activity.type !== ActivityType.STORY) {
      router.push('/creer-une-histoire');
    }
  }, [activity, router]);

  // useEffect here to update inspiredStoryId if equal to 0
  React.useEffect(() => {
    if (data !== null && (data.odd.inspiredStoryId === 0 || data.object.inspiredStoryId === 0 || data.place.inspiredStoryId === 0)) {
      updateActivity({
        data: {
          ...data,
          odd: { ...data.odd, inspiredStoryId: activity?.id },
          object: { ...data.object, inspiredStoryId: activity?.id },
          place: { ...data.place, inspiredStoryId: activity?.id },
        },
      });
    }
  }, [activity?.id, data, updateActivity]);

  const onPublish = async () => {
    window.sessionStorage.setItem(`story-step-1-next`, 'false');
    setIsLoading(true);
    const success = await save(true);
    if (success) {
      router.push('/creer-une-histoire/success');
    }
    setIsLoading(false);
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
          activeStep={4}
          errorSteps={errorSteps}
        />

        <div className="width-900">
          <h1>Pré-visualisez votre histoire{!isEdit && ' et publiez-la'}</h1>
          <p className="text" style={{ fontSize: '1.1rem' }}>
            Relisez votre publication une dernière fois avant de la publier !
          </p>

          {isEdit ? (
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', margin: '1rem 0' }}>
              <Link href="/creer-une-histoire/2" passHref>
                <Button component="a" color="secondary" variant="contained" href="/creer-une-histoire/2">
                  {"Modifier à l'étape précédente"}
                </Button>
              </Link>
              <Button variant="outlined" color="primary" onClick={onPublish} disabled={isObservator || !isValid}>
                Enregistrer les changements
              </Button>
            </div>
          ) : (
            <>
              {!isValid && (
                <p>
                  <b>Avant de publier votre histoire, il faut corriger les étapes incomplètes, marquées en orange.</b>
                </p>
              )}
              <div style={{ width: '100%', textAlign: 'right', margin: '1rem 0' }}>
                {isObservator ? (
                  <Tooltip title="Action non autorisée" arrow>
                    <span>
                      <Button variant="outlined" color="primary" disabled>
                        Publier
                      </Button>
                    </span>
                  </Tooltip>
                ) : (
                  <Button variant="outlined" color="primary" onClick={onPublish} disabled={!isValid}>
                    Publier
                  </Button>
                )}
              </div>
            </>
          )}

          {/* ODD */}
          <ImageStepContainer
            urlStep={`/creer-une-histoire/1?edit=${activity.id}`}
            imageUrl={data.odd?.imageUrl}
            isValid={isValid}
            error={errorSteps.includes(0)}
            description={data.odd?.description}
          />
          {/* Object */}
          <ImageStepContainer
            urlStep={`/creer-une-histoire/2`}
            imageUrl={data.object?.imageUrl}
            isValid={isValid}
            error={errorSteps.includes(1)}
            description={data.object?.description}
          />

          {/* Place */}
          <ImageStepContainer
            urlStep={`/creer-une-histoire/3`}
            imageUrl={data.place?.imageUrl}
            isValid={isValid}
            error={errorSteps.includes(1)}
            description={data.place?.description}
          />

          {/* Tale */}
          <ImageStepContainer
            urlStep={`/creer-une-histoire/4`}
            imageUrl={data.tale?.imageStory}
            isValid={isValid}
            error={errorSteps.includes(3)}
            description={data.tale?.tale}
          />
          <StepsButton prev="/creer-une-histoire/4" />
        </div>
      </PageLayout>
      <Backdrop style={{ zIndex: 2000, color: 'white' }} open={isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </Base>
  );
};

export default StoryStep5;
