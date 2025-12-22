import React from 'react';

import type { Content } from '../content.types';
import { AnyContentViewer } from './AnyContentViewer';

interface ContentViewerProps {
    content?: Content;
    activityId?: number;
}

export const ContentViewer = ({ content = [], activityId }: ContentViewerProps) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', margin: '32px 0' }}>
            {content.map((content, index) => (
                <AnyContentViewer key={index} content={content} activityId={activityId} />
            ))}
        </div>
    );
};
