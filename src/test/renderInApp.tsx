import { render as testingLibraryRender } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { Tooltip } from 'radix-ui';

const AppWrapper = ({ children }: React.PropsWithChildren) => {
    return <Tooltip.Provider delayDuration={0}>{children}</Tooltip.Provider>;
};

export const renderInApp = (ui: React.ReactElement, options?: Omit<RenderOptions, 'wrapper'>) => {
    return testingLibraryRender(ui, {
        ...options,
        wrapper: AppWrapper,
    });
};
