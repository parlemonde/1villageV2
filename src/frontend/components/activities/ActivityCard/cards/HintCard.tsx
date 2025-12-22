import { HtmlViewerText } from '@frontend/components/html/HtmlViewer/HtmlViewer';
import { Button } from '@frontend/components/ui/Button';

import type { ActivityContentCardProps } from '../activity-card.types';

export const HintCard = ({ activity, shouldDisableButtons, onEdit, onDelete }: ActivityContentCardProps) => {
    if (activity.type !== 'indice') {
        return null;
    }
    const firstImageUrl = (activity.data?.content || []).find((content) => content.type === 'image')?.imageUrl;
    const firstHtmlText = (activity.data?.content || []).find((content) => content.type === 'html')?.html;
    const hint = activity.data?.defaultHint || activity.data?.customHint;

    return (
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
            <div style={{ flex: '1 1 0', display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingRight: 4 }}>
                    <span style={{ fontWeight: 500 }}>{hint}</span>
                    <p
                        style={{
                            fontSize: '15px',
                            lineHeight: '1.3',
                            overflow: 'hidden',
                            position: 'relative',
                            textAlign: 'justify',
                            maxHeight: 4 * 15 * 1.3, // 4 lines * 15px * 1.5 line height
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
                            label="Voir l'indice"
                        />
                    )}
                </div>
            </div>
        </div>
    );
};
