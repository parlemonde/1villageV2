import { Button } from '@frontend/components/ui/Button';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import Link from 'next/link';

import styles from './page.module.css';

const Story = () => {
    return (
        <PageContainer title="Inventer une histoire">
            <p className={styles.text}>
                Pour inventer une histoire, vous allez devoir imaginer votre village-monde idéal et le présenter aux pélicopains à travers des textes
                et des images. Pour cela, plusieurs étapes vous attendent…
            </p>
            <p className={styles.text}>Vous êtes prêts ? 1, 2, 3 fermez les yeux et laissez libre court à votre imagination !</p>
            <div style={{ textAlign: 'right', marginTop: '16px' }}>
                <Link href="/creer-une-histoire/1" type="button"></Link>
            </div>
            <Button
                as="a"
                href="/creer-une-histoire/1"
                color="primary"
                variant="outlined"
                label="Commencer"
                style={{ display: 'flex', justifySelf: 'end' }}
            />
        </PageContainer>
    );
};

export default Story;
