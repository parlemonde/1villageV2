'use client';

import { Button } from '@frontend/components/ui/Button';
import { Checkbox } from '@frontend/components/ui/Form/Checkbox';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Steps } from '@frontend/components/ui/Steps';
import { Title } from '@frontend/components/ui/Title';
import { ActivityContext } from '@frontend/contexts/activityContext';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { useRouter } from 'next/navigation';
import { useContext, useState } from 'react';

import styles from './page.module.css';
import { MASCOT_STEPS_VALIDATORS } from '../validators';

export default function CreerSaMascotteStep4() {
    const router = useRouter();
    const { activity } = useContext(ActivityContext);

    const [hasAgreed, setHasAgreed] = useState(false);

    if (!activity || activity.type !== 'mascotte') {
        return null;
    }

    return (
        <PageContainer>
            <Steps
                steps={[
                    {
                        label: 'Votre classe',
                        href: '/creer-sa-mascotte/1',
                        status: MASCOT_STEPS_VALIDATORS.isStep1Valid(activity) ? 'success' : 'warning',
                    },
                    {
                        label: activity.data?.mascot?.name || 'Votre mascotte',
                        href: '/creer-sa-mascotte/2',
                        status: MASCOT_STEPS_VALIDATORS.isStep2Valid(activity) ? 'success' : 'warning',
                    },
                    {
                        label: 'Langues et monnaies',
                        href: '/creer-sa-mascotte/3',
                        status: MASCOT_STEPS_VALIDATORS.isStep3Valid(activity) ? 'success' : 'warning',
                    },
                    { label: 'Le web de Pélico', href: '/creer-sa-mascotte/4' },
                    { label: 'Pré-visualiser', href: '/creer-sa-mascotte/5' },
                ]}
                activeStep={4}
                marginTop="xl"
                marginBottom="md"
            />
            <Title variant="h2" marginBottom="md">
                Les règles d&apos;1Village !
            </Title>
            <p>
                {activity.data?.mascot?.name} est votre mascotte sur 1Village. C&apos;est grâce à elle que les autres classes vous reconnaîtront toute
                l&apos;année !
            </p>
            <br />
            <p>
                {activity.data?.mascot?.name}, tout comme moi Pélico, est désormais un citoyen d&apos;internet ! Et comme à la maison ou à
                l&apos;école, il y a certaines règles à respecter sur internet et sur 1Village. Pour les découvrir, vous pouvez réaliser
                l&apos;activité &quot;La citoyenneté internet&quot; de note catalogue d&apos;activités !
            </p>
            <br />
            <p>Mais en attendant, j&apos;ai quelques conseils à vous donner ! Sur internet et 1Village :</p>
            <br />
            <p>📝 Il faut faire attention à ce que nous partageons et à ce que nous disons car cela impacte les autres citoyens d&apos;internet.</p>
            <br />
            <p>🕶️ Il ne faut pas partager des photos de ses camarades et des pélicopains sans leur permission.</p>
            <br />
            <p>🤔 Enfin, il ne faut pas croire tout ce qu&apos;on peut lire, voir ou écouter car certaines informations peuvent être fausses.</p>
            <br />
            <p>Avez-vous bien comprismes conseils les pélicopains ?</p>
            <div className={styles.checkboxContainer}>
                <Checkbox
                    label="Nous avons compris et nous sommes d'accord avec les conseils de Pélico !"
                    name="hasAgreed"
                    onChange={() => setHasAgreed(!hasAgreed)}
                    isChecked={hasAgreed}
                />
            </div>
            <div className={styles.buttons}>
                <Button
                    as="a"
                    href="/creer-sa-mascotte/3"
                    color="primary"
                    variant="outlined"
                    label="Étape précédente"
                    leftIcon={<ChevronLeftIcon />}
                />
                <Button
                    onClick={() => router.push('/creer-sa-mascotte/5')}
                    disabled={!hasAgreed}
                    color="primary"
                    variant="outlined"
                    label="Étape suivante"
                    rightIcon={<ChevronRightIcon />}
                />
            </div>
        </PageContainer>
    );
}
