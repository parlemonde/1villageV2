import { ActivityView } from '@frontend/components/activities/ActivityView';
import { Link } from '@frontend/components/navigation/Link';
import HomeSVG from '@frontend/svg/navigation/home.svg';
import { ChevronRightIcon } from '@radix-ui/react-icons';
import { db } from '@server/database';
import { activities } from '@server/database/schemas/activities';
import type { Activity, ActivityType } from '@server/database/schemas/activities';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';

import styles from './page.module.css';

const TITLES: Record<ActivityType, string> = {
    libre: 'Publication',
    enigme: 'Énigme',
    jeu: 'Jeu',
};

interface ServerPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
    params: Promise<{ [key: string]: string }>;
}

const getActivityId = (param: string) => {
    const activityId = Number(param);
    if (isNaN(activityId) || !isFinite(activityId) || !Number.isInteger(activityId)) {
        return null;
    }
    return activityId;
};

export default async function ActivityPage({ params }: ServerPageProps) {
    const activityId = getActivityId((await params).id);
    const activity =
        activityId !== null
            ? ((await db.query.activities.findFirst({
                  where: eq(activities.id, activityId),
              })) as Activity | undefined)
            : undefined;

    if (!activity) {
        notFound();
    }

    return (
        <div style={{ padding: '16px' }}>
            <div className={styles.breadcrumb}>
                <Link href="/" className={styles.homeBreadcrumbItem}>
                    <HomeSVG width={16} height={16} />
                    <span>Accueil</span>
                </Link>
                <ChevronRightIcon width={20} height={20} />
                <span className={styles.activityBreadcrumbItem}>
                    Activité - {activity.type === 'libre' && activity.isPelico ? 'Message de Pélico' : TITLES[activity.type]}
                </span>
            </div>
            <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
                <ActivityView activity={activity} />
            </div>
        </div>
    );
}
