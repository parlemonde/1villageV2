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
    onCancel?: () => void;
    onConfirm?: () => void | Promise<void>;
    title: string;
    description?: string;
    hasTopSeparator?: boolean;
    hasBottomSeparator?: boolean;
    hasPadding?: boolean;
    hasCloseButton?: boolean;
    hasCancelButton?: boolean;
    hasFooter?: boolean;
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
    onCancel,
    onConfirm,
    title,
    description,
    hasFooter = true,
    hasTopSeparator = true,
    hasBottomSeparator = false,
    hasPadding = true,
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
                        [styles[`width-${width}`]]: width,
                        [styles.isFullWidth]: isFullWidth,
                    })}
                    onOpenAutoFocus={
                        onOpenAutoFocus
                            ? undefined
                            : (event) => {
                                  event.preventDefault();
                              }
                    }
                >
                    <Dialog.Description>{description}</Dialog.Description>
                    <Dialog.Title
                        className={classNames(styles.title, {
                            [styles.hasTopSeparator]: hasTopSeparator,
                        })}
                    >
                        {title}
                        {hasCloseButton && (
                            <Dialog.Close asChild>
                                <IconButton icon={Cross2Icon} variant="borderless" />
                            </Dialog.Close>
                        )}
                    </Dialog.Title>
                    <div className={classNames(styles.content, { [styles.hasPadding]: hasPadding })}>{children}</div>
                    {hasFooter && (
                        <div className={classNames(styles.footer, { [styles.hasBottomSeparator]: hasBottomSeparator })}>
                            {hasCancelButton && (
                                <Button
                                    label={cancelLabel}
                                    onClick={() => {
                                        (onCancel || onClose)();
                                    }}
                                    color={cancelLevel}
                                    variant="outlined"
                                ></Button>
                            )}
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
                    )}
                    {isLoading && (
                        <div className={styles.loader}>
                            <CircularProgress color="secondary" />
                        </div>
                    )}
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};
