import MysteryFlag from '@frontend/svg/mysteryFlag.svg';
import React from 'react';

const NON_RECTANGULAR_FLAGS = new Set(['NP']); // Nepal

const sizes = {
    small: 14,
    medium: 18,
};

interface CountryFlagProps {
    isMystery?: boolean;
    country?: string;
    size?: 'small' | 'medium';
    style?: React.CSSProperties;
}
export const CountryFlag = ({ country, isMystery = false, size = 'medium', style = {} }: CountryFlagProps) => {
    if (!country || isMystery) {
        return <MysteryFlag style={{ ...style, width: 'auto', height: sizes[size], borderRadius: '2px' }} />;
    }
    return (
        // Small SVG, no need of nextjs image improvement
        // eslint-disable-next-line @next/next/no-img-element
        <img
            alt={`${country} flag`}
            style={{
                ...style,
                width: 'auto',
                height: sizes[size],
                borderRadius: '2px',
                boxShadow: NON_RECTANGULAR_FLAGS.has(country) ? 'none' : '0 0 2px var(--grey-400)',
            }}
            src={`/static/country-flags/${country.toLowerCase()}.svg`}
        ></img>
    );
};
