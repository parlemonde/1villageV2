import type { ActivityContentCardProps } from '@frontend/components/activities/ActivityCard/activity-card.types';
import { Button } from '@frontend/components/ui/Button';

export const FreeContentCard = ({ activity, shouldDisableButtons, onEdit, onDelete, children }: ActivityContentCardProps) => {
    if (activity.type !== 'libre') {
        return null;
    }
    return (
        <div style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'stretch' }}>
            {activity.data?.cardImageUrl && (
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
                            backgroundImage: `url(${activity.data?.cardImageUrl})`,
                            backgroundSize: 'contain',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                        }}
                    />
                </div>
            )}
            <div style={{ flex: '1 1 0', display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingRight: 4 }}>
                    <span style={{ fontWeight: 500 }}>{activity.data?.title}</span>
                    <p style={{ fontSize: '15px' }}>{activity.data?.resume}</p>
                </div>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'flex-end',
                        gap: '8px',
                    }}
                >
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
                            label={activity.isPelico ? 'Voir le message de Pélico' : 'Voir le message'}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};
