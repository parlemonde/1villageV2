import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ImageViewer } from './ImageViewer';

describe('ImageViewer', () => {
    it('renders the image and opens the fullscreen modal on click', async () => {
        const user = userEvent.setup();

        render(<ImageViewer imageUrl="/image.png" width="300px" height="200px" alt="Village map" />);

        await user.click(screen.getByAltText('Village map'));

        expect(screen.getByText('Village map')).toBeInTheDocument();
        expect(screen.getAllByAltText('Village map')).toHaveLength(2);
    });
});
