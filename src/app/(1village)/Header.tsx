'use client';

import { HamburgerMenuIcon } from '@radix-ui/react-icons';
import React, { useContext, useState } from 'react';

import { NavigationMobileMenu } from './Navigation';
import styles from './header.module.css';
import { BackDrop } from '@/components/layout/BackDrop';
import { Button } from '@/components/layout/Button';
import { IconButton } from '@/components/layout/Button';
import { Dropdown } from '@/components/layout/Dropdown';
import { DropdownMenuItem } from '@/components/layout/Dropdown/DropdownMenuItem';
import { FlexItem } from '@/components/layout/Flex';
import { Field } from '@/components/layout/Form';
import { Select } from '@/components/layout/Form/Select';
import { Modal } from '@/components/layout/Modal';
import { UserContext } from '@/contexts/userContext';
import { VillageContext } from '@/contexts/villageContext';
import { logout } from '@/server-actions/authentication/logout';
import { setVillage } from '@/server-actions/set-village';
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
                <FlexItem flexGrow={1} flexShrink={1} flexBasis="0">
                    <div className={styles.logoContainer}>
                        <LogoSVG className={styles.logo} />
                        <span className={styles.title}>1Village</span>
                    </div>
                </FlexItem>
                {user.role === 'admin' && <VillageSelector />}
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

const VillageSelector = () => {
    const { village } = useContext(VillageContext);
    const [isModalOpen, setIsModalOpen] = useState(village === undefined);
    const [villageId, setVillageId] = useState(village?.id);
    return (
        <>
            <Button size="sm" isUpperCase={false} color="secondary" onClick={() => setIsModalOpen(true)} label="Changer de village" />
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    if (village !== undefined) {
                        setIsModalOpen(false);
                    }
                }}
                hasCloseButton={village !== undefined}
                hasCancelButton={false}
                onConfirm={async () => {
                    if (!villageId) {
                        return;
                    }
                    try {
                        await setVillage(villageId);
                    } catch {
                        // TODO: handle error
                    }
                    setIsModalOpen(false);
                }}
                confirmLabel="Choisir"
                isConfirmDisabled={!villageId}
                title="Sélectionner un village"
            >
                <Field
                    name="village"
                    label="Village"
                    input={
                        <Select
                            isFullWidth
                            value={villageId ? `${villageId}` : undefined}
                            onChange={(value) => setVillageId(Number(value))}
                            placeholder="Sélectionner un village"
                            options={[
                                { label: 'Village 1', value: '1' },
                                { label: 'Village 2', value: '2' },
                            ]}
                        />
                    }
                />
            </Modal>
        </>
    );
};
