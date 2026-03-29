import { describe, expect, it, jest } from '@jest/globals';
import { beforeAll } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('@frontend/svg/checkedIcon.svg', () => {
    const React = jest.requireActual('react') as typeof import('react');

    return {
        __esModule: true,
        default: (props: React.SVGProps<SVGSVGElement>) => React.createElement('svg', props),
    };
});

jest.mock('@frontend/svg/uncheckedIcon.svg', () => {
    const React = jest.requireActual('react') as typeof import('react');

    return {
        __esModule: true,
        default: (props: React.SVGProps<SVGSVGElement>) => React.createElement('svg', props),
    };
});

let Checkbox: typeof import('./Checkbox').Checkbox;

beforeAll(async () => {
    ({ Checkbox } = await import('./Checkbox'));
});

describe('Checkbox', () => {
    it('renders the label associated to the checkbox button and reflects the checked state', () => {
        render(<Checkbox name="terms" label="Accept terms" isChecked />);

        const checkbox = screen.getByRole('checkbox', { name: 'Accept terms' });

        expect(checkbox).toHaveAttribute('id', 'terms');
        expect(checkbox).toHaveAttribute('aria-checked', 'true');
        expect(checkbox).toHaveAttribute('data-state', 'checked');
        expect(screen.getByLabelText('Accept terms')).toBe(checkbox);
    });

    it('calls onChange with the next checked state', async () => {
        const user = userEvent.setup();
        const onChange = jest.fn();

        render(<Checkbox name="updates" label="Receive updates" isChecked={false} onChange={onChange} />);

        await user.click(screen.getByRole('checkbox', { name: 'Receive updates' }));

        expect(onChange).toHaveBeenCalledWith(true);
    });

    it('disables interaction when requested', async () => {
        const user = userEvent.setup();
        const onChange = jest.fn();

        render(<Checkbox name="policy" label="Privacy policy" isChecked={false} isDisabled onChange={onChange} />);

        const checkbox = screen.getByRole('checkbox', { name: 'Privacy policy' });

        expect(checkbox).toBeDisabled();

        await user.click(checkbox);

        expect(onChange).not.toHaveBeenCalled();
    });
});
