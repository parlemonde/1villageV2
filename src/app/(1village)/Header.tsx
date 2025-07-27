'use client';

import { HamburgerMenuIcon } from '@radix-ui/react-icons';
import React, { useState } from 'react';

import styles from './header.module.css';
import { BackDrop } from '@/components/layout/BackDrop';
import { IconButton } from '@/components/layout/Button';
import { Flex } from '@/components/layout/Flex';
import CogIcon from '@/svg/cogIcon.svg';
import LogoSVG from '@/svg/logo.svg';

export const Header = () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className={styles.headerContainer}>
            <header className={styles.header}>
                <div className={styles.menuButton}>
                    <IconButton
                        icon={HamburgerMenuIcon}
                        variant="borderless"
                        size="lg"
                        className={styles.menuButton}
                        onClick={() => setIsOpen(!isOpen)}
                    />
                </div>
                <Flex alignItems="center">
                    <LogoSVG className={styles.logo} />
                    <span className={styles.title}>1Village</span>
                </Flex>
                <IconButton icon={CogIcon} variant="borderless" size="lg" isTabletUpOnly />
            </header>
            {isOpen && (
                <BackDrop onClick={() => setIsOpen(false)}>
                    <div style={{ width: '400px', maxWidth: '100%', height: '100%', backgroundColor: 'white' }} onClick={(e) => e.stopPropagation()}>
                        Navigation (TODO)
                    </div>
                </BackDrop>
            )}
        </div>
    );
};
