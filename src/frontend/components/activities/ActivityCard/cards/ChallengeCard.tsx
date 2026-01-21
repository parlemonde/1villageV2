import type { ActivityContentCardProps } from '@frontend/components/activities/ActivityCard/activity-card.types';
import { Button } from '@frontend/components/ui/Button';

import { CulinaryChallengeCard } from './ChallengeCards/CulinaryChallengeCard';
import { EcologicalChallengeCard } from './ChallengeCards/EcologicalChallengeCard';
import { FreeThemeChallengeCard } from './ChallengeCards/FreeThemeChallengeCard';
import { LinguisticChallengeCard } from './ChallengeCards/LinguisticChallengeCard';
import { ChallengeType } from '@server/database/schemas/activity-types';

export const ChallengeCard = ({ activity, shouldDisableButtons, onEdit, onDelete }: ActivityContentCardProps) => {
    if (activity.type !== 'defi') {
        return null;
    }

    const CHALLENGE_CARDS: Record<ChallengeType, React.FC<ActivityContentCardProps>> = {
        ecologique: EcologicalChallengeCard,
        linguistique: LinguisticChallengeCard,
        culinaire: CulinaryChallengeCard,
        libre: FreeThemeChallengeCard,
    };

    if (activity?.data?.theme) {
        const ChallengeCard = CHALLENGE_CARDS[activity.data.theme];
        if (ChallengeCard) {
            return (
                <>
                    <ChallengeCard activity={activity} onEdit={onEdit} onDelete={onDelete} shouldDisableButtons={shouldDisableButtons} />

                    <div style={{ textAlign: 'right' }}>
                        {onEdit || onDelete ? (
                            <>
                                {onEdit && <Button label="Modifier" variant="contained" color="secondary" onClick={onEdit} />}
                                {onDelete && <Button marginLeft="sm" label="Supprimer" variant="contained" color="error" onClick={onDelete} />}
                            </>
                        ) : (
                            <Button
                                as={shouldDisableButtons ? 'button' : 'a'}
                                disabled={shouldDisableButtons}
                                href={shouldDisableButtons ? undefined : `/activities/${activity.id}`}
                                color="primary"
                                variant="outlined"
                                label="Relever le défi"
                            />
                        )}
                    </div>
                </>
            );
        }
    }
};
