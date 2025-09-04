import { Button } from '@frontend/components/ui/Button';
import { Field, Input } from '@frontend/components/ui/Form';
import type { EditorState } from 'prosemirror-state';
import type { EditorView } from 'prosemirror-view';
import { Popover, Toolbar as RadixToolbar } from 'radix-ui';
import { useState } from 'react';

import { addLink, deleteLink, getLinkAtSelection } from './commands/link-command';
import styles from './link-button.module.css';

interface LinkButtonProps {
    className?: string;
    state: EditorState;
    viewRef: React.RefObject<EditorView | null>;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

export const LinkButton = ({ className, state, viewRef, isOpen, setIsOpen }: LinkButtonProps) => {
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');
    const [canDelete, setCanDelete] = useState(false);

    return (
        <Popover.Root
            open={isOpen}
            onOpenChange={(newIsOpen) => {
                setIsOpen(newIsOpen);
                if (newIsOpen) {
                    const { title, url, start, end } = getLinkAtSelection(state);
                    setTitle(title);
                    setUrl(url);
                    setCanDelete(start !== null && end !== null);
                }
            }}
        >
            <Popover.Trigger asChild>
                <RadixToolbar.Button className={className}>Lien</RadixToolbar.Button>
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Content className={styles.popoverContent} sideOffset={8} onMouseDown={(event) => event.stopPropagation()}>
                    <Field
                        label="Titre du lien"
                        name="title"
                        input={
                            <Input
                                size="sm"
                                id="title"
                                name="title"
                                isFullWidth
                                placeholder="Entrez le titre du lien"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        }
                    />
                    <Field
                        marginTop="sm"
                        label="URL"
                        name="url"
                        input={
                            <Input
                                size="sm"
                                id="url"
                                name="url"
                                isFullWidth
                                placeholder="Entrez l'URL"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                            />
                        }
                    />
                    <div style={{ textAlign: 'right', marginTop: '4px' }}>
                        {canDelete && (
                            <Button
                                size="sm"
                                marginRight="xs"
                                color="error"
                                label="Supprimer"
                                onClick={() => {
                                    setIsOpen(false);
                                    deleteLink(state, viewRef.current?.dispatch);
                                }}
                            />
                        )}
                        <Button
                            size="sm"
                            color="primary"
                            label={canDelete ? 'Modifier' : 'Ajouter'}
                            onClick={() => {
                                addLink(state, title, url, viewRef.current?.dispatch);
                                setIsOpen(false);
                            }}
                        />
                    </div>
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
};
