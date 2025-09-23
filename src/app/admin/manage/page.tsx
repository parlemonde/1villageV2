import { Link } from '@frontend/components/ui/Link';
import { Title } from '@frontend/components/ui/Title';
import { ChevronRightIcon } from '@radix-ui/react-icons';

import styles from './page.module.css';

export default function AdminManagePage() {
    return (
        <>
            <Title>Gérer</Title>
            <p style={{ margin: '16px 0' }}>
                C&apos;est dans cet espace, que les administrateurs et administratrices du site vont pouvoir gérer les droits d&apos;accès, la
                composition des villages-mondes et accéder à la liste complète des utilisateurs.
            </p>
            <Link href="/admin/manage/villages" className={styles.link}>
                <span>Les villages-mondes</span>
                <ChevronRightIcon width={24} height={24} />
            </Link>
            <Link href="/admin/manage/users" className={styles.link}>
                <span>Les utilisateurs</span>
                <ChevronRightIcon width={24} height={24} />
            </Link>
        </>
    );
}
