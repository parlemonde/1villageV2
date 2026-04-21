'use client';

import { ActivityCard } from '@frontend/components/activities/ActivityCard/ActivityCard';
import type { ActivityContentCardProps } from '@frontend/components/activities/ActivityCard/activity-card.types';
import { HtmlViewerText } from '@frontend/components/html/HtmlViewer/HtmlViewer';
import { Button } from '@frontend/components/ui/Button';
import { VillageContext } from '@frontend/contexts/villageContext';
import ReplyArrow from '@frontend/svg/replyArrow.svg';
import type { ReactionActivityDto } from '@server/database/schemas/activity-types';
import { useExtracted } from 'next-intl';
import { useContext, useState, useRef, useEffect } from 'react';

export const ReactionCard = ({ activity, onEdit, onDelete, shouldDisableButtons, children }: ActivityContentCardProps) => {
    const t = useExtracted('ReactionCard');
    const [isExpanded, setIsExpanded] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);
    const [contentHeight, setContentHeight] = useState(0);

    const { usersMap, classroomsMap } = useContext(VillageContext);

    useEffect(() => {
        if (contentRef.current) {
            setContentHeight(contentRef.current.scrollHeight);
        }
    }, [isExpanded]);

    const reaction = activity as ReactionActivityDto;
    if (!activity || activity.type !== 'reaction' || !reaction.data?.activityBeingReacted) {
        return null;
    }

    const firstImageUrl = (activity.data?.content || []).find((content) => content.type === 'image')?.imageUrl;
    const firstHtmlText = (activity.data?.content || []).find((content) => content.type === 'html')?.html;

    return (
        <>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'stretch' }}>
                {firstImageUrl && (
                    <div
                        style={{
                            width: '24%',
                            minWidth: '150px',
                            minHeight: '150px',
                            position: 'relative',
                        }}
                    >
                        <div
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'var(--grey-100)',
                                backgroundImage: `url(${firstImageUrl})`,
                                backgroundSize: 'contain',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat',
                            }}
                        />
                    </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingRight: '4px' }}>
                    <p
                        style={{
                            fontSize: '15px',
                            lineHeight: '1.3',
                            overflow: 'hidden',
                            position: 'relative',
                            textAlign: 'justify',
                            maxHeight: 4 * 15 * 1.3,
                            wordWrap: 'break-word',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 4,
                            WebkitBoxOrient: 'vertical',
                        }}
                    >
                        <HtmlViewerText content={firstHtmlText} />
                    </p>
                </div>
            </div>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'start',
                    marginTop: '8px',
                }}
            >
                <Button
                    color="primary"
                    label={isExpanded ? t("Masquer l'activité d'origine") : t("Voir l'activité d'origine")}
                    onClick={() => setIsExpanded(!isExpanded)}
                    variant="borderless"
                    leftIcon={
                        <ReplyArrow
                            width={20}
                            height={20}
                            style={{
                                transform: isExpanded ? 'rotate(-90deg)' : 'rotate(0deg)',
                                transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            }}
                        />
                    }
                />
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                    {children}
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
                            label={t('Voir la réaction')}
                        />
                    )}
                </div>
            </div>
            <div
                style={{
                    height: isExpanded ? `${contentHeight}px` : '0px',
                    overflow: 'hidden',
                    transition: 'height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
            >
                <div
                    ref={contentRef}
                    style={{
                        paddingLeft: '28px',
                        paddingTop: '8px',
                        borderLeft: '4px solid var(--primary-color)',
                        marginLeft: '8px',
                    }}
                >
                    <ActivityCard
                        user={usersMap[reaction.data.activityBeingReacted.userId]}
                        classroom={
                            reaction.data.activityBeingReacted.classroomId ? classroomsMap[reaction.data.activityBeingReacted.classroomId] : undefined
                        }
                        activity={reaction.data.activityBeingReacted}
                        shouldDisableButtons={shouldDisableButtons}
                    />
                </div>
            </div>
        </>
    );
};
