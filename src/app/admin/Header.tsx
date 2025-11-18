'use client';

import { Button, IconButton } from '@frontend/components/ui/Button';
import { Dropdown } from '@frontend/components/ui/Dropdown';
import { DropdownMenuItem } from '@frontend/components/ui/Dropdown/DropdownMenuItem';
import CogIcon from '@frontend/svg/cogIcon.svg';
import LogoSVG from '@frontend/svg/logo.svg';
import { ExitIcon, HamburgerMenuIcon, HomeIcon } from '@radix-ui/react-icons';
import { logout } from '@server-actions/authentication/logout';
import React from 'react';
import styles from './header.module.css';

export const Header = () => {
    return (
        <div className={styles.headerContainer}>
            <header className={styles.header}>
                <div className={styles.menuButton}>
                    <IconButton icon={HamburgerMenuIcon} variant="borderless" size="lg" className={styles.menuButton} />
                </div>
                <div style={{ flex: '1 1 0' }}>
                    <div className={styles.logoContainer}>
                        <LogoSVG className={styles.logo} />
                        <span className={styles.title}>1Village</span>
                    </div>
                </div>

                <Dropdown trigger={<IconButton icon={CogIcon} variant="borderless" size="lg" isTabletUpOnly />} align="end">
                    <DropdownMenuItem label="Aller au village" color="primary" href="/" icon={HomeIcon} />
                    <DropdownMenuItem label="Se déconnecter" onClick={() => logout()} color="danger" icon={ExitIcon} />
                </Dropdown>
            </header>
        </div>
    );
};
