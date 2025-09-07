import { HtmlEditor } from '@frontend/components/html/HtmlEditor';
import { IconButton } from '@frontend/components/ui/Button';
import { DragHandleDots2Icon, Pencil1Icon, TrashIcon } from '@radix-ui/react-icons';
import classNames from 'clsx';

import type { AnyContent } from '../content.types';
import styles from './content-editor.module.css';

interface ContentEditorProps {
    content: AnyContent;
    setContent: (content: AnyContent) => void;
    htmlEditorPlaceholder?: string;
    hasDottedBorder?: boolean;
    isDraggable?: boolean;
    onDelete?: () => void;
    onEdit?: () => void;
}

export const ContentEditor = ({ content, setContent, htmlEditorPlaceholder, hasDottedBorder, isDraggable, onEdit, onDelete }: ContentEditorProps) => {
    if (content.type === 'html') {
        return (
            <div className={styles.contentEditor}>
                {isDraggable && (
                    <span className={styles.DragHandle}>
                        <DragHandleDots2Icon style={{ height: '24px', width: 'auto' }} />
                    </span>
                )}
                <HtmlEditor
                    content={content.html}
                    onChange={(html) => setContent({ ...content, html })}
                    placeholder={htmlEditorPlaceholder}
                    color="primary"
                    className={classNames(styles.contentHtmlEditor, {
                        [styles.hasDottedBorder]: hasDottedBorder,
                        [styles.hasContinuousLeftBorder]: isDraggable,
                        [styles.hasRightPadding]: onDelete !== undefined,
                    })}
                />
                {onDelete && <IconButton icon={TrashIcon} variant="outlined" color="error" className={styles.TrashButton} onClick={onDelete} />}
            </div>
        );
    }
    if (content.type === 'image') {
        return (
            <div className={styles.contentEditor}>
                {isDraggable && (
                    <span className={styles.DragHandle}>
                        <DragHandleDots2Icon style={{ height: '24px', width: 'auto' }} />
                    </span>
                )}
                <div
                    className={classNames(styles.mediaContent, {
                        [styles.hasDottedBorder]: hasDottedBorder,
                        [styles.hasContinuousLeftBorder]: isDraggable,
                    })}
                >
                    <div
                        style={{
                            width: '100%',
                            maxWidth: 400,
                            maxHeight: 300,
                            margin: '0 auto',
                            overflow: 'hidden',
                        }}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={content.imageUrl} alt="Image" style={{ objectFit: 'contain', width: '100%', height: 'auto', maxHeight: '300px' }} />
                    </div>
                </div>
                {onEdit && <IconButton icon={Pencil1Icon} variant="outlined" color="primary" className={styles.EditButton} onClick={onEdit} />}
                {onDelete && <IconButton icon={TrashIcon} variant="outlined" color="error" className={styles.TrashButton} onClick={onDelete} />}
            </div>
        );
    }
    return (
        <div className={styles.contentEditor}>
            {content.type}
            {onDelete && <IconButton icon={TrashIcon} variant="outlined" color="error" className={styles.TrashButton} onClick={onDelete} />}
        </div>
    );
};
