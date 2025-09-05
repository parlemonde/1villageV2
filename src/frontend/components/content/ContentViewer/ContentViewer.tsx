import { HtmlViewer } from '@frontend/components/html/HtmlViewer';

import type { AnyContent } from '../content.types';

interface ContentViewerProps {
    content: AnyContent;
}

export const ContentViewer = ({ content }: ContentViewerProps) => {
    if (content.type === 'html') {
        return <HtmlViewer content={content.html} />;
    }
    return null;
};
