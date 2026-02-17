import type { AnyContent } from '@frontend/components/content/content.types';
import { H5pPlayer } from '@frontend/components/h5p';
import { HtmlViewer } from '@frontend/components/html/HtmlViewer';
import { ImageViewer } from '@frontend/components/ui/ImageViewer/ImageViewer';
import { VideoPlayer } from '@frontend/components/ui/VideoPlayer';

interface AnyContentViewerProps {
    content: AnyContent;
    activityId?: number;
}

export const AnyContentViewer = ({ content, activityId }: AnyContentViewerProps) => {
    switch (content.type) {
        case 'html':
            return <HtmlViewer content={content.html} />;
        case 'image':
            return <ImageViewer imageUrl={content.imageUrl} alt="Image" width="100%" height="300px" objectFit="contain" />;
        case 'audio':
            return (
                <div
                    style={{
                        width: '100%',
                        maxWidth: 400,
                        maxHeight: 300,
                        margin: '0 auto',
                        overflow: 'hidden',
                        textAlign: 'center',
                    }}
                >
                    <audio src={content.audioUrl} controls />
                </div>
            );
        case 'document':
            return (
                <iframe
                    src={content.documentUrl}
                    style={{
                        width: '100%',
                        height: '80vh',
                        maxWidth: 800,
                        margin: '0 auto',
                        border: '2px solid black',
                    }}
                />
            );
        case 'h5p':
            return (
                <div
                    style={{
                        width: '100%',
                        maxHeight: '75vh',
                        maxWidth: 600,
                        margin: '0 auto',
                        overflow: 'hidden',
                    }}
                >
                    <H5pPlayer contentId={content.h5pId} contextId={`activity-${activityId}`} />
                </div>
            );
        case 'video':
            return (
                <div
                    style={{
                        width: '100%',
                        maxWidth: 600,
                        maxHeight: 400,
                        margin: '0 auto',
                    }}
                >
                    <VideoPlayer src={content.videoUrl} />
                </div>
            );
        default:
            return null;
    }
};
