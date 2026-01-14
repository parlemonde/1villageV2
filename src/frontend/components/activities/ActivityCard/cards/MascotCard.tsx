import type { ActivityContentCardProps } from '@frontend/components/activities/ActivityCard/activity-card.types';
import { Button } from '@frontend/components/ui/Button';
import Image from 'next/image';
import { useExtracted } from 'next-intl';

export const MascotCard = ({ activity, shouldDisableButtons, onEdit, onDelete }: ActivityContentCardProps) => {
    const t = useExtracted('MascotCard');
    const tCommon = useExtracted('common');

    if (activity.type !== 'mascotte') {
        return null;
    }

    const studentsDescription = t(
        'Nous sommes {studentsCount} élèves, dont {girlsCount, plural, =0 {# fille} =1 {# fille} other {# filles}} et {boysCount, plural, =0 {# garçon} =1 {# garçon} other {# garçons}}.',
        {
            studentsCount: `${activity?.data?.classroom?.students?.totalCount}`,
            girlsCount: activity?.data?.classroom?.students?.femalesCount || 0,
            boysCount: activity?.data?.classroom?.students?.malesCount || 0,
        },
    );

    const teachersDescription = t(
        'Nous avons {teachers, plural, =0 {# professeur} =1 {# professeur} other {# professeurs}} dont {womenCount, plural, =0 {# femme} =1 {# femme} other {# femmes}} et {menCount, plural, =0 {# homme} =1 {# homme} other {# hommes}}.',
        {
            teachers: activity?.data?.classroom?.teachers?.totalCount || 0,
            womenCount: activity?.data?.classroom?.teachers?.femalesCount || 0,
            menCount: activity?.data?.classroom?.teachers?.malesCount || 0,
        },
    );

    const schoolDescription = t(
        'Dans notre école, il y a {classroomsCount, plural, =1 {# classe} other {# classes}} et {studentsCount, plural, =1 {# élève} other {# élèves}}.',
        {
            classroomsCount: activity?.data?.classroom?.school?.classroomsCount || 0,
            studentsCount: activity?.data?.classroom?.school?.studentsCount || 0,
        },
    );

    return (
        <>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '16px', alignItems: 'stretch', padding: '8px 16px 0 16px' }}>
                <div style={{ width: 'fit-content' }}>
                    {activity?.data?.mascot?.imageUrl && (
                        <Image
                            unoptimized={activity.data.mascot.imageUrl.startsWith('https')}
                            src={activity.data.mascot.imageUrl}
                            alt={activity.data.mascot.name || 'Mascotte'}
                            width={100}
                            height={100}
                            style={{ objectFit: 'cover', borderRadius: '50%' }}
                        />
                    )}
                </div>
                <div>
                    <p style={{ marginBottom: '8px', fontSize: '17px' }}>
                        {t('Notre mascotte')} <strong>{activity?.data?.mascot?.name}</strong>
                    </p>
                    <p>
                        {t('Nous sommes')} {activity?.data?.classroom?.alias}. {studentsDescription}{' '}
                        {t("L'age moyen des enfants de notre classe est {age} ans.", {
                            age: `${activity?.data?.classroom?.students?.meanAge}`,
                        })}{' '}
                        {teachersDescription} {schoolDescription}
                    </p>
                </div>
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
                        label={t('Voir la mascotte')}
                    />
                )}
            </div>
        </>
    );
};
