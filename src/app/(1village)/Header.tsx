'use client';

import { BackDrop } from '@frontend/components/ui/BackDrop';
import { Button } from '@frontend/components/ui/Button';
import { IconButton } from '@frontend/components/ui/Button';
import { CircularProgress } from '@frontend/components/ui/CircularProgress';
import { Dropdown } from '@frontend/components/ui/Dropdown';
import { DropdownMenuItem } from '@frontend/components/ui/Dropdown/DropdownMenuItem';
import { Field } from '@frontend/components/ui/Form';
import { Select } from '@frontend/components/ui/Form/Select';
import { Modal } from '@frontend/components/ui/Modal';
import { Title } from '@frontend/components/ui/Title';
import { UserContext } from '@frontend/contexts/userContext';
import { VillageContext } from '@frontend/contexts/villageContext';
import CogIcon from '@frontend/svg/cogIcon.svg';
import LogoSVG from '@frontend/svg/logo.svg';
import { jsonFetcher } from '@lib/json-fetcher';
import { AvatarIcon, ExitIcon, GearIcon, HamburgerMenuIcon } from '@radix-ui/react-icons';
import type { Village } from '@server/database/schemas/villages';
import { logout } from '@server-actions/authentication/logout';
import { setVillage } from '@server-actions/villages/set-village';
import React, { useContext, useState } from 'react';
import useSWR from 'swr';

import { NavigationMobileMenu } from './Navigation';
import styles from './header.module.css';

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
                <div style={{ flex: '1 1 0' }}>
                    <div className={styles.logoContainer}>
                        <LogoSVG className={styles.logo} />
                        <span className={styles.title}>1Village</span>
                    </div>
                </div>
                {user.role === 'admin' && <VillageSelector />}
                <Dropdown trigger={<IconButton icon={CogIcon} variant="borderless" size="lg" isTabletUpOnly />} align="end">
                    {user?.role === 'admin' && <DropdownMenuItem label="Portail admin" href="/admin" icon={GearIcon} />}
                    <DropdownMenuItem label="Mon compte" href="/mon-compte" icon={AvatarIcon} />
                    <DropdownMenuItem label="Se déconnecter" onClick={() => logout()} color="danger" icon={ExitIcon} />
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

    const { data, isLoading } = useSWR<Village[], Error>('/api/villages', jsonFetcher);

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
                title="Sélectionner un village"
                hasCloseButton={village !== undefined}
                hasFooter={false}
                isConfirmDisabled={!villageId || isLoading}
            >
                {isLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', padding: '16px' }}>
                        <CircularProgress />
                    </div>
                ) : (
                    <>
                        <Field
                            name="village"
                            label="Village"
                            input={
                                <Select
                                    isFullWidth
                                    color="secondary"
                                    value={villageId ? `${villageId}` : undefined}
                                    onChange={(value) => setVillageId(Number(value))}
                                    placeholder="Sélectionner un village"
                                    options={(data || []).map((village) => ({
                                        label: village.name,
                                        value: `${village.id}`,
                                    }))}
                                />
                            }
                        />
                        <div style={{ width: '100%', textAlign: 'right', marginTop: '16px' }}>
                            <Button
                                color="secondary"
                                variant={village === undefined ? 'outlined' : 'contained'}
                                label="Choisir"
                                onClick={async () => {
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
                                disabled={!villageId || isLoading}
                            />
                        </div>
                        {village === undefined && (
                            <>
                                <div style={{ width: '100%', borderTop: '1px solid #e0e0e0', margin: '32px 0 10px 0', textAlign: 'center' }}>
                                    <Title
                                        variant="h3"
                                        color="inherit"
                                        paddingX="md"
                                        style={{ display: 'inline', position: 'relative', top: '-15px', backgroundColor: 'white' }}
                                    >
                                        OU
                                    </Title>
                                </div>
                                <div style={{ width: '100%', textAlign: 'center' }}>
                                    <Button as="a" href="/admin" color="secondary" variant="contained" label="Aller à l'interface Admin" />
                                </div>
                            </>
                        )}
                    </>
                )}
            </Modal>
        </>
    );
};
