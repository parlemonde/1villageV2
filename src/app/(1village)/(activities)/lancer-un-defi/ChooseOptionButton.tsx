import { ChevronRightIcon } from '@radix-ui/react-icons';

import styles from './choose-option-button.module.css';

interface ChooseOptionButton {
    title: string;
    description?: string;
    onClick: () => void;
}

export const ChooseOptionButton = ({ title, description, onClick }: ChooseOptionButton) => {
    return (
        <button className={styles.button} onClick={() => onClick()}>
            <div className={styles.buttonContent}>
                <div className={styles.left}>
                    <p>{title}</p>
                    {description && <span>{description}</span>}
                </div>
                <div className={styles.right}>
                    <ChevronRightIcon className={styles.icon} />
                </div>
            </div>
        </button>
    );
};
