import { HtmlEditor } from '@frontend/components/html/HtmlEditor';
import { IconButton } from '@frontend/components/ui/Button';
import { DragHandleDots2Icon, TrashIcon } from '@radix-ui/react-icons';
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
}

export const ContentEditor = ({ content, setContent, htmlEditorPlaceholder, hasDottedBorder, isDraggable, onDelete }: ContentEditorProps) => {
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
    return (
        <div className={styles.contentEditor}>
            {content.type}
            {onDelete && <IconButton icon={TrashIcon} variant="outlined" color="error" className={styles.TrashButton} onClick={onDelete} />}
        </div>
    );
};
