import { HamburgerMenuIcon } from '@radix-ui/react-icons';
import React from 'react';

import styles from './header.module.css';
import { IconButton } from '@/components/layout/Button';
import { Flex } from '@/components/layout/Flex';
import CogIcon from '@/svg/cogIcon.svg';
import LogoSVG from '@/svg/logo.svg';

export const Header = () => {
    return (
        <div className={styles.headerContainer}>
            <header className={styles.header}>
                <div className={styles.menuButton}>
                    <IconButton icon={HamburgerMenuIcon} variant="borderless" size="lg" className={styles.menuButton} />
                </div>
                <Flex alignItems="center">
                    <LogoSVG className={styles.logo} />
                    <span className={styles.title}>1Village</span>
                </Flex>
                <IconButton icon={CogIcon} variant="borderless" size="lg" isTabletUpOnly />
            </header>
        </div>
    );
};
