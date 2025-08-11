import { ChevronRightIcon, DownloadIcon, PlusIcon } from '@radix-ui/react-icons';

import { VillagesTable } from './VillagesTable';
import styles from './page.module.css';
import { Button } from '@/components/layout/Button';
import { Flex, FlexItem } from '@/components/layout/Flex';
import { Title } from '@/components/layout/Title';
import { Link } from '@/components/navigation/Link';

export default function AdminManageVillagesPage() {
    return (
        <>
            <div className={styles.breadcrumbs}>
                <Link href="/admin/manage" className={styles.breadcrumbsLink}>
                    Gérer
                </Link>
                <ChevronRightIcon fill="currentColor" />
                <span>Villages-mondes</span>
            </div>
            <Flex isFullWidth alignItems="center" justifyContent="flex-start" flex-direction="row" gap="md" marginY="md">
                <FlexItem flexGrow={1} flexShrink={0} flexBasis="0">
                    <Title>
                        <span>Villages-mondes</span>
                    </Title>
                </FlexItem>
                <Button variant="contained" color="light-grey" leftIcon={<DownloadIcon />} label="Importer les villages-mondes" />
                <Button variant="contained" color="primary" leftIcon={<PlusIcon />} label="Nouveau village-monde" />
            </Flex>
            <VillagesTable />
        </>
    );
}
