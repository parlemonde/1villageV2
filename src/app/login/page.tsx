import styles from './page.module.css';
import { Button } from '@/components/ui/Button';
import { Title } from '@/components/ui/Title';
import FamilyIcon from '@/svg/login/family.svg';
import EducationIcon from '@/svg/login/school.svg';

export default function LoginPage() {
    return (
        <div style={{ display: 'flex', width: '100%', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            <Title variant="h2" color="inherit">
                Vous êtes :
            </Title>
            <div className={styles.loginVariants}>
                <div className={styles.variant}>
                    <Title variant="h3" color="inherit">
                        Professionnel de l&apos;éducation
                    </Title>
                    <EducationIcon className={styles.Icon} />
                    <Button color="primary" label="1Village en classe" isUpperCase={false} />
                </div>
                <div className={styles.separator} />
                <div className={styles.variant}>
                    <Title variant="h3" color="inherit">
                        Famille
                    </Title>
                    <FamilyIcon className={styles.Icon} />
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
        </div>
    );
}
