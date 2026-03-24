'use client';
import type { ClassroomEngagement } from '@app/api/statistics/classrooms-engagement/route';
import { statusColors } from '@frontend/components/statistics/utils/statusColors';
import { CircularProgress } from '@frontend/components/ui/CircularProgress';
import { Title } from '@frontend/components/ui/Title';
import { getMarginAndPaddingStyle, type MarginProps } from '@frontend/components/ui/css-styles';
import { jsonFetcher } from '@lib/json-fetcher';
import { serializeToQueryUrl } from '@lib/serialize-to-query-url';
import { useExtracted } from 'next-intl';
import type { PieLabelRenderProps, PieSectorShapeProps } from 'recharts';
import { Pie, PieChart, Sector } from 'recharts';
import useSWR from 'swr';

import styles from './classroom-engagement-pie.module.css';

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value }: PieLabelRenderProps) => {
    if (cx == null || cy == null || innerRadius == null || outerRadius == null) {
        return null;
    }
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const ncx = Number(cx);
    const x = ncx + radius * Math.cos(-(midAngle ?? 0) * RADIAN);
    const ncy = Number(cy);
    const y = ncy + radius * Math.sin(-(midAngle ?? 0) * RADIAN);

    return (
        <text x={x} y={y} fill="black" textAnchor={x > ncx ? 'start' : 'end'} dominantBaseline="central">
            {value}
        </text>
    );
};

const colorScheme = (props: PieSectorShapeProps) => {
    return <Sector {...props} fill={statusColors[props.payload.status as keyof typeof statusColors]} />;
};

interface ClassroomsEngagementPieProps extends MarginProps {
    country: string;
    villageId: string;
    size?: number;
}

export const ClassroomsEngagementPie = ({ country, villageId, size = 400, ...props }: ClassroomsEngagementPieProps) => {
    const t = useExtracted('ClassroomsEngagementPie');

    const { data: classrooms, isLoading } = useSWR<ClassroomEngagement[]>(
        `/api/statistics/classrooms-engagement${serializeToQueryUrl({ country: country, villageId: villageId })}`,
        jsonFetcher,
    );

    return (
        <div className={styles.container} style={getMarginAndPaddingStyle(props)}>
            {isLoading && (
                <div className={styles.loader}>
                    <CircularProgress />
                </div>
            )}
            <style>
                {`
                    svg, g, path {
                        outline: none;
                    }
                    `}
            </style>
            <Title variant="h3">{t("Niveau d'engagement")}</Title>
            <PieChart responsive className={styles.pie} width={size} height={size}>
                <Pie
                    className={styles.pie}
                    data={classrooms}
                    dataKey="count"
                    nameKey="status"
                    label={renderCustomizedLabel}
                    shape={colorScheme}
                    labelLine={false}
                />
            </PieChart>
            <div className={styles.legend}>
                {classrooms?.some((classroom) => classroom.status === 'active') && (
                    <div className={styles.legendItem}>
                        <div className={styles.legendColor} style={{ backgroundColor: statusColors.active }} />
                        <span>{t('Actif')}</span>
                    </div>
                )}
                {classrooms?.some((classroom) => classroom.status === 'observer') && (
                    <div className={styles.legendItem}>
                        <div className={styles.legendColor} style={{ backgroundColor: statusColors.observer }} />
                        <span>{t('Observateur')}</span>
                    </div>
                )}
                {classrooms?.some((classroom) => classroom.status === 'ghost') && (
                    <div className={styles.legendItem}>
                        <div className={styles.legendColor} style={{ backgroundColor: statusColors.ghost }} />
                        <span>{t('Fantôme')}</span>
                    </div>
                )}
            </div>
        </div>
    );
};
