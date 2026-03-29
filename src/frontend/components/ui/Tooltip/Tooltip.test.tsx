import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Tooltip } from './Tooltip';
import { renderInApp } from '../../../../test/renderInApp';

describe('Tooltip', () => {
    it('returns only the children when disabled', () => {
        renderInApp(
            <Tooltip isEnabled={false} content="More info">
                <button type="button">Trigger</button>
            </Tooltip>,
        );

        expect(screen.getByRole('button', { name: 'Trigger' })).toBeInTheDocument();
        expect(screen.queryByText('More info')).not.toBeInTheDocument();
    });

    it('renders the content and arrow when enabled', async () => {
        const user = userEvent.setup();

        renderInApp(
            <Tooltip content="More info" hasArrow>
                <button type="button">Trigger</button>
            </Tooltip>,
        );

        await user.hover(screen.getByRole('button', { name: 'Trigger' }));

        expect(await screen.findByRole('tooltip')).toHaveTextContent('More info');
        expect(document.querySelector('.tooltipArrow')).toBeInTheDocument();
    });
});
