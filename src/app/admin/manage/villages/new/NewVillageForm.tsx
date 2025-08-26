'use client';

import { PlusIcon, TrashIcon } from '@radix-ui/react-icons';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { CountryFlag } from '@/components/CountryFlag';
import { BackDrop } from '@/components/ui/BackDrop';
import { Button, IconButton } from '@/components/ui/Button';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { Field, Input } from '@/components/ui/Form';
import { Select } from '@/components/ui/Form/Select';
import { COUNTRIES } from '@/lib/iso-3166-countries-french';
import { createVillage } from '@/server-actions/villages/create-village';

const countryOptions = Object.entries(COUNTRIES).map(([key, value]) => ({
    label: (
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '30px', textAlign: 'center' }}>
                <CountryFlag size="small" country={key} />
            </span>
            <span>{value}</span>
        </div>
    ),
    value: key,
}));

interface CountrySelectProps {
    index: number;
    value: string | null;
    onChange: (value: string) => void;
    onDelete?: () => void;
}
const CountrySelect = ({ index, value, onChange, onDelete }: CountrySelectProps) => {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                width: '100%',
                gap: '16px',
                marginBottom: '8px',
            }}
        >
            <Select
                value={value === null ? undefined : value} // use undefined to display the placeholder
                onChange={onChange}
                color="secondary"
                isFullWidth
                options={countryOptions}
                placeholder={`Pays ${index + 1}`}
            />
            {onDelete && <IconButton color="error" variant="outlined" icon={TrashIcon} onClick={onDelete} />}
        </div>
    );
};

export const NewVillageForm = () => {
    const router = useRouter();
    const [name, setName] = useState('');
    const [countries, setCountries] = useState<Array<string | null>>([null, null]);
    const [isCreatingVillage, setIsCreatingVillage] = useState(false);

    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const sanitizedCountries = countries.filter((country) => country !== null);
        if (!name || sanitizedCountries.length < 2) {
            return;
        }
        try {
            setIsCreatingVillage(true);
            await createVillage({ name, countries: sanitizedCountries });
            router.push('/admin/manage/villages');
        } catch (error) {
            console.error(error);
        } finally {
            setIsCreatingVillage(false);
        }
    };

    return (
        <form style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', margin: '32px 0' }} onSubmit={onSubmit}>
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
                label="Pays"
                input={
                    <div style={{ width: '100%' }}>
                        {countries.map((country, index) => (
                            <CountrySelect
                                key={country || `select-country-${index}`}
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
                            onClick={() => setCountries([...countries, null])}
                        />
                    </div>
                }
            />
            <div style={{ textAlign: 'right' }}>
                <Button as="a" color="grey" variant="borderless" label="Annuler" href="/admin/manage/villages" marginRight="md" />
                <Button
                    color="secondary"
                    variant="contained"
                    label="Créer le village !"
                    type="submit"
                    disabled={countries.filter((country) => country !== null).length < 2}
                />
            </div>
            {isCreatingVillage && (
                <BackDrop style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CircularProgress />
                </BackDrop>
            )}
        </form>
    );
};
