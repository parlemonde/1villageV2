import type { ActivityContentViewProps } from '@frontend/components/activities/ActivityView/activity-view.types';
import type { ChallengeType } from '@server/database/schemas/activity-types';

import { CulinaryChallengeView } from './challenge/CulinaryChallengeView';
import { EcologicalChallengeView } from './challenge/EcologicalChallengeView';
import { FreeThemeChallengeView } from './challenge/FreeThemeChallengeView';
import { LinguisticChallengeView } from './challenge/LinguisticChallengeView';

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
