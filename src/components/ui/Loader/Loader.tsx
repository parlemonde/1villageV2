import { BackDrop } from '../BackDrop';
import { CircularProgress } from '../CircularProgress';
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
