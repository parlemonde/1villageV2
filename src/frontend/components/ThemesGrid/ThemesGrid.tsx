import type { ReactElement } from 'react';

import styles from './themes-grid.module.css';

export interface Theme<T extends string> {
    name: T;
    label: string;
    icon?: ReactElement;
}

interface ThemesGridProps<T extends string> {
    themes: Theme<T>[];
    onClick: (theme: T) => void;
}

export function ThemesGrid<T extends string>({ themes, onClick }: ThemesGridProps<T>) {
    return (
        <div className={styles.themesContainer}>
            {themes.map((theme) => (
                <button key={theme.name} className={styles.themeLink} onClick={() => onClick(theme.name)}>
                    {theme.icon}
                    {theme.label}
                </button>
            ))}
        </div>
    );
}
