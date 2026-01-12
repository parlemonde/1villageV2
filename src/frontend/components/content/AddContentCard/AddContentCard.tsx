import type { AnyContent, AnyContentType } from '@frontend/components/content/content.types';
import { Button } from '@frontend/components/ui/Button';
import { ImageIcon, TextIcon, VideoIcon, FileIcon, SpeakerLoudIcon, DashboardIcon } from '@radix-ui/react-icons';

import styles from './add-content-card.module.css';

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
                <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: '40px' }}>
                    {icon}
                    <span style={{ fontSize: '14px', fontWeight: 300 }}>{label}</span>
                </span>
            }
            onClick={onClick}
        />
    );
};

const contentTypes: Record<AnyContentType, { icon: React.ReactNode; label: string }> = {
    html: {
        icon: <TextIcon width={20} height={20} />,
        label: 'Texte',
    },
    image: {
        icon: <ImageIcon width={20} height={20} />,
        label: 'Image',
    },
    audio: {
        icon: <SpeakerLoudIcon width={20} height={20} />,
        label: 'Audio',
    },
    video: {
        icon: <VideoIcon width={20} height={20} />,
        label: 'Vidéo',
    },
    document: {
        icon: <FileIcon width={20} height={20} />,
        label: 'Document',
    },
    h5p: {
        icon: <DashboardIcon width={20} height={20} />,
        label: 'H5p',
    },
};

interface AddContentCardProps {
    addContentLabel?: string;
    availableContentTypes: AnyContentType[];
    onAddContent: (newContentType: AnyContent['type']) => void;
}

export const AddContentCard = ({ addContentLabel = 'Ajouter:', availableContentTypes, onAddContent }: AddContentCardProps) => {
    const availableContentTypesSet = new Set<AnyContentType>(availableContentTypes);
    return (
        <div className={styles.addContentCard}>
            <strong>{addContentLabel}</strong>
            {Object.entries(contentTypes)
                .filter(([type]) => availableContentTypesSet.has(type as AnyContentType))
                .map(([type, { icon, label }]) => (
                    <AddContentButton key={type} icon={icon} label={label} onClick={() => onAddContent(type as AnyContentType)} />
                ))}
        </div>
    );
};
