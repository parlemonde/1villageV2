'use client';

import type { WorldStats } from '@app/api/statistics/world/route';
import { CircularProgress } from '@frontend/components/ui/CircularProgress';
import { Title } from '@frontend/components/ui/Title';
import { COUNTRIES } from '@lib/iso-3166-countries-french';
import { jsonFetcher } from '@lib/json-fetcher';
import { geoNaturalEarth1, geoPath } from 'd3-geo';
import { select } from 'd3-selection';
import { zoom, zoomIdentity } from 'd3-zoom';
import { useExtracted } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import useSWR from 'swr';

import styles from './world-map-activity.module.css';
import geoJson from '../../../../../public/static/earth/world.geo.json';

interface WorldMapActivityProps {
    setCountry: (country: string) => void;
}

export const WorldMapActivity = ({ setCountry }: WorldMapActivityProps) => {
    const t = useExtracted('WorldMapActivity');
    const { data: countriesStatus, isLoading } = useSWR<WorldStats[]>('/api/statistics/world', jsonFetcher);

    const [tooltipCountry, setTooltipCountry] = useState<string>('');
    const tooltipRef = useRef<HTMLDivElement>(null);

    const svgRef = useRef<SVGSVGElement>(null);
    const gRef = useRef<SVGGElement>(null);

    useEffect(() => {
        if (!svgRef.current || !gRef.current) {
            return;
        }

        const svg = select(svgRef.current);
        const g = select(gRef.current);
        const mapBounds = [
            [0, 0],
            [1000, 500],
        ] as [[number, number], [number, number]];

        const zoomBehavior = zoom<SVGSVGElement, unknown>()
            .scaleExtent([1, 10])
            .translateExtent(mapBounds)
            .on('zoom', (e) => {
                g.attr('transform', e.transform.toString());
            });

        svg.call(zoomBehavior).call(zoomBehavior.transform, zoomIdentity);
    }, []);

    const statusColors = {
        ghost: '#FFD678',
        observer: '#6082FC',
        active: '#4CC64A',
    };

    const projection = geoNaturalEarth1().fitSize([1000, 500], {
        type: 'FeatureCollection',
        features: geoJson.features.filter((f) => f.properties?.['name'] !== 'Antarctica'),
    } as GeoJSON.FeatureCollection<GeoJSON.Geometry>);

    const path = geoPath(projection);

    const statusByCountry = countriesStatus && Object.fromEntries(countriesStatus.map((c) => [c.country, c.status]));

    return (
        <div className={styles.container}>
            <div className={styles.mapContainer}>
                {isLoading && (
                    <div className={styles.loader}>
                        <CircularProgress />
                    </div>
                )}
                <svg ref={svgRef} className={styles.map} width="100%">
                    <rect width="300%" height="100%" fill="#a1e1ff" />
                    <g ref={gRef}>
                        {geoJson.features
                            ?.filter((f) => f.properties?.['name'] !== 'Antarctica')
                            .map((f) => {
                                const feature = f as GeoJSON.Feature<GeoJSON.Geometry>;
                                const country = feature.properties?.['iso_a2'];
                                const status = statusByCountry?.[country];
                                return (
                                    <path
                                        className={styles.country}
                                        key={feature.properties?.['name']}
                                        d={path(feature) ?? undefined}
                                        fill={status ? statusColors[status] : '#ffffff'}
                                        stroke="#979797"
                                        onMouseEnter={() => {
                                            setTooltipCountry(COUNTRIES[country] || '');
                                        }}
                                        onMouseMove={(e) => {
                                            if (tooltipRef.current) {
                                                tooltipRef.current.style.transform = `translate(${e.clientX + 5}px, ${e.clientY - 35}px)`;
                                            }
                                        }}
                                        onMouseLeave={() => setTooltipCountry('')}
                                        onClick={() => setCountry(country)}
                                    />
                                );
                            })}
                    </g>
                </svg>
                {tooltipCountry && (
                    <div ref={tooltipRef} className={styles.tooltip}>
                        <p>{tooltipCountry}</p>
                    </div>
                )}
            </div>
            <div className={styles.legend}>
                <Title variant="h3" marginBottom="md">
                    {t('Légende :')}
                </Title>
                <div className={styles.legendItem}>
                    <div className={styles.legendColor} style={{ backgroundColor: statusColors.active }} />
                    <p>
                        <span className={styles.legendLabel}>{t('Actif')}</span> : {t('la majorité des classes ont posté ces 3 dernières semaines')}
                    </p>
                </div>
                <div className={styles.legendItem}>
                    <div className={styles.legendColor} style={{ backgroundColor: statusColors.observer }} />
                    <p>
                        <span className={styles.legendLabel}>{t('Observateur')}</span> :{' '}
                        {t("la majorité des classes n'ont pas posté depuis 3 semaines")}
                    </p>
                </div>
                <div className={styles.legendItem}>
                    <div className={styles.legendColor} style={{ backgroundColor: statusColors.ghost }} />
                    <p>
                        <span className={styles.legendLabel}>{t('Fantôme')}</span> :{' '}
                        {t('la majorité des classes ne se sont pas connectées depuis 3 semaines')}
                    </p>
                </div>
            </div>
        </div>
    );
};
