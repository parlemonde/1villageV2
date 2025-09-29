import { HtmlViewer } from '@frontend/components/html/HtmlViewer';

import type { AnyContent } from '../content.types';

interface ContentViewerProps {
    content: AnyContent;
}

export const ContentViewer = ({ content }: ContentViewerProps) => {
    if (content.type === 'html') {
        return <HtmlViewer content={content.html} />;
    }
    if (content.type === 'image') {
        return (
            <div
                style={{
                    width: '100%',
                    maxWidth: 400,
                    maxHeight: 300,
                    margin: '0 auto',
                    overflow: 'hidden',
                }}
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={content.imageUrl} alt="Image" style={{ objectFit: 'contain', width: '100%', height: 'auto', maxHeight: '300px' }} />
            </div>
        );
    }
    if (content.type === 'audio') {
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
    }
    if (content.type === 'document') {
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
    }
    return null;
};
