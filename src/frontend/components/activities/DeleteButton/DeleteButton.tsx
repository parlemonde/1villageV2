import { TrashIcon } from '@radix-ui/react-icons';

import styles from './delete-button.module.css';

interface DeleteButtonProps {
    onClick: () => void;
    label?: string;
    style?: React.CSSProperties;
}

export const DeleteButton = ({ onClick, label = 'Supprimer' }: DeleteButtonProps) => {
    return (
        <button className={styles.deleteButton} onClick={onClick}>
            <TrashIcon /> {label}
        </button>
    );
};
