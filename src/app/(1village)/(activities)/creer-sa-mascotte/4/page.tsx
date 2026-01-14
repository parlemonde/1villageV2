'use client';

import { mascotActivityHelpers } from '@app/(1village)/(activities)/creer-sa-mascotte/helpers';
import { MASCOT_STEPS_VALIDATORS } from '@app/(1village)/(activities)/creer-sa-mascotte/validators';
import { Button } from '@frontend/components/ui/Button';
import { Checkbox } from '@frontend/components/ui/Form/Checkbox';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Steps } from '@frontend/components/ui/Steps';
import { Title } from '@frontend/components/ui/Title';
import { ActivityContext } from '@frontend/contexts/activityContext';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { useRouter } from 'next/navigation';
import { useExtracted } from 'next-intl';
import { useContext } from 'react';

import styles from './page.module.css';

export default function CreerSaMascotteStep4() {
    const t = useExtracted('app.(1village).(activities).creer-sa-mascotte.4');
    const tCommon = useExtracted('common');
    const router = useRouter();
    const { activity, setActivity } = useContext(ActivityContext);

    if (!activity || activity.type !== 'mascotte') {
        return null;
    }

    const { setHasAcceptedRules } = mascotActivityHelpers(activity, setActivity);

    return (
        <PageContainer>
            <Steps
                steps={[
                    {
                        label: t('Votre classe'),
                        href: '/creer-sa-mascotte/1',
                        status: MASCOT_STEPS_VALIDATORS.isStep1Valid(activity) ? 'success' : 'warning',
                    },
                    {
                        label: activity.data?.mascot?.name || t('Votre mascotte'),
                        href: '/creer-sa-mascotte/2',
                        status: MASCOT_STEPS_VALIDATORS.isStep2Valid(activity) ? 'success' : 'warning',
                    },
                    {
                        label: t('Langues et monnaies'),
                        href: '/creer-sa-mascotte/3',
                        status: MASCOT_STEPS_VALIDATORS.isStep3Valid(activity) ? 'success' : 'warning',
                    },
                    { label: t('Le web de Pélico'), href: '/creer-sa-mascotte/4' },
                    { label: tCommon('Pré-visualiser'), href: '/creer-sa-mascotte/5' },
                ]}
                activeStep={4}
                marginTop="xl"
                marginBottom="md"
            />
            <Title variant="h2" marginBottom="md">
                {t("Les règles d'1Village !")}
            </Title>
            <p>
                {activity.data?.mascot?.name}{' '}
                {t("est votre mascotte sur 1Village. C'est grâce à elle que les autres classes vous reconnaîtront toute l'année !")}
            </p>
            <br />
            <p>
                {activity.data?.mascot?.name},{' '}
                {t(
                    "tout comme moi Pélico, est désormais un citoyen d'internet ! Et comme à la maison ou à l'école, il y a certaines règles à respecter sur internet et sur 1Village. Pour les découvrir, vous pouvez réaliser l'activité \"La citoyenneté internet\" de note catalogue d'activités !",
                )}
            </p>
            <br />
            <p>{t("Mais en attendant, j'ai quelques conseils à vous donner ! Sur internet et 1Village :")}</p>
            <br />
            <p>📝 {t("Il faut faire attention à ce que nous partageons et à ce que nous disons car cela impacte les autres citoyens d'internet.")}</p>
            <br />
            <p>🕶️ {t('Il ne faut pas partager des photos de ses camarades et des pélicopains sans leur permission.')}</p>
            <br />
            <p>🤔 {t("Enfin, il ne faut pas croire tout ce qu'on peut lire, voir ou écouter car certaines informations peuvent être fausses.")}</p>
            <br />
            <p>{t('Avez-vous bien compris mes conseils les pélicopains ?')}</p>
            <div className={styles.checkboxContainer}>
                <Checkbox
                    label={t("Nous avons compris et nous sommes d'accord avec les conseils de Pélico !")}
                    name="hasAgreed"
                    onChange={() => setHasAcceptedRules(!activity?.data?.hasAcceptedRules)}
                    isChecked={activity?.data?.hasAcceptedRules}
                />
            </div>
            <div className={styles.buttons}>
                <Button
                    as="a"
                    href="/creer-sa-mascotte/3"
                    color="primary"
                    variant="outlined"
                    label={tCommon('Étape précédente')}
                    leftIcon={<ChevronLeftIcon />}
                />
                <Button
                    onClick={() => router.push('/creer-sa-mascotte/5')}
                    disabled={!activity?.data?.hasAcceptedRules}
                    color="primary"
                    variant="outlined"
                    label={tCommon('Étape suivante')}
                    rightIcon={<ChevronRightIcon />}
                />
            </div>
        </PageContainer>
    );
}
