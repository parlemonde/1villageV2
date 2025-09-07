import { useDragHandler } from '@frontend/hooks/useDragHandler';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import Image from 'next/image';
import { AspectRatio } from 'radix-ui';
import React from 'react';

const PRIMARY_COLOR = 'var(--primary-color)';
const CANVAS_ID = 'cropper-canvas-';
const CURSOR_MAP: Partial<Record<string, string>> = {
    nw: 'nwse-resize',
    ne: 'nesw-resize',
    se: 'nwse-resize',
    sw: 'nesw-resize',
    n: 'ns-resize',
    e: 'ew-resize',
    s: 'ns-resize',
    w: 'ew-resize',
};
const RATIO = 4 / 3;

export interface CropperRef {
    onCrop: () => Promise<Blob>;
}

interface CropperProps {
    imageUrl: string;
    cropperRef?: React.RefObject<CropperRef | null>;
}

export const Cropper = ({ imageUrl, cropperRef }: CropperProps) => {
    const id = React.useId();
    const canvasId = `${CANVAS_ID}-${id}`;
    const imageSizeRef = React.useRef({ width: 0, height: 0 }); // In pixels
    const minValuesRef = React.useRef({ minX: 0, minY: 0, maxWidth: 0, maxHeight: 0 }); // In percentage
    const canvasSizeRef = React.useRef({ width: 0, height: 0 }); // use for initialization only
    const [x, setX] = React.useState(0); // In percentage
    const [y, setY] = React.useState(0); // In percentage
    const [width, setWidth] = React.useState(1); // In percentage
    const [height, setHeight] = React.useState(1); // In percentage
    const [canvasWidth, setCanvasWidth] = React.useState(0); // In pixels
    const [canvasHeight, setCanvasHeight] = React.useState(0); // In pixels
    const [hasInitialized, setHasInitialized] = React.useState(false);
    const [hasError, setHasError] = React.useState(false);

    // Reset the initialized and error state when the image url changes
    React.useEffect(() => {
        setHasInitialized(false);
        setHasError(false);
        imageSizeRef.current = { width: 0, height: 0 };
    }, [imageUrl]);

    // Initialize the cropper
    // Set the values so that the cropper is around the image and the image is in the center of the canvas
    const initCropper = React.useCallback(() => {
        if (
            hasInitialized ||
            canvasSizeRef.current.width === 0 ||
            canvasSizeRef.current.height === 0 ||
            imageSizeRef.current.width === 0 ||
            imageSizeRef.current.height === 0
        ) {
            return;
        }
        setHasInitialized(true);
        const imageRatio = imageSizeRef.current.width / imageSizeRef.current.height;
        const imageWidth =
            imageRatio > RATIO
                ? canvasSizeRef.current.width
                : (canvasSizeRef.current.height / imageSizeRef.current.height) * imageSizeRef.current.width;
        const imageHeight =
            imageRatio > RATIO
                ? (canvasSizeRef.current.width / imageSizeRef.current.width) * imageSizeRef.current.height
                : canvasSizeRef.current.height;
        const newXPct = (canvasSizeRef.current.width - imageWidth) / 2 / canvasSizeRef.current.width;
        const newYPct = (canvasSizeRef.current.height - imageHeight) / 2 / canvasSizeRef.current.height;
        setX(newXPct);
        setY(newYPct);
        setWidth(imageWidth / canvasSizeRef.current.width);
        setHeight(imageHeight / canvasSizeRef.current.height);
        minValuesRef.current.minX = newXPct;
        minValuesRef.current.minY = newYPct;
        minValuesRef.current.maxWidth = imageWidth / canvasSizeRef.current.width;
        minValuesRef.current.maxHeight = imageHeight / canvasSizeRef.current.height;
    }, [hasInitialized]);

    // Observe the canvas size and initialize the cropper when the canvas size changes
    const resizeObserver = React.useMemo<ResizeObserver>(
        () =>
            new ResizeObserver((entries) => {
                for (const entry of entries) {
                    if (entry.target.id === canvasId) {
                        setCanvasWidth(entry.contentRect.width);
                        setCanvasHeight(entry.contentRect.height);
                        canvasSizeRef.current.width = entry.contentRect.width;
                        canvasSizeRef.current.height = entry.contentRect.height;
                        initCropper();
                    }
                }
            }),
        [canvasId, initCropper],
    );
    const onCanvasRef = React.useCallback(
        (canvas: HTMLDivElement | null) => {
            if (canvas) {
                resizeObserver.observe(canvas);
            } else {
                resizeObserver.disconnect();
            }
        },
        [resizeObserver],
    );

    const onMove = useDragHandler(() => {
        if (!hasInitialized) {
            return false; // No dragging if not initialized
        }
        const initialX = x * canvasWidth;
        const initialY = y * canvasHeight;
        const minX = minValuesRef.current.minX * canvasWidth;
        const minY = minValuesRef.current.minY * canvasHeight;
        const maxX = minValuesRef.current.maxWidth * canvasWidth + minX - canvasWidth * width;
        const maxY = minValuesRef.current.maxHeight * canvasHeight + minY - canvasHeight * height;
        return {
            onDrag: (_: MouseEvent, dx: number, dy: number) => {
                const newX = dx + initialX;
                const newY = dy + initialY;
                setX(Math.max(minX, Math.min(maxX, newX)) / canvasWidth);
                setY(Math.max(minY, Math.min(maxY, newY)) / canvasHeight);
            },
            onDragEnd: (_: MouseEvent | KeyboardEvent, cancelled: boolean) => {
                if (cancelled) {
                    setX(initialX / canvasWidth);
                    setY(initialY / canvasHeight);
                }
            },
        };
    });

    const onResize = useDragHandler((direction: 'nw' | 'ne' | 'se' | 'sw' | 'n' | 'e' | 's' | 'w') => {
        if (!hasInitialized) {
            return false; // No resizing if not initialized
        }
        const initialX = x * canvasWidth;
        const initialY = y * canvasHeight;
        const initialWidth = canvasWidth * width;
        const initialHeight = canvasHeight * height;
        const minX = minValuesRef.current.minX * canvasWidth;
        const minY = minValuesRef.current.minY * canvasHeight;
        const maxWidth =
            direction === 'ne' || direction === 'se' || direction === 'e'
                ? minValuesRef.current.maxWidth * canvasWidth + minX - initialX
                : initialX + initialWidth - minX;
        const maxHeight =
            direction === 'se' || direction === 'sw' || direction === 's'
                ? minValuesRef.current.maxHeight * canvasHeight + minY - initialY
                : initialY + initialHeight - minY;
        return {
            onDrag: (_: MouseEvent, dx: number, dy: number) => {
                const newWidth =
                    initialWidth +
                    dx * (direction === 'n' || direction === 's' ? 0 : direction === 'ne' || direction === 'se' || direction === 'e' ? 1 : -1);
                const newHeight =
                    initialHeight +
                    dy * (direction === 'w' || direction === 'e' ? 0 : direction === 'se' || direction === 'sw' || direction === 's' ? 1 : -1);
                const finalWidth = Math.max(0.1 * canvasWidth, Math.min(maxWidth, newWidth));
                const finalHeight = Math.max(0.1 * canvasHeight, Math.min(maxHeight, newHeight));
                const finalX = direction === 'ne' || direction === 'se' || direction === 'e' ? initialX : initialX + initialWidth - finalWidth;
                const finalY = direction === 'se' || direction === 'sw' || direction === 's' ? initialY : initialY + initialHeight - finalHeight;
                setX(finalX / canvasWidth);
                setY(finalY / canvasHeight);
                setWidth(finalWidth / canvasWidth);
                setHeight(finalHeight / canvasHeight);
            },
            onDragEnd: (_: MouseEvent | KeyboardEvent, cancelled: boolean) => {
                if (cancelled) {
                    setX(initialX / canvasWidth);
                    setY(initialY / canvasHeight);
                    setWidth(initialWidth / canvasWidth);
                    setHeight(initialHeight / canvasHeight);
                }
            },
        };
    });

    const onCrop = async () => {
        if (!imageUrl || !imageSizeRef.current.width || !imageSizeRef.current.height) {
            throw new Error('Image not loaded');
        }
        if (!hasInitialized) {
            throw new Error('Cropper not initialized');
        }

        // Draw image on canvas
        const imageRatio = imageSizeRef.current.width / imageSizeRef.current.height;
        const imageWidth = imageRatio > RATIO ? imageSizeRef.current.width : imageSizeRef.current.height * RATIO;
        const imageHeight = imageRatio > RATIO ? imageSizeRef.current.width / RATIO : imageSizeRef.current.height;
        const canvas = document.createElement('canvas');
        canvas.width = imageWidth;
        canvas.height = imageHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Could not create canvas context');
        }
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const image = document.createElement('img');
        await new Promise((resolve) => {
            image.onload = () => {
                resolve(undefined);
            };
            image.src = imageUrl;
        });
        ctx.drawImage(image, (imageWidth - imageSizeRef.current.width) / 2, (imageHeight - imageSizeRef.current.height) / 2);

        // Crop image
        const newX = x * imageWidth;
        const newY = y * imageHeight;
        const newWidth = width * imageWidth;
        const newHeight = height * imageHeight;
        const croppedCanvas = document.createElement('canvas');
        croppedCanvas.width = newWidth;
        croppedCanvas.height = newHeight;
        const croppedCtx = croppedCanvas.getContext('2d');
        if (!croppedCtx) {
            throw new Error('Could not create cropped canvas context');
        }
        croppedCtx.drawImage(canvas, newX, newY, newWidth, newHeight, 0, 0, newWidth, newHeight);
        const blob = await new Promise<Blob | null>((resolve) => croppedCanvas.toBlob(resolve));
        if (blob) {
            return blob;
        } else {
            throw new Error('Could not create blob');
        }
    };

    React.useImperativeHandle(cropperRef, () => ({
        onCrop,
    }));

    return (
        <AspectRatio.Root ratio={RATIO} style={{ backgroundColor: 'var(--grey-300)', padding: '20px', userSelect: 'none' }}>
            <div
                style={{ width: '100%', height: '100%', position: 'relative', backgroundColor: 'var(--grey-300)', boxSizing: 'border-box' }}
                id={canvasId}
                ref={onCanvasRef}
            >
                {/* image */}
                {imageUrl && !hasError && (
                    <Image
                        fill
                        src={imageUrl}
                        style={{ objectFit: 'contain' }}
                        onLoad={(event) => {
                            const target = event.target;
                            if (!(target instanceof HTMLImageElement)) {
                                return;
                            }
                            imageSizeRef.current.width = target.naturalWidth;
                            imageSizeRef.current.height = target.naturalHeight;
                            initCropper();
                        }}
                        onError={() => {
                            setHasError(true);
                        }}
                        alt="Image to crop"
                        unoptimized
                    />
                )}
                {hasError && (
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            fontSize: '16px',
                            color: 'var(--warning-600)',
                        }}
                    >
                        <ExclamationTriangleIcon height={20} width={20} />
                        <span>L&apos;image ne peut pas être chargée...</span>
                    </div>
                )}
                {/* invisible overlay to prevent click through */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}></div>
                {/* cropper */}
                {hasInitialized && (
                    <div
                        style={{
                            width: canvasWidth * width,
                            height: canvasHeight * height,
                            border: `2px solid ${PRIMARY_COLOR}`,
                            boxSizing: 'border-box',
                            position: 'absolute',
                            top: y * canvasHeight,
                            left: x * canvasWidth,
                            cursor: 'move',
                        }}
                        onMouseDown={onMove}
                    >
                        {(['sw', 'se', 'nw', 'ne', 'n', 'e', 's', 'w'] as const).map((direction) => (
                            <div
                                key={direction}
                                style={{
                                    width: '10px',
                                    height: '10px',
                                    backgroundColor: PRIMARY_COLOR,
                                    position: 'absolute',
                                    right: direction === 'ne' || direction === 'se' || direction === 'e' ? -5 : undefined,
                                    top:
                                        direction === 'ne' || direction === 'nw' || direction === 'n'
                                            ? -5
                                            : direction === 'e' || direction === 'w'
                                              ? (canvasHeight * height) / 2 - 5
                                              : undefined,
                                    left:
                                        direction === 'nw' || direction === 'sw' || direction === 'w'
                                            ? -5
                                            : direction === 'n' || direction === 's'
                                              ? (canvasWidth * width) / 2 - 5
                                              : undefined,
                                    bottom: direction === 'se' || direction === 'sw' || direction === 's' ? -5 : undefined,
                                    cursor: CURSOR_MAP[direction],
                                    border: '1px solid black',
                                }}
                                onMouseDown={(event) => {
                                    onResize(event, direction);
                                }}
                            ></div>
                        ))}
                    </div>
                )}
            </div>
        </AspectRatio.Root>
    );
};
