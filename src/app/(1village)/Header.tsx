'use client';

import { BackDrop } from '@frontend/components/ui/BackDrop';
import { Button } from '@frontend/components/ui/Button';
import { IconButton } from '@frontend/components/ui/Button';
import { Dropdown } from '@frontend/components/ui/Dropdown';
import { DropdownMenuItem } from '@frontend/components/ui/Dropdown/DropdownMenuItem';
import { Link } from '@frontend/components/ui/Link/Link';
import { VillageSelector } from '@frontend/components/village/VillageSelector';
import { UserContext } from '@frontend/contexts/userContext';
import CogIcon from '@frontend/svg/cogIcon.svg';
import LogoSVG from '@frontend/svg/logo.svg';
import FamilyIcon from '@frontend/svg/navigation/family.svg';
import { AvatarIcon, ExitIcon, GearIcon, HamburgerMenuIcon, MixerHorizontalIcon, DrawingPinIcon, ChatBubbleIcon } from '@radix-ui/react-icons';
import { logout } from '@server-actions/authentication/logout';
import { useExtracted } from 'next-intl';
import { useContext, useState } from 'react';

import { NavigationMobileMenu } from './Navigation';
import styles from './header.module.css';

export const Header = () => {
    const { user } = useContext(UserContext);
    const [isOpen, setIsOpen] = useState(false);
    const tCommon = useExtracted('common');

    return (
        <div className={styles.headerContainer}>
            <header className={styles.header}>
                <div className={styles.menuButton}>
                    <IconButton
                        icon={HamburgerMenuIcon}
                        variant="borderless"
                        size="lg"
                        color="primary"
                        className={styles.menuButton}
                        onClick={() => setIsOpen(!isOpen)}
                    />
                </div>
                <div className={styles.navContainer}>
                    <Link href="/" className={styles.logoContainer}>
                        <LogoSVG className={styles.logo} />
                        <span className={styles.title}>1Village</span>
                    </Link>
                    {user?.role === 'teacher' && (
                        <div className={styles.teacherButtonContainer}>
                            <Button
                                leftIcon={<DrawingPinIcon width="24" height="24" />}
                                variant="borderless"
                                color="primary"
                                size="md"
                                isUpperCase={false}
                                label={tCommon('Mes ressources')}
                                hideLabelOnMobile
                                as="a"
                                href="https://prof.parlemonde.org/les-ressources/"
                            />
                            <Button
                                leftIcon={<ChatBubbleIcon width="24" height="24" />}
                                variant="borderless"
                                color="primary"
                                size="md"
                                isUpperCase={false}
                                label={tCommon('Ma messagerie')}
                                hideLabelOnMobile
                                as="a"
                                href="https://prof.parlemonde.org/la-salle/"
                            />
                        </div>
                    )}
                </div>
                {user.role === 'admin' && <VillageSelector />}
                <Dropdown trigger={<IconButton icon={CogIcon} variant="borderless" size="lg" isTabletUpOnly />} align="end">
                    {user?.role === 'admin' && <DropdownMenuItem label={tCommon('Portail admin')} href="/admin" icon={GearIcon} />}
                    <DropdownMenuItem label={tCommon('Mon compte')} href="/mon-compte" icon={AvatarIcon} />
                    {user?.role === 'teacher' && <DropdownMenuItem label={tCommon('Mes familles')} href="/familles/1" icon={FamilyIcon} />}
                    {user?.role === 'admin' && <DropdownMenuItem label={tCommon('Paramètres')} href="/parametres" icon={MixerHorizontalIcon} />}
                    <DropdownMenuItem label={tCommon('Se déconnecter')} onClick={() => logout()} color="danger" icon={ExitIcon} />
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
