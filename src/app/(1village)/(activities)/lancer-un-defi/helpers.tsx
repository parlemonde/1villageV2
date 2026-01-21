import { ChallengeType } from "@server/database/schemas/activity-types"

export const getChallengeFormRoute = (challengeType?: ChallengeType) => {
    if (!challengeType) {
        return '/lancer-un-defi';
    }
    
    const routes: Record<ChallengeType, string> = {
        linguistique: '/lancer-un-defi/linguistique',
        libre: '/lancer-un-defi',
        ecologique: '/lancer-un-defi/ecologique',
        culinaire: '/lancer-un-defi/culinaire',
    }
    
    const route = routes[challengeType];
    return `${route}/1`;
}