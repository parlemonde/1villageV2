import { Avatar } from '@frontend/components/Avatar';
import { CountryFlag } from '@frontend/components/CountryFlag';
import { sendToast } from '@frontend/components/Toasts';
import { HtmlEditor } from '@frontend/components/html/HtmlEditor';
import { HtmlViewer } from '@frontend/components/html/HtmlViewer';
import { Button, IconButton } from '@frontend/components/ui/Button';
import { UserContext } from '@frontend/contexts/userContext';
import PelicoNeutre from '@frontend/svg/pelico/pelico-neutre.svg';
import { Pencil1Icon, TrashIcon } from '@radix-ui/react-icons';
import type { Classroom } from '@server/database/schemas/classrooms';
import type { Comment } from '@server/database/schemas/comments';
import type { User } from '@server/database/schemas/users';
import { updateComment } from '@server-actions/comments/update-comment';
import { useExtracted } from 'next-intl';
import { useContext, useState } from 'react';

import styles from './comment-card.module.css';

const toFormattedDate = (date: string | null): string => {
    return date ? Intl.DateTimeFormat('fr', { year: 'numeric', month: 'numeric', day: 'numeric' }).format(new Date(date)) : '';
};

interface CommentDisplayProps {
    user: User;
    classroom?: Classroom;
    isPelico: boolean;
}

const CommentDisplayName = ({ user, classroom, isPelico }: CommentDisplayProps) => {
    const { classroom: currentClassroom } = useContext(UserContext);

    if (isPelico) {
        return 'Pélico';
    } else if (classroom && classroom.id === currentClassroom?.id) {
        return 'Votre classe';
    } else if (classroom) {
        return classroom.alias || (classroom.level ? `Les ${classroom.level} de ${classroom.name}` : classroom.name);
    }
    return user?.name || 'Un pélicopain';
};

interface CommentCardProps {
    user: User;
    classroom?: Classroom;
    comment: Comment;
    onDelete: () => void;
}

export const CommentCard = ({ user, classroom, comment, onDelete }: CommentCardProps) => {
    const tCommon = useExtracted('common');
    const isPelico = user.role === 'admin' || user.role === 'mediator';

    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState(comment.content);
    const [beforeEdit, setBeforeEdit] = useState(comment.content);

    const editComment = async () => {
        const { error } = await updateComment({ id: comment.id, content });
        if (error) {
            sendToast({
                type: 'error',
                message: error.message,
            });
        }
        setIsEditing(false);
    };

    const cancelEdition = () => {
        setIsEditing(false);
        setContent(beforeEdit);
    };

    const openEditor = () => {
        setIsEditing(true);
        setBeforeEdit(content);
    };

    return (
        <div className={styles.card}>
            <div className={styles.buttons}>
                <IconButton icon={Pencil1Icon} color="primary" onClick={openEditor} />
                <IconButton icon={TrashIcon} color="error" variant="contained" onClick={onDelete} />
            </div>
            <div className={styles.commentHeader}>
                <Avatar user={user} classroom={classroom} isPelico={isPelico} />
                <div className={styles.commentHeaderText}>
                    <span>
                        <CommentDisplayName user={user} classroom={classroom} isPelico={isPelico} />
                    </span>
                    <div className={styles.commentHeaderInfo}>
                        <span>Publié le {toFormattedDate(comment.createDate ?? null)}</span>
                        {isPelico && (
                            <>
                                <span>&nbsp;&middot;&nbsp;</span>
                                <PelicoNeutre style={{ width: '18px', height: 'auto' }} />
                            </>
                        )}
                        {classroom && (
                            <>
                                <span>&nbsp;&middot;&nbsp;</span>
                                <CountryFlag size="small" country={classroom?.countryCode} />
                            </>
                        )}
                    </div>
                </div>
            </div>
            <div className={styles.body}>
                {isEditing ? (
                    <>
                        <HtmlEditor content={content} onChange={setContent} />
                        <div className={styles.editButtons}>
                            <Button label={tCommon('Annuler')} color="primary" onClick={cancelEdition} />
                            <Button label={tCommon('Modifier')} color="primary" variant="contained" onClick={editComment} />
                        </div>
                    </>
                ) : (
                    <HtmlViewer content={content} />
                )}
            </div>
        </div>
    );
};
