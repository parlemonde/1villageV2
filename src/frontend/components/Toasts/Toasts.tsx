'use client';

import { Cross1Icon } from '@radix-ui/react-icons';
import classNames from 'clsx';
import { Toast } from 'radix-ui';
import * as React from 'react';

import { TOAST_EVENT } from './toast-events';
import styles from './toasts.module.css';
import type { ToastMessage } from './toasts.types';

type Toast = ToastMessage & {
    id: number;
};

export const Toasts = () => {
    const nextKey = React.useRef(0);
    const [toasts, setToasts] = React.useState<Toast[]>([]);

    const onAddToast = React.useCallback((event: CustomEvent<ToastMessage>) => {
        setToasts((prevToasts) => {
            const newToasts = [...prevToasts];
            newToasts.push({
                id: nextKey.current,
                ...event.detail,
            });
            nextKey.current += 1;
            if (newToasts.length > 10) {
                newToasts.splice(0, 1);
            }
            return newToasts;
        });
    }, []);

    const onDiscardToast = (toastId: number) => {
        setToasts((prevToasts) => {
            const newToasts = [...prevToasts];
            const deleteIndex = newToasts.findIndex((t) => t.id === toastId);
            if (deleteIndex !== -1) {
                newToasts.splice(deleteIndex, 1);
            }
            return newToasts;
        });
    };

    // Listen to global add toast events.
    React.useEffect(() => {
        document.addEventListener(TOAST_EVENT, onAddToast as EventListener);
        return () => {
            document.removeEventListener(TOAST_EVENT, onAddToast as EventListener);
        };
    }, [onAddToast]);

    return (
        <Toast.Provider duration={5000}>
            {toasts.map((toast) => (
                <Toast.Root
                    key={`${toast.id}`}
                    className={classNames(styles.toast, styles[`toast--${toast.type}`])}
                    open={true}
                    onOpenChange={(isOpen) => {
                        if (!isOpen) {
                            onDiscardToast(toast.id);
                        }
                    }}
                >
                    <Toast.Description>{toast.message}</Toast.Description>
                    <Toast.Close asChild>
                        <button className={styles.closeButton}>
                            <Cross1Icon />
                        </button>
                    </Toast.Close>
                </Toast.Root>
            ))}
            <Toast.Viewport className={styles.toastViewport} style={toasts.length === 0 ? { paddingTop: 0 } : undefined} />
        </Toast.Provider>
    );
};
