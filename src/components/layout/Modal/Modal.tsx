import { Cross2Icon } from '@radix-ui/react-icons';
import classNames from 'clsx';
import { Dialog } from 'radix-ui';
import React from 'react';

import styles from './modal.module.css';
import { Button } from '../Button';
import { IconButton } from '../Button/IconButton';
import { CircularProgress } from '../CircularProgress';

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm?: () => void | Promise<void>;
    title: string;
    hasTopSeparator?: boolean;
    hasCloseButton?: boolean;
    hasCancelButton?: boolean;
    cancelLabel?: string;
    cancelLevel?: 'primary' | 'secondary' | 'error';
    confirmLabel?: string;
    confirmLevel?: 'primary' | 'secondary' | 'error';
    isConfirmDisabled?: boolean;
    width?: 'sm' | 'xs' | 'md' | 'lg' | 'xl';
    isFullWidth?: boolean;
    isLoading?: boolean;
    onOpenAutoFocus?: boolean;
};
export const Modal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    hasTopSeparator = true,
    hasCloseButton = true,
    hasCancelButton = true,
    cancelLabel = 'Annuler',
    cancelLevel = 'secondary',
    confirmLabel = 'Valider',
    confirmLevel = 'secondary',
    isConfirmDisabled = false,
    width = 'md',
    isFullWidth,
    isLoading,
    onOpenAutoFocus = true,
    children,
}: React.PropsWithChildren<ModalProps>) => {
    return (
        <Dialog.Root
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) {
                    onClose();
                }
            }}
        >
            <Dialog.Portal>
                <Dialog.Overlay className={styles.overlay} />
                <Dialog.Content
                    className={classNames(styles.modalContent, {
                        [styles[`modalContent--${width}`]]: width,
                        [styles['modalContent--is-full-width']]: isFullWidth,
                    })}
                    onOpenAutoFocus={
                        onOpenAutoFocus
                            ? undefined
                            : (event) => {
                                  event.preventDefault();
                              }
                    }
                >
                    <Dialog.Title
                        className={classNames(styles.title, {
                            [styles['title--has-top-separator']]: hasTopSeparator,
                        })}
                    >
                        {title}
                        {hasCloseButton && (
                            <Dialog.Close asChild>
                                <IconButton icon={Cross2Icon} className={styles.closeButton} variant="borderless" />
                            </Dialog.Close>
                        )}
                    </Dialog.Title>
                    <div className={styles.content}>{children}</div>
                    <div className={styles.footer}>
                        {hasCancelButton && <Button label={cancelLabel} onClick={onClose} color={cancelLevel} variant="outlined"></Button>}
                        {onConfirm && (
                            <Button
                                label={confirmLabel}
                                onClick={onConfirm}
                                color={confirmLevel}
                                variant="contained"
                                disabled={isConfirmDisabled}
                                marginLeft="sm"
                            ></Button>
                        )}
                    </div>

                    {isLoading && (
                        <div className={styles.loader}>
                            <CircularProgress color="primary" />
                        </div>
                    )}
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};
