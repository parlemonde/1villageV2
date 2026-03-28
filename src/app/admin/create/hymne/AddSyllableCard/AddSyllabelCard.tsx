import { Button } from '@frontend/components/ui/Button';

import styles from './add-syllable-card.module.css';
import SyllabeWithReturnIcon from './syllabe-with-return.svg';
import SyllabeIcon from './syllabe.svg';

interface AddSyllableCardProps {
    syllables: string[][];
    setSyllables: (syllables: string[][]) => void;
}

export const AddSyllableCard = ({ syllables, setSyllables }: AddSyllableCardProps) => {
    return (
        <div className={styles.addContentCard}>
            <strong>Ajouter à votre couplet :</strong>
            <Button
                size="sm"
                color="primary"
                variant="borderless"
                isUpperCase={false}
                label={
                    <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: '40px' }}>
                        <SyllabeIcon width={28} height={28} />
                        <span style={{ fontSize: '14px', fontWeight: 300 }}>Syllabe</span>
                    </span>
                }
                onClick={() => {
                    if (syllables.length === 0) {
                        setSyllables([['LA']]);
                    } else {
                        setSyllables([...syllables.slice(0, -1), [...syllables[syllables.length - 1], 'LA']]);
                    }
                }}
            />
            <Button
                size="sm"
                color="primary"
                variant="borderless"
                isUpperCase={false}
                label={
                    <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: '40px' }}>
                        <SyllabeWithReturnIcon width={28} height={28} />
                        <span style={{ fontSize: '14px', fontWeight: 300 }}>Syllabe à la ligne</span>
                    </span>
                }
                onClick={() => {
                    setSyllables([...syllables, ['LA']]);
                }}
            />
        </div>
    );
};
