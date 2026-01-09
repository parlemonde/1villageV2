'use client';

import { Button } from '@frontend/components/ui/Button';
import { Field, Input, MultiSelect, TextArea } from '@frontend/components/ui/Form';
import { CountryOption } from '@frontend/components/ui/Form/CountryOption';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Steps } from '@frontend/components/ui/Steps';
import { Title } from '@frontend/components/ui/Title';
import { UploadImageModal } from '@frontend/components/upload/UploadImageModal';
import { ActivityContext } from '@frontend/contexts/activityContext';
import PlusIcon from '@frontend/svg/plus.svg';
import { COUNTRIES } from '@lib/iso-3166-countries-french';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useContext, useState } from 'react';

import styles from './page.module.css';
import { MASCOT_STEPS_VALIDATORS } from '../validators';

export default function CreerLaMascotteStep2() {
    const router = useRouter();
    const { activity, setActivity } = useContext(ActivityContext);

    const mascotData = activity?.type === 'mascotte' ? activity.data : null;

    const [mascotName, setMascotName] = useState(mascotData?.mascot?.name || '');
    const [mascotDescription, setMascotDescription] = useState(mascotData?.mascot?.description || '');
    const [personalityTraits, setPersonalityTraits] = useState<string[]>(mascotData?.mascot?.personalityTraits || []);
    const [favoriteCountries, setFavoriteCountries] = useState<string[]>(mascotData?.mascot?.favoriteCountries || []);
    const [favoriteGame, setFavoriteGame] = useState<string>(mascotData?.mascot?.favoriteGame || '');
    const [favoriteSport, setFavoriteSport] = useState<string>(mascotData?.mascot?.favoriteSport || '');
    const [imageUrl, setImageUrl] = useState<string>(mascotData?.mascot?.imageUrl || '');

    const [isOpen, setIsOpen] = useState(false);

    if (!activity || activity.type !== 'mascotte') {
        return null;
    }

    const isValid =
        mascotName.trim().length > 0 &&
        mascotDescription.trim().length > 0 &&
        personalityTraits.length == 3 &&
        favoriteCountries.length > 0 &&
        favoriteGame.length > 0 &&
        favoriteSport.length > 0;

    const countriesOptions = Object.entries(COUNTRIES).map(([key, value]) => ({
        label: <CountryOption id={key} value={value} key={key} />,
        value: key,
    }));

    const saveActivity = () => {
        setActivity({
            ...activity,
            data: {
                ...activity.data,
                mascot: {
                    name: mascotName,
                    description: mascotDescription,
                    personalityTraits: personalityTraits,
                    favoriteCountries: favoriteCountries,
                    favoriteGame: favoriteGame,
                    favoriteSport: favoriteSport,
                    imageUrl: imageUrl,
                },
            },
        });
    };

    const goToNextStep = () => {
        saveActivity();
        router.push('/creer-la-mascotte/3');
    };

    return (
        <>
            <PageContainer>
                <Steps
                    steps={[
                        {
                            label: 'Votre classe',
                            href: '/creer-la-mascotte/1',
                            status: MASCOT_STEPS_VALIDATORS.isStep1Valid(activity) ? 'success' : 'warning',
                        },
                        { label: activity.data?.mascot?.name || 'Votre mascotte', href: '/creer-la-mascotte/2' },
                        { label: 'Langues et monnaies', href: '/creer-la-mascotte/3' },
                        { label: 'Le web de Pélico', href: '/creer-la-mascotte/4' },
                        { label: 'Pré-visualiser', href: '/creer-la-mascotte/5' },
                    ]}
                    activeStep={2}
                    marginTop="xl"
                    marginBottom="md"
                />
                <Title variant="h2" marginBottom="md">
                    Qui êtes-vous ? Choisissez une mascotte qui vous ressemble collectivement !
                </Title>
                <div className={styles.left}>
                    <div className={styles.imagePreview}>
                        {imageUrl ? (
                            <Image
                                className={styles.image}
                                src={imageUrl}
                                unoptimized
                                alt="Placeholder"
                                width={150}
                                height={150}
                                onClick={() => setIsOpen(true)}
                            />
                        ) : (
                            <PlusIcon className={styles.image + ' ' + styles.svg} onClick={() => setIsOpen(true)} />
                        )}
                        <p>Image de votre affiche ou décoration</p>
                    </div>
                    <div className={styles.right}>
                        <Field
                            marginBottom="md"
                            label="Nom"
                            input={
                                <Input
                                    type="text"
                                    value={mascotName || ''}
                                    onChange={(e) => {
                                        setMascotName(e.target.value);
                                    }}
                                />
                            }
                        />
                        <Field
                            label="Que représente votre mascotte et pourquoi l'avoir choisie ?"
                            input={
                                <TextArea
                                    placeholder="Description"
                                    size="md"
                                    isFullWidth
                                    value={mascotDescription || ''}
                                    onChange={(e) => {
                                        setMascotDescription(e.target.value);
                                    }}
                                />
                            }
                        />
                    </div>
                </div>
                <fieldset className={styles.personalityTraits}>
                    <legend>3 traits de personnalité de votre mascotte</legend>
                    <div className={styles.row}>
                        <Input
                            type="text"
                            isFullWidth
                            value={personalityTraits[0] || ''}
                            onChange={(e) =>
                                setPersonalityTraits((prev) => {
                                    const newPersonalityTraits = [...prev];
                                    newPersonalityTraits[0] = e.target.value;
                                    return newPersonalityTraits;
                                })
                            }
                        />
                        <Input
                            type="text"
                            isFullWidth
                            value={personalityTraits[1] || ''}
                            onChange={(e) =>
                                setPersonalityTraits((prev) => {
                                    const newPersonalityTraits = [...prev];
                                    newPersonalityTraits[1] = e.target.value;
                                    return newPersonalityTraits;
                                })
                            }
                        />
                        <Input
                            type="text"
                            isFullWidth
                            value={personalityTraits[2] || ''}
                            onChange={(e) =>
                                setPersonalityTraits((prev) => {
                                    const newPersonalityTraits = [...prev];
                                    newPersonalityTraits[2] = e.target.value;
                                    return newPersonalityTraits;
                                })
                            }
                        />
                    </div>
                </fieldset>
                <Field
                    marginBottom="xl"
                    label="Dans quels pays rêve-t-elle de voyager ?"
                    input={<MultiSelect isFullWidth value={favoriteCountries} onChange={setFavoriteCountries} options={countriesOptions} />}
                />
                <Field
                    className={styles.field}
                    marginBottom="xl"
                    label="À quel jeu de récréation votre mascotte joue-t-telle le plus souvent ?"
                    input={
                        <div className={styles.line}>
                            <p>Notre mascotte joue</p>
                            <Input isFullWidth type="text" value={favoriteGame} onChange={(e) => setFavoriteGame(e.target.value)} />
                        </div>
                    }
                />
                <Field
                    className={styles.field}
                    marginBottom="md"
                    label="Quels sports pratique-t-elle le plus souvent ?"
                    input={
                        <div className={styles.line}>
                            <p>Notre mascotte pratique</p>
                            <Input isFullWidth type="text" value={favoriteSport} onChange={(e) => setFavoriteSport(e.target.value)} />
                        </div>
                    }
                />
                <div className={styles.buttons}>
                    <Button
                        as="a"
                        href="/creer-la-mascotte/1"
                        color="primary"
                        variant="outlined"
                        label="Étape précédente"
                        leftIcon={<ChevronLeftIcon />}
                    />
                    <Button
                        disabled={!isValid}
                        onClick={goToNextStep}
                        color="primary"
                        variant="outlined"
                        label="Étape suivante"
                        rightIcon={<ChevronRightIcon />}
                    />
                </div>
            </PageContainer>
            <UploadImageModal
                isOpen={isOpen}
                initialImageUrl={imageUrl}
                onNewImage={(imageUrl) => setImageUrl(imageUrl)}
                onClose={() => setIsOpen(false)}
            />
        </>
    );
}
