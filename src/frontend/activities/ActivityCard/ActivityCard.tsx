import type { Activity } from '@server/database/schemas/activities';

export const ActivityCard = ({ activity }: { activity: Activity }) => {
    return <div>{JSON.stringify(activity.content)}</div>;
};
