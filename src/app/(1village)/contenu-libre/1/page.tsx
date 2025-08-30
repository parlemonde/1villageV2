import { Steps } from '@frontend/components/1Village/Steps';
import { Link } from '@frontend/components/navigation/Link';
import { Title } from '@frontend/components/ui/Title';
import { ChevronLeftIcon } from '@radix-ui/react-icons';
// import { db } from '@server/database';
// import { activities } from '@server/database/schemas/activities';
// import { getCurrentUser } from '@server/helpers/get-current-user';
// import { and, eq, isNull } from 'drizzle-orm';

import { FreeContentStep1Form } from './FreeContentStep1Form';
import styles from './page.module.css';

export default async function FreeContentStep1() {
    // const user = await getCurrentUser();
    // TODO: Ask user to use draft if it exists
    // const draftActivity = user
    //     ? await db.query.activities.findFirst({
    //           where: and(eq(activities.userId, user.id), eq(activities.type, 'libre'), isNull(activities.publishDate)),
    //       })
    //     : undefined;

    return (
        <div className={styles.page} style={{ padding: '16px 32px' }}>
            <Link href="/contenu-libre" className={styles.backButton}>
                <ChevronLeftIcon /> Retour
            </Link>
            <Steps
                steps={[
                    { label: 'Contenu', href: '/contenu-libre/1' },
                    { label: 'Forme', href: '/contenu-libre/2' },
                    { label: 'Pré-visualiser', href: '/contenu-libre/3' },
                ]}
                activeStep={1}
                marginTop="xl"
                marginBottom="md"
            />
            <Title variant="h2" marginBottom="md">
                Ecrivez le contenu de votre publication
            </Title>
            <p>
                Utilisez l&apos;éditeur de bloc pour définir le contenu de votre publication. Dans l&apos;étape 2 vous pourrez définir l&apos;aspect
                de la carte résumée de votre publication.
            </p>
            <FreeContentStep1Form />
        </div>
    );
}
