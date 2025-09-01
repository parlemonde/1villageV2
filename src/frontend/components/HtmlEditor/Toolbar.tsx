import { setBlockType } from 'prosemirror-commands';
import type { EditorState } from 'prosemirror-state';
import type { EditorView } from 'prosemirror-view';

import { schema } from './schema';
import { Button } from '../ui/Button';

// -- Block commands --
const pCommand = setBlockType(schema.nodes.paragraph, {});
const h1Command = setBlockType(schema.nodes.heading, { level: 1 });
// const h2Command = setBlockType(schema.nodes.heading, { level: 2 });
// const h3Command = setBlockType(schema.nodes.heading, { level: 3 });

// -- Mark commands --
// const boldCommand = toggleMark(schema.marks.bold);
// const italicCommand = toggleMark(schema.marks.italic);
// const underlineCommand = toggleMark(schema.marks.underline);

interface ToolbarProps {
    state: EditorState;
    viewRef: React.RefObject<EditorView | null>;
}

export const Toolbar = (props: ToolbarProps) => {
    const { state, viewRef } = props;
    return (
        <div>
            <Button
                label="h1"
                variant="borderless"
                size="sm"
                onMouseDown={(event) => {
                    // Prevent blurring the editor
                    event.preventDefault();
                }}
                onClick={() => {
                    if (!viewRef.current) {
                        return;
                    }
                    if (h1Command(state, () => {})) {
                        h1Command(state, viewRef.current.dispatch);
                    } else {
                        pCommand(state, viewRef.current.dispatch);
                    }
                }}
            ></Button>
        </div>
    );
};
