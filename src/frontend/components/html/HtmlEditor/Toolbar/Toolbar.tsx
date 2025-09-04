import {
    UnderlineIcon,
    TextAlignLeftIcon,
    TextAlignCenterIcon,
    TextAlignRightIcon,
    FontBoldIcon,
    FontItalicIcon,
    TextAlignJustifyIcon,
} from '@radix-ui/react-icons';
import classNames from 'clsx';
import type { Node } from 'prosemirror-model';
import type { EditorState } from 'prosemirror-state';
import type { EditorView } from 'prosemirror-view';
import { Toolbar as RadixToolbar } from 'radix-ui';
import React, { useState } from 'react';

import { ColorButton } from './ColorButton';
import { EmojiButton } from './EmojiButton';
import { LinkButton } from './LinkButton';
import { getBlockType, setBlockType } from './commands/block-type-command';
import { getColor, setColor } from './commands/color-command';
import { getFormat, setFormat } from './commands/format-command';
import { isTextSelection } from './commands/is-text-selection';
import { isSelectionLink } from './commands/link-command';
import { getTextAlign, setTextAlign } from './commands/text-align-command';
import styles from './toolbar.module.css';

interface ToolbarProps {
    state: EditorState;
    viewRef: React.RefObject<EditorView | null>;
    isVisible?: boolean;
}

export const Toolbar = ({ state, viewRef, isVisible }: ToolbarProps) => {
    const [isColorOpen, setIsColorOpen] = useState(false);
    const [isLinkOpen, setIsLinkOpen] = useState(false);
    const [isEmojiOpen, setIsEmojiOpen] = useState(false);

    const nodes: Node[] = [];
    const cursorMarks = isTextSelection(state.selection) ? state.selection.$cursor?.marks() || null : null;
    const marks = state.storedMarks || cursorMarks || [];
    for (let i = 0; i < state.selection.ranges.length; i++) {
        const {
            $from: { pos: from },
            $to: { pos: to },
        } = state.selection.ranges[i];
        state.doc.nodesBetween(from, to, (node) => {
            nodes.push(node);
        });
    }

    const formatValue = getFormat(state, marks);
    const textAlignValue = getTextAlign(nodes);
    const blockTypeValue = getBlockType(nodes);
    const selectionColor = getColor(marks, nodes);
    const isLink = isSelectionLink(state);

    return (
        <div className={classNames(styles.toolbarRoot, { [styles.visible]: isVisible || isColorOpen || isLinkOpen || isEmojiOpen })}>
            <RadixToolbar.Root
                className={styles.toolbar}
                aria-label="Formatting options"
                onMouseDown={(event) => {
                    event.preventDefault();
                }}
            >
                <RadixToolbar.ToggleGroup
                    type="multiple"
                    aria-label="Text formatting"
                    className={styles.toolbarGroup}
                    value={formatValue}
                    onValueChange={(newValue) => {
                        setFormat(state, formatValue, newValue, viewRef.current?.dispatch);
                    }}
                >
                    <RadixToolbar.ToggleItem className={styles.toggleItem} value="bold" aria-label="Bold">
                        <FontBoldIcon width={24} height={24} />
                    </RadixToolbar.ToggleItem>
                    <RadixToolbar.ToggleItem className={styles.toggleItem} value="italic" aria-label="Italic">
                        <FontItalicIcon width={24} height={24} />
                    </RadixToolbar.ToggleItem>
                    <RadixToolbar.ToggleItem className={styles.toggleItem} value="underline" aria-label="Underline">
                        <UnderlineIcon width={24} height={24} />
                    </RadixToolbar.ToggleItem>
                </RadixToolbar.ToggleGroup>
                <RadixToolbar.Separator className={styles.toolbarSeparator} />
                <RadixToolbar.ToggleGroup
                    type="single"
                    aria-label="Text alignment"
                    className={styles.toolbarGroup}
                    value={textAlignValue}
                    onValueChange={(newValue) => {
                        setTextAlign(state, newValue, viewRef.current?.dispatch);
                    }}
                >
                    <RadixToolbar.ToggleItem className={styles.toggleItem} value="left" aria-label="Left aligned">
                        <TextAlignLeftIcon width={24} height={24} />
                    </RadixToolbar.ToggleItem>
                    <RadixToolbar.ToggleItem className={styles.toggleItem} value="center" aria-label="Center aligned">
                        <TextAlignCenterIcon width={24} height={24} />
                    </RadixToolbar.ToggleItem>
                    <RadixToolbar.ToggleItem className={styles.toggleItem} value="right" aria-label="Right aligned">
                        <TextAlignRightIcon width={24} height={24} />
                    </RadixToolbar.ToggleItem>
                    <RadixToolbar.ToggleItem className={styles.toggleItem} value="justify" aria-label="Justified">
                        <TextAlignJustifyIcon width={24} height={24} />
                    </RadixToolbar.ToggleItem>
                </RadixToolbar.ToggleGroup>
                <RadixToolbar.Separator className={styles.toolbarSeparator} />
                <RadixToolbar.ToggleGroup
                    type="single"
                    aria-label="Text level"
                    className={styles.toolbarGroup}
                    value={blockTypeValue}
                    onValueChange={(newValue) => {
                        setBlockType(state, newValue, viewRef.current?.dispatch);
                    }}
                >
                    <RadixToolbar.ToggleItem className={styles.toggleItem} value="h2" aria-label="Heading 1">
                        Titre 1
                    </RadixToolbar.ToggleItem>
                    <RadixToolbar.ToggleItem className={styles.toggleItem} value="h3" aria-label="Heading 2">
                        Titre 2
                    </RadixToolbar.ToggleItem>
                </RadixToolbar.ToggleGroup>
                <RadixToolbar.Separator className={styles.toolbarSeparator} />
                <ColorButton
                    className={styles.toggleItem}
                    isOpen={isColorOpen}
                    setIsOpen={(newIsOpen) => {
                        setIsColorOpen(newIsOpen);
                        if (!newIsOpen) {
                            viewRef.current?.focus();
                        }
                    }}
                    selectionColor={selectionColor}
                    setColor={(color) => setColor(state, color, viewRef.current?.dispatch)}
                />
                <LinkButton
                    className={classNames(styles.toggleItem, { [styles.active]: isLink })}
                    isOpen={isLinkOpen}
                    state={state}
                    viewRef={viewRef}
                    setIsOpen={(newIsOpen) => {
                        setIsLinkOpen(newIsOpen);
                        if (!newIsOpen) {
                            viewRef.current?.focus();
                        }
                    }}
                />
                <EmojiButton
                    className={styles.toggleItem}
                    isOpen={isEmojiOpen}
                    setIsOpen={(newIsOpen) => {
                        setIsEmojiOpen(newIsOpen);
                        if (!newIsOpen) {
                            viewRef.current?.focus();
                        }
                    }}
                    onInsertEmoji={(emoji) => {
                        const dispatch = viewRef.current?.dispatch;
                        if (!dispatch) {
                            return;
                        }
                        const tr = state.tr;
                        tr.insertText(emoji);
                        dispatch(tr);
                    }}
                />
            </RadixToolbar.Root>
        </div>
    );
};
