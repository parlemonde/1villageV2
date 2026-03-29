/* eslint-disable @next/next/no-img-element */

import { beforeAll, describe, expect, it, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

let ImageViewer: typeof import('./ImageViewer').ImageViewer;

beforeAll(async () => {
    jest.doMock('next/image', () => ({
        __esModule: true,
        default: ({ alt, ...props }: React.ComponentProps<'img'>) => <img alt={alt} {...props} />,
    }));

    ({ ImageViewer } = await import('./ImageViewer'));
});

describe('ImageViewer', () => {
    it('renders the image and opens the fullscreen modal on click', async () => {
        const user = userEvent.setup();

        render(<ImageViewer imageUrl="/image.png" width="300px" height="200px" alt="Village map" />);

        await user.click(screen.getByAltText('Village map'));

        expect(screen.getByText('Village map')).toBeInTheDocument();
        expect(screen.getAllByAltText('Village map')).toHaveLength(2);
    });
});
