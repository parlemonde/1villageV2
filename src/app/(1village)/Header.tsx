'use client';

import { HamburgerMenuIcon } from '@radix-ui/react-icons';
import React, { useContext, useState } from 'react';

import { NavigationMobileMenu } from './Navigation';
import styles from './header.module.css';
import { BackDrop } from '@/components/layout/BackDrop';
import { IconButton } from '@/components/layout/Button';
import { Dropdown } from '@/components/layout/Dropdown';
import { DropdownMenuItem } from '@/components/layout/Dropdown/DropdownMenuItem';
import { Flex } from '@/components/layout/Flex';
import { UserContext } from '@/contexts/userContext';
import { logout } from '@/server-actions/authentication/logout';
import CogIcon from '@/svg/cogIcon.svg';
import LogoSVG from '@/svg/logo.svg';

export const Header = () => {
    const { user } = useContext(UserContext);
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
                <Dropdown trigger={<IconButton icon={CogIcon} variant="borderless" size="lg" isTabletUpOnly />} align="end">
                    {user?.role === 'admin' && <DropdownMenuItem label="Admin" href="/admin" />}
                    <DropdownMenuItem label="Mon compte" />
                    <DropdownMenuItem label="Se déconnecter" onClick={() => logout()} color="danger" />
                </Dropdown>
            </header>
            {isOpen && (
                <BackDrop onClick={() => setIsOpen(false)}>
                    <NavigationMobileMenu onClose={() => setIsOpen(false)} />
                </BackDrop>
            )}
        </div>
    );
};
