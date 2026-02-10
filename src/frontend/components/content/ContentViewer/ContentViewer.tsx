import type { Content } from '@frontend/components/content/content.types';
import type { MarginProps, PaddingProps } from '@frontend/components/ui/css-styles';
import { getMarginAndPaddingProps, getMarginAndPaddingStyle } from '@frontend/components/ui/css-styles';

import { AnyContentViewer } from './AnyContentViewer';

interface ContentViewerProps extends MarginProps, PaddingProps {
    content?: Content;
    activityId?: number;
}

export const ContentViewer = ({ content = [], activityId, ...otherProps }: ContentViewerProps) => {
    const { marginAndPaddingProps } = getMarginAndPaddingProps(otherProps);
    const marginAndPaddingStyle = { ...{ marginTop: '32px', marginBottom: '32px' }, ...getMarginAndPaddingStyle(marginAndPaddingProps) };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', ...marginAndPaddingStyle }}>
            {content.map((content, index) => (
                <AnyContentViewer key={index} content={content} activityId={activityId} />
            ))}
        </div>
    );
};
