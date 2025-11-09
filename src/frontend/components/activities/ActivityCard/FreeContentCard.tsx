import { Button } from '@frontend/components/ui/Button';

import type { ActivityContentCardProps } from './activity-card.types';

export const FreeContentCard = ({ activity, shouldDisableButtons, onEdit, onDelete }: ActivityContentCardProps) => {
    if (activity.type !== 'libre') {
        return null;
    }
    return (
        <div style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'stretch' }}>
            {activity.data?.cardImageUrl && (
                <div
                    style={{
                        minHeight: '150px',
                        backgroundColor: 'var(--grey-100)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={activity.data?.cardImageUrl} alt="Image principale de la publication" style={{ width: 'auto', height: '150px' }} />
                </div>
            )}
            <div style={{ flex: '1 1 0', display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingRight: 4 }}>
                    <span style={{ fontWeight: 500 }}>{activity.data?.title}</span>
                    <p style={{ fontSize: '15px' }}>{activity.data?.resume}</p>
                </div>
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
                            label={activity.isPelico ? 'Voir le message de Pélico' : 'Voir le message'}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};
