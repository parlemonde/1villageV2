import styles from './page.module.css';
import { Button } from '@/components/layout/Button';
import { Flex } from '@/components/layout/Flex';
import { Title } from '@/components/layout/Title';
import { Link } from '@/components/navigation/Link';
import FamilyIcon from '@/svg/login/family.svg';
import EducationIcon from '@/svg/login/school.svg';

export default function LoginPage() {
    return (
        <Flex isFullWidth flexDirection="column" alignItems="center" justifyContent="center" padding="md">
            <Title variant="h2" color="inherit">
                Vous êtes :
            </Title>
            <div className={styles.loginVariants}>
                <div className={styles.variant}>
                    <Title variant="h3" color="inherit">
                        Professionnel de l&apos;éducation
                    </Title>
                    <Link href="/login/education">
                        <EducationIcon className={styles.Icon} />
                    </Link>
                    <Button color="primary" as="a" label="1Village en classe" isUpperCase={false} href="/login/education" />
                </div>
                <div className={styles.separator} />
                <div className={styles.variant}>
                    <Title variant="h3" color="inherit">
                        Famille
                    </Title>
                    <Link href="/login/famille">
                        <FamilyIcon className={styles.Icon} />
                    </Link>
                    <Button
                        color="primary"
                        as="a"
                        label="1Village en famille"
                        isUpperCase={false}
                        href="/login/famille"
                        className={styles.familyButton}
                    />
                </div>
            </div>
        </Flex>
    );
}
