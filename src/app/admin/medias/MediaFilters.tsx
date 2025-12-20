'use client';

import { Button, IconButton } from '@frontend/components/ui/Button';
import { Checkbox } from '@frontend/components/ui/Form/Checkbox';
import { Select } from '@frontend/components/ui/Form/Select';
import Pelico from '@frontend/svg/pelico/pelico-neutre.svg';
import { ReloadIcon } from '@radix-ui/react-icons';
import { useState } from 'react';

import styles from './media-filters.module.css';

export function MediaFilters() {
    const [isPelico, setIsPelico] = useState(false);

    return (
        <div className={styles.filters}>
            <Select placeholder="Activités" options={[]} size="sm" />
            <Select placeholder="Thèmes" options={[]} size="sm" />
            <Select placeholder="VM" options={[]} size="sm" />
            <Select placeholder="Pays" options={[]} size="sm" />
            <Select placeholder="Classes" options={[]} size="sm" />
            <div className={styles['pelico-checkbox']} onClick={() => setIsPelico(!isPelico)}>
                <Checkbox name={'isPelico'} label={<IconButton icon={Pelico} size="sm" variant="borderless" />} isChecked={isPelico} />
            </div>
            <Button
                label={<ReloadIcon width={18} height={18} style={{ minWidth: '24px' }} color={'var(--primary-color)'} />}
                size="md"
                variant="borderless"
            />
        </div>
    );
}
