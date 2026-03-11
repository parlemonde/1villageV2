'use client';

import { defaultContent, HtmlEditor } from '@frontend/components/html/HtmlEditor/HtmlEditor';
import { HtmlViewer } from '@frontend/components/html/HtmlViewer';
import { Button, IconButton } from '@frontend/components/ui/Button';
import { Pencil1Icon } from '@radix-ui/react-icons';
import classNames from 'clsx';
import { useExtracted } from 'next-intl';
import { useState } from 'react';

import styles from './team-comment-editor.module.css';

export const TeamCommentEditor = () => {
    const t = useExtracted('TeamCommentEditor');
    const tCommon = useExtracted('common');

    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState<unknown>(defaultContent);
    const [beforeEdit, setBeforeEdit] = useState<unknown>(content);

    const cancelEdit = () => {
        setContent(beforeEdit);
        setIsEditing(false);
    };

    const onSave = () => {
        setBeforeEdit(content);
        // TODO Server call
        setIsEditing(false);
    };

    return (
        <div className={styles.container}>
            {isEditing ? (
                <div className={classNames(styles.buttons, styles.topRight)}>
                    <Button size="sm" color="error" label={tCommon('Annuler')} onClick={cancelEdit} />
                    <Button size="sm" color="primary" label={tCommon('Enregistrer')} onClick={onSave} />
                </div>
            ) : (
                <IconButton icon={Pencil1Icon} className={styles.topRight} onClick={() => setIsEditing(true)} color="primary" variant="contained" />
            )}
            <strong>{t("Commentaire de l'équipe :")}</strong>
            {isEditing ? <HtmlEditor content={content} onChange={setContent} className={styles.editor} /> : <HtmlViewer content={content} />}
        </div>
    );
};
