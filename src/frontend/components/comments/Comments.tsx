'use client';

import type { UserComment } from '@app/api/comments/route';
import { sendToast } from '@frontend/components/Toasts';
import { HtmlEditor } from '@frontend/components/html/HtmlEditor';
import { defaultContent } from '@frontend/components/html/HtmlEditor/HtmlEditor';
import { Button } from '@frontend/components/ui/Button';
import { Modal } from '@frontend/components/ui/Modal';
import { UserContext } from '@frontend/contexts/userContext';
import { jsonFetcher } from '@lib/json-fetcher';
import { serializeToQueryUrl } from '@lib/serialize-to-query-url';
import { deleteComment } from '@server-actions/comments/delete-comment';
import { postComment } from '@server-actions/comments/post-comment';
import { useExtracted } from 'next-intl';
import { useContext, useState } from 'react';
import useSWR from 'swr';

import { CommentCard } from './CommentCard';
import styles from './comments.module.css';

interface CommentsProps {
    activityId: number;
}

export const Comments = ({ activityId }: CommentsProps) => {
    const t = useExtracted('Comments');
    const tCommon = useExtracted('common');

    const { user, classroom } = useContext(UserContext);

    const [content, setContent] = useState<unknown>('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [commentIdToDelete, setCommentIdToDelete] = useState<number | undefined>();

    const { data: comments, mutate } = useSWR<UserComment[]>(`/api/comments${serializeToQueryUrl({ activityId: activityId })}`, jsonFetcher);

    const post = async () => {
        const tempId = -1;
        const optimisticComment: UserComment = {
            comment: {
                id: tempId,
                content,
                activityId,
                userId: user.id,
                createDate: new Date().toISOString(),
                updateDate: new Date().toISOString(),
            },
            classroom,
            user,
        };

        await mutate(
            async (current = []) => {
                const { error, data } = await postComment({
                    activityId,
                    content,
                });

                if (error) {
                    sendToast({
                        type: 'error',
                        message: error.message,
                    });
                } else {
                    setContent(defaultContent);
                }

                const newComment: UserComment = {
                    comment: data!,
                    classroom: classroom,
                    user: user,
                };

                return [newComment, ...current.filter((c) => c.comment.id !== tempId)];
            },
            {
                optimisticData: (current = []) => [optimisticComment, ...current],
                rollbackOnError: true,
                revalidate: false,
                populateCache: true,
            },
        );
    };

    const onDeleteComment = async () => {
        if (!commentIdToDelete) {
            return;
        }

        const { error } = await deleteComment(commentIdToDelete);
        if (!error) {
            mutate();
        } else {
            sendToast({
                type: 'error',
                message: error.message,
            });
        }

        setIsDeleteModalOpen(false);
    };

    return (
        <>
            <div className={styles.separator}>
                <strong>{t('Réaction des pélicopains')}</strong>
            </div>
            <div className={styles.commentsFeed}>
                {comments && comments.length > 0 ? (
                    comments?.map((c) => (
                        <CommentCard
                            key={c.comment.id}
                            user={c.user}
                            classroom={c.classroom}
                            comment={c.comment}
                            onDelete={() => {
                                setIsDeleteModalOpen(true);
                                setCommentIdToDelete(c.comment.id);
                            }}
                        />
                    ))
                ) : (
                    <p>{t("Aucune réaction n'a été publiée pour le moment")}</p>
                )}
            </div>
            <div className={styles.editorContainer}>
                <div className={styles.editor}>
                    <strong>{t("Réagissez à l'écrit avec un commentaire :")}</strong>
                    <HtmlEditor content={content} onChange={setContent} />
                    <Button marginTop="md" isFullWidth onClick={post} color="primary" label={t('Commenter')} />
                </div>
            </div>

            <Modal
                isOpen={isDeleteModalOpen}
                confirmLabel={tCommon('Supprimer')}
                confirmLevel="error"
                onConfirm={onDeleteComment}
                onClose={() => setIsDeleteModalOpen(false)}
                title={t('Confirmer la suppression')}
                hasCancelButton
                hasCloseButton
            >
                {t('Voulez-vous vraiment supprimer ce commentaire ?')}
            </Modal>
        </>
    );
};
