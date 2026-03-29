import { AnthemProvider } from '@app/admin/create/hymne/anthemContext';
import { db } from '@server/database/database';
import { activities, type Activity } from '@server/database/schemas/activities';
import type { AnthemActivity } from '@server/database/schemas/activity-types';
import { eq } from 'drizzle-orm';

// use typescript to avoid mismatch
const anthemActivityType: AnthemActivity['type'] = 'hymne';

export default async function AnthemLayout({ children }: { children: React.ReactNode }) {
    // There should be only one anthem activity for all villages.
    const anthemActivity = (await db.query.activities.findFirst({
        where: eq(activities.type, anthemActivityType),
    })) as Activity | undefined;
    return (
        <AnthemProvider
            activityId={anthemActivity && anthemActivity.type === anthemActivityType ? anthemActivity.id : undefined}
            initialAnthemActivity={
                anthemActivity && anthemActivity.type === anthemActivityType
                    ? {
                          type: anthemActivityType,
                          data: anthemActivity.data,
                      }
                    : undefined
            }
        >
            {children}
        </AnthemProvider>
    );
}
