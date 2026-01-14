import type { ActivityContentViewProps } from '@frontend/components/activities/ActivityView/activity-view.types';
import { COUNTRIES } from '@lib/iso-3166-countries-french';
import { CURRENCIES } from '@lib/iso-4217-currencies-french';
import { LANGUAGES } from '@lib/iso-639-languages-french';
import Image from 'next/image';
import { useExtracted } from 'next-intl';

export const MascotView = ({ activity }: ActivityContentViewProps) => {
    const t = useExtracted('MascotView');

    if (activity?.type !== 'mascotte') {
        return null;
    }

    const classroomDescription = t(
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
        <div style={{ padding: '16px 0' }}>
            <style>
                {`
                p {
                    line-height: 2rem;
                }
            `}
            </style>
            <p>
                {t('Nous sommes')} {activity?.data?.classroom?.alias}
            </p>
            <p>{classroomDescription}</p>
            <p>
                {t("En moyenne, l'âge des enfants note classe est de {age} ans.", {
                    age: `${activity?.data?.classroom?.students?.meanAge}`,
                })}
            </p>
            <p>{teachersDescription}</p>
            <p>{schoolDescription}</p>
            <div style={{ width: '100%', height: '300px', position: 'relative', margin: '16px 0' }}>
                <div style={{ width: '80%', display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>
                    <Image
                        unoptimized={activity?.data?.classroom?.imageUrl?.startsWith('https')}
                        src={activity?.data?.classroom?.imageUrl || ''}
                        alt={activity?.data?.mascot?.name || ''}
                        fill
                        objectFit="contain"
                    />
                </div>
            </div>
            <p style={{ textAlign: 'center' }}>{activity?.data?.classroom?.description}</p>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center', padding: '64px 0 16px 0' }}>
                <div style={{ width: 'fit-content' }}>
                    <Image
                        unoptimized={activity?.data?.classroom?.imageUrl?.startsWith('https')}
                        src={activity?.data?.mascot?.imageUrl || ''}
                        alt={activity?.data?.mascot?.name || ''}
                        width={150}
                        height={150}
                        style={{ objectFit: 'cover', borderRadius: '50%' }}
                    />
                </div>
                <div>
                    <p>
                        {t("Notre mascotte s'appelle {mascotName}, elle nous représente.", {
                            mascotName: activity?.data?.mascot?.name || '',
                        })}
                    </p>
                    <p>{activity?.data?.mascot?.description}</p>
                    <p>
                        {activity?.data?.mascot?.name} {t('est')} {activity?.data?.mascot?.personalityTraits?.[0]},{' '}
                        {activity?.data?.mascot?.personalityTraits?.[1]} et {activity?.data?.mascot?.personalityTraits?.[2]}.
                    </p>
                    <p>
                        {t("Notre mascotte rêve d'aller dans ces pays")} :{' '}
                        {activity?.data?.mascot?.favoriteCountries?.map((country) => COUNTRIES[country]).join(', ')}.
                    </p>
                    <p>
                        {t('Notre mascotte joue {game} et pratique {sport}.', {
                            game: activity?.data?.mascot?.favoriteGame || '',
                            sport: activity?.data?.mascot?.favoriteSport || '',
                        })}
                    </p>
                </div>
            </div>
            <p>
                {t('Tous les enfants de notre classe parlent')} :{' '}
                {activity?.data?.languages?.spokenByAll?.map((language) => LANGUAGES[language]).join(', ')}.{' '}
            </p>
            <p>
                {t('Au moins un enfant de notre classe parle')} :{' '}
                {activity?.data?.languages?.spokenBySome?.map((language) => LANGUAGES[language])?.join(', ')}
            </p>
            <p>
                {t('{mascotName}, comme tous les enfants de notre classe, apprend', {
                    mascotName: activity?.data?.mascot?.name || '',
                })}{' '}
                : {activity?.data?.languages?.taught?.map((language) => LANGUAGES[language]).join(', ')}
            </p>
            <p>
                {t('Nous utilisons comme monnaie')} : {activity?.data?.languages?.currencies?.map((currency) => CURRENCIES[currency]).join(', ')}
            </p>
        </div>
    );
};
