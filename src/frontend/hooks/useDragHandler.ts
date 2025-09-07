import React from 'react';

/**
 * The function to call when the mouse is dragged.
 * @param event - The mouse event.
 * @param dx - The horizontal distance from the initial position.
 * @param dy - The vertical distance from the initial position.
 */
export type OnDragHandler = (event: MouseEvent, dx: number, dy: number) => void;

/**
 * The function to call when the drag is ended.
 * @param cancelled - Whether the drag was cancelled.
 * @param endEvent - The event that ended the drag.
 */
export type OnDragEndHandler = (endEvent: MouseEvent | KeyboardEvent, cancelled: boolean) => void;

/**
 * The function to call when the drag is started.
 *
 * @param args - Extra arguments that can be passed on drag start.
 * @returns The onDrag and onDragEnd handlers. If false is returned, the drag is cancelled.
 */
export type OnDragStartHandler<Args extends Array<unknown>> = (...args: Args) =>
    | {
          onDrag: OnDragHandler;
          onDragEnd: OnDragEndHandler;
      }
    | false;

/**
 * Hook to handle drag events.
 *
 * It takes a drag-start handler that should returns the on-drag and on-drag-end handlers.
 * The goal is to block scope drag variables in the drag-start handler instead of using React state/references.
 */
export const useDragHandler = <Args extends Array<unknown>>(
    onDragStart: OnDragStartHandler<Args>,
): ((mouseDownEvent: React.MouseEvent, ...args: Args) => void) => {
    // Use a following ref for on drag start in case a state change between the mouse down and actual drag start.
    const onDragStartRef = React.useRef(onDragStart);
    React.useEffect(() => {
        onDragStartRef.current = onDragStart;
    }, [onDragStart]);

    const onMouseDown = React.useCallback(
        (mouseDownEvent: React.MouseEvent, ...args: Args) => {
            if (mouseDownEvent.button !== 0) {
                return; // Do nothing if not left click
            }
            const dragHandlers = onDragStartRef.current(...args);
            if (dragHandlers === false) {
                return;
            }

            mouseDownEvent.stopPropagation();
            const initialClientX = mouseDownEvent.clientX;
            const initialClientY = mouseDownEvent.clientY;
            const { onDrag, onDragEnd } = dragHandlers;

            const onMouseMove = (mouseMoveEvent: MouseEvent) => {
                const dx = mouseMoveEvent.clientX - initialClientX;
                const dy = mouseMoveEvent.clientY - initialClientY;
                onDrag(mouseMoveEvent, dx, dy);
            };
            const onKeyDown = (keyDownEvent: KeyboardEvent) => {
                if (keyDownEvent.key === 'Escape') {
                    onDragEnd(keyDownEvent, true);
                    window.removeEventListener('mousemove', onMouseMove);
                    window.removeEventListener('keydown', onKeyDown);
                    window.removeEventListener('mouseup', onMouseUp);
                }
            };
            const onMouseUp = (mouseUpEvent: MouseEvent) => {
                onDragEnd(mouseUpEvent, false);
                window.removeEventListener('mousemove', onMouseMove);
                window.removeEventListener('keydown', onKeyDown);
            };
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('keydown', onKeyDown);
            window.addEventListener('mouseup', onMouseUp, {
                once: true,
            });
        },
        [onDragStartRef],
    );

    return onMouseDown;
};
