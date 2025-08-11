'use client';

import { MagnifyingGlassIcon } from '@radix-ui/react-icons';

import styles from './villages-table.module.css';
import { Input } from '@/components/layout/Form';
import type { Village } from '@/database/schemas/villages';

const villages: Village[] = [
    {
        id: 1,
        plmId: 1,
        name: 'Village-monde France - Belgique',
        countries: ['FR', 'BE'],
        activePhase: 1,
        phaseStartDates: {
            1: '2021-01-01',
        },
    },
    {
        id: 2,
        plmId: 2,
        name: 'Village-monde France - Allemagne',
        countries: ['FR', 'DE'],
        activePhase: 1,
        phaseStartDates: {
            1: '2021-01-01',
        },
    },
    {
        id: 3,
        plmId: 3,
        name: 'Village-monde France - Espagne',
        countries: ['FR', 'ES'],
        activePhase: 1,
        phaseStartDates: {
            1: '2021-01-01',
        },
    },
    {
        id: 4,
        plmId: 4,
        name: 'Village-monde France - Italie',
        countries: ['FR', 'IT'],
        activePhase: 1,
        phaseStartDates: {
            1: '2021-01-01',
        },
    },
];

export function VillagesTable() {
    return (
        <div>
            <Input
                iconAdornment={<MagnifyingGlassIcon width={20} height="auto" fill="currentColor" />}
                iconAdornmentProps={{
                    position: 'left',
                }}
                isFullWidth
                placeholder="Rechercher un village-monde..."
            />
            <table className={styles.table}>
                <colgroup>
                    <col />
                    <col />
                    <col style={{ width: '140px' }} />
                    <col style={{ width: '150px' }} />
                    <col style={{ width: '140px' }} />
                    <col style={{ width: '80px' }} />
                </colgroup>
                <thead className={styles.thead}>
                    <tr>
                        <th className={styles.headerCell} align="left">
                            Nom du village
                        </th>
                        <th className={styles.headerCell} align="left">
                            Pays
                        </th>
                        <th className={styles.headerCell}>Phase active</th>
                        <th className={styles.headerCell}>Nombre de classes</th>
                        <th className={styles.headerCell}>Nombre de posts</th>
                        <th className={styles.headerCell} align="right">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {villages.map((village) => (
                        <tr key={village.id} className={styles.row}>
                            <td className={styles.cell}>{village.name}</td>
                            <td className={styles.cell}>{village.countries.join(', ')}</td>
                            <td className={styles.cell} align="center">
                                {village.activePhase}
                            </td>
                            <td className={styles.cell} align="center">
                                0
                            </td>
                            <td className={styles.cell} align="center">
                                0
                            </td>
                            <td className={styles.cell} align="right">
                                plop
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
