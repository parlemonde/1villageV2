import type { ActivityContentViewProps } from '@frontend/components/activities/ActivityView/activity-view.types';

import { CulinaryChallengeView } from './ChallengeViews/CulinaryChallengeView';
import { EcologicalChallengeView } from './ChallengeViews/EcologicalChallengeView';
import { FreeThemeChallengeView } from './ChallengeViews/FreeThemeChallengeView';
import { LinguisticChallengeView } from './ChallengeViews/LinguisticChallengeView';
import { ChallengeType } from '@server/database/schemas/activity-types';

const CONTENT_VIEWS: Record<ChallengeType, React.FC<ActivityContentViewProps>> = {
    linguistique: LinguisticChallengeView,
    libre: FreeThemeChallengeView,
    ecologique: EcologicalChallengeView,
    culinaire: CulinaryChallengeView,
};

export const ChallengeView = ({ activity }: ActivityContentViewProps) => {
    if (activity.type !== 'defi' || !activity?.data?.theme) {
        return null;
    }

    const Content = CONTENT_VIEWS[activity.data.theme];
    if (Content) {
        return <Content activity={activity} />;
    }
};
