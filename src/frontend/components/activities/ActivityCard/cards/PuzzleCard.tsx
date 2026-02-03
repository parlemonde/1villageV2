import type { ActivityContentCardProps } from '@frontend/components/activities/ActivityCard/activity-card.types';
import { CUSTOM_THEME_VALUE } from '@frontend/components/activities/enigme-constants';
import { HtmlViewerText } from '@frontend/components/html/HtmlViewer/HtmlViewer';
import { Button } from '@frontend/components/ui/Button';
import { useExtracted } from 'next-intl';

export const PuzzleCard = ({ activity, shouldDisableButtons, onEdit, onDelete }: ActivityContentCardProps) => {
    const tCommon = useExtracted('common');

    if (activity.type !== 'enigme') {
        return null;
    }

    const themeLabel = activity.data?.defaultTheme || tCommon.rich('{text}', { text: CUSTOM_THEME_VALUE });
    const firstImageUrl = (activity.data?.content || []).find((content) => content.type === 'image')?.imageUrl;
    const firstHtmlText = (activity.data?.content || []).find((content) => content.type === 'html')?.html;

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
                    <span style={{ fontWeight: 500 }}>{themeLabel}</span>
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
                            {onEdit && <Button label={tCommon('Modifier')} variant="contained" color="secondary" onClick={onEdit} />}
                            {onDelete && <Button marginLeft="sm" label={tCommon('Supprimer')} variant="contained" color="error" onClick={onDelete} />}
                        </>
                    ) : (
                        <Button
                            as={shouldDisableButtons ? 'button' : 'a'}
                            disabled={shouldDisableButtons}
                            href={shouldDisableButtons ? undefined : `/activities/${activity.id}`}
                            color="primary"
                            variant="outlined"
                            label={tCommon("Résoudre l'énigme")}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};
