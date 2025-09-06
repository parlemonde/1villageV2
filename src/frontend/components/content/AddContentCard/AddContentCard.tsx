import { Button } from '@frontend/components/ui/Button';
import { ImageIcon, TextIcon, VideoIcon, FileIcon, SpeakerLoudIcon, DashboardIcon } from '@radix-ui/react-icons';

import styles from './add-content-card.module.css';
import type { AnyContent } from '../content.types';

interface AddContentButtonProps {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
}
const AddContentButton = ({ icon, label, onClick }: AddContentButtonProps) => {
    return (
        <Button
            size="sm"
            color="primary"
            variant="borderless"
            isUpperCase={false}
            label={
                <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    {icon}
                    <span style={{ fontSize: '14px', fontWeight: 300 }}>{label}</span>
                </span>
            }
            onClick={onClick}
        />
    );
};

interface AddContentCardProps {
    addContentLabel?: string;
    onAddContent: (newContent: AnyContent) => void;
}

export const AddContentCard = ({ addContentLabel = 'Ajouter:', onAddContent }: AddContentCardProps) => {
    return (
        <div className={styles.addContentCard}>
            <strong>{addContentLabel}</strong>
            <AddContentButton icon={<TextIcon width={20} height={20} />} label="Texte" onClick={() => onAddContent({ type: 'html', html: '' })} />
            <AddContentButton
                icon={<ImageIcon width={20} height={20} />}
                label="Image"
                onClick={() => onAddContent({ type: 'image', imageUrl: '' })}
            />
            <AddContentButton
                icon={<FileIcon width={20} height={20} />}
                label="Document"
                onClick={() => onAddContent({ type: 'document', documentUrl: '' })}
            />
            <AddContentButton
                icon={<SpeakerLoudIcon width={20} height={20} />}
                label="Audio"
                onClick={() => onAddContent({ type: 'audio', audioUrl: '' })}
            />
            <AddContentButton
                icon={<VideoIcon width={20} height={20} />}
                label="Vidéo"
                onClick={() => onAddContent({ type: 'video', videoUrl: '' })}
            />
            <AddContentButton icon={<DashboardIcon width={20} height={20} />} label="H5p" onClick={() => onAddContent({ type: 'h5p', h5pId: '' })} />
        </div>
    );
};
