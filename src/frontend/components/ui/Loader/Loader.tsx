import { BackDrop } from '@frontend/components/ui/BackDrop';
import { CircularProgress } from '@frontend/components/ui/CircularProgress';

import styles from './loader.module.css';

interface LoaderProps {
    isLoading: boolean;
}
export const Loader = ({ isLoading }: LoaderProps) => {
    if (!isLoading) return null;
    return (
        <BackDrop className={styles.loader}>
            <CircularProgress />
        </BackDrop>
    );
};
