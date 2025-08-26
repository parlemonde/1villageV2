'use client';

import { PlusIcon, TrashIcon } from '@radix-ui/react-icons';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import styles from './village-form.module.css';
import { CountryFlag } from '@/components/CountryFlag';
import { Button, IconButton } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Form';
import { Select } from '@/components/ui/Form/Select';
import { Loader } from '@/components/ui/Loader';
import type { Village } from '@/database/schemas/villages';
import { COUNTRIES } from '@/lib/iso-3166-countries-french';
import { createVillage } from '@/server-actions/villages/create-village';
import { updateVillage } from '@/server-actions/villages/update-village';

const countryOptions = Object.entries(COUNTRIES).map(([key, value]) => ({
    label: (
        <div className={styles.countryOptions}>
            <span className={styles.countryFlag}>
                <CountryFlag size="small" country={key} />
            </span>
            <span>{value}</span>
        </div>
    ),
    value: key,
}));

interface Country {
    isoCode: string | null;
    classroomCount: number | null;
}

interface CountryFieldProps {
    index: number;
    value: Country;
    onChange: (value: Country) => void;
    onDelete?: () => void;
}
const CountryField = ({ index, value, onChange, onDelete }: CountryFieldProps) => {
    return (
        <div className={styles.countrySelect}>
            <Select
                value={value.isoCode === null ? '' : value.isoCode} // use undefined to display the placeholder
                onChange={(newIsoCode) => onChange({ isoCode: newIsoCode, classroomCount: value.classroomCount })}
                color="secondary"
                isFullWidth
                options={countryOptions}
                placeholder={`Choisir le pays ${index + 1}`}
            />
            <Input
                isFullWidth
                color="secondary"
                value={value.classroomCount === null ? '' : value.classroomCount}
                onChange={(e) => {
                    const newCount = Number(e.target.value);
                    if (e.target.value === '') {
                        onChange({ isoCode: value.isoCode, classroomCount: null });
                    } else if (Number.isSafeInteger(newCount)) {
                        onChange({ isoCode: value.isoCode, classroomCount: newCount });
                    }
                }}
                placeholder="Nombre de classes inscrites"
            />
            {onDelete && <IconButton color="error" variant="outlined" icon={TrashIcon} onClick={onDelete} className={styles.deleteButton} />}
        </div>
    );
};

const toInitialCountries = (countries: string[], classroomCount: Record<string, number>) => {
    const initialCountries: Array<string | null> = [...countries];
    while (initialCountries.length < 2) {
        initialCountries.push(null);
    }
    return initialCountries.map((country) => ({
        isoCode: country,
        classroomCount: country !== null ? classroomCount[country] || null : null,
    }));
};

interface VillageFormProps {
    village?: Village;
    isNew?: boolean;
}
export const VillageForm = ({ village, isNew }: VillageFormProps) => {
    const router = useRouter();
    const [name, setName] = useState(village?.name || '');
    const [countries, setCountries] = useState<Array<Country>>(toInitialCountries(village?.countries || [], village?.classroomCount || {}));
    const [isUpdatingVillage, setIsUpdatingVillage] = useState(false);

    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const classroomCount = countries.reduce<Record<string, number>>((acc, country) => {
            if (country.isoCode === null) {
                return acc;
            }
            if (acc[country.isoCode]) {
                acc[country.isoCode] += country.classroomCount || 0;
            } else {
                acc[country.isoCode] = country.classroomCount || 0;
            }
            return acc;
        }, {});
        const sanitizedCountries = Object.keys(classroomCount);
        if (!name || sanitizedCountries.length < 2) {
            return;
        }
        try {
            setIsUpdatingVillage(true);
            if (isNew) {
                await createVillage({ name, countries: sanitizedCountries, classroomCount });
            } else if (village) {
                await updateVillage({ id: village.id, name, countries: sanitizedCountries, classroomCount });
            }
            router.push('/admin/manage/villages');
        } catch (error) {
            console.error(error);
        } finally {
            setIsUpdatingVillage(false);
        }
    };

    return (
        <form className={styles.form} onSubmit={onSubmit}>
            <Field
                label="Nom du village-monde"
                name="name"
                input={
                    <Input
                        color="secondary"
                        isFullWidth
                        placeholder="Entrez le nom du village-monde"
                        id="name"
                        name="name"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                }
            />
            <Field
                label="Pays et nombre de classes inscrites"
                input={
                    <div style={{ width: '100%' }}>
                        {countries.map((country, index) => (
                            <CountryField
                                key={`select-country-${index}`}
                                index={index}
                                value={country}
                                onChange={(value) => {
                                    const newCountries = [...countries];
                                    newCountries[index] = value;
                                    setCountries(newCountries);
                                }}
                                onDelete={
                                    countries.length > 2
                                        ? () => {
                                              const newCountries = [...countries];
                                              newCountries.splice(index, 1);
                                              setCountries(newCountries);
                                          }
                                        : undefined
                                }
                            />
                        ))}
                        <Button
                            color="secondary"
                            variant="outlined"
                            label="Ajouter un pays"
                            leftIcon={<PlusIcon />}
                            disabled={countries.length >= 5}
                            onClick={() => setCountries([...countries, { isoCode: null, classroomCount: null }])}
                        />
                    </div>
                }
            />
            <div className={styles.buttons}>
                <Button as="a" color="grey" variant="borderless" label="Annuler" href="/admin/manage/villages" marginRight="md" />
                <Button
                    color="secondary"
                    variant="contained"
                    label={isNew ? 'Créer le village !' : 'Mettre à jour le village !'}
                    type="submit"
                    disabled={countries.filter((country) => country !== null).length < 2}
                />
            </div>
            <Loader isLoading={isUpdatingVillage} />
        </form>
    );
};
