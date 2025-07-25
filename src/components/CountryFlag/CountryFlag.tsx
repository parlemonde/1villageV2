import React from 'react';

import MysteryFlag from '@/svg/mysteryFlag.svg';

const sizes = {
    small: 12,
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
            style={{ ...style, width: 'auto', height: sizes[size], borderRadius: '2px' }}
            src={`/static/country-flags/${country.toLowerCase()}.svg`}
        ></img>
    );
};
