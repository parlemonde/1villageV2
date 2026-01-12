import { AnyContentViewer } from '@frontend/components/content/ContentViewer/AnyContentViewer';
import type { AnyContent } from '@frontend/components/content/content.types';
import { HtmlEditor } from '@frontend/components/html/HtmlEditor';
import { IconButton } from '@frontend/components/ui/Button';
import { Tooltip } from '@frontend/components/ui/Tooltip/Tooltip';
import { DragHandleDots2Icon, Pencil1Icon, TrashIcon } from '@radix-ui/react-icons';
import classNames from 'clsx';

import styles from './any-content-editor.module.css';

interface AnyContentEditorProps {
    content: AnyContent;
    setContent: (content: AnyContent) => void;
    htmlEditorPlaceholder?: string;
    hasDottedBorder?: boolean;
    isDraggable?: boolean;
    onDelete?: () => void;
    onEdit?: () => void;
    activityId?: number;
}

export const AnyContentEditor = ({
    content,
    setContent,
    htmlEditorPlaceholder,
    hasDottedBorder,
    isDraggable,
    onEdit,
    onDelete,
    activityId,
}: AnyContentEditorProps) => {
    return (
        <div className={styles.contentEditor}>
            {isDraggable && (
                <span className={styles.DragHandle}>
                    <DragHandleDots2Icon style={{ height: '24px', width: 'auto' }} />
                </span>
            )}
            {content.type === 'html' ? (
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
            ) : (
                <div
                    className={classNames(styles.mediaContent, {
                        [styles.hasDottedBorder]: hasDottedBorder,
                        [styles.hasContinuousLeftBorder]: isDraggable,
                    })}
                >
                    <AnyContentViewer content={content} activityId={activityId} />
                </div>
            )}
            {onEdit && content.type !== 'html' && (
                <Tooltip content="Modifier">
                    <IconButton icon={Pencil1Icon} variant="outlined" color="primary" className={styles.EditButton} onClick={onEdit} />
                </Tooltip>
            )}
            {onDelete && (
                <Tooltip content="Supprimer">
                    <IconButton icon={TrashIcon} variant="outlined" color="error" className={styles.TrashButton} onClick={onDelete} />
                </Tooltip>
            )}
        </div>
    );
};
