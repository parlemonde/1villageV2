'use client';

import { Button } from '@frontend/components/ui/Button';
import { Field, Input } from '@frontend/components/ui/Form';
import { CountrySelect } from '@frontend/components/ui/Form/CountrySelect';
import { Select } from '@frontend/components/ui/Form/Select';
import { jsonFetcher } from '@lib/json-fetcher';
import { serializeToQueryUrl } from '@lib/serialize-to-query-url';
import type { Village } from '@server/database/schemas/villages';
import type { User } from 'better-auth';
import { useState } from 'react';
import useSWR from 'swr';

import styles from './classroom-form.module.css';

export function ClassroomForm() {
    const [level, setLevel] = useState('');
    const [schoolName, setSchoolName] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [country, setCountry] = useState('');
    const [village, setVillage] = useState('');
    const [teacher, setTeacher] = useState('');

    const { data: villages } = useSWR<Village[]>('/api/villages', jsonFetcher);
    const { data: teachers } = useSWR<User[]>(`/api/users${serializeToQueryUrl({ role: 'teacher' })}`, jsonFetcher);

    return (
        <form>
            <Field
                label="Niveau de classe"
                name="level"
                marginBottom="md"
                input={
                    <Input
                        id="level"
                        name="level"
                        color="secondary"
                        isFullWidth
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                        type="text"
                    />
                }
            />
            <Field
                label="Nom de l'école"
                name="schoolName"
                marginBottom="md"
                input={
                    <Input
                        id="schoolName"
                        name="schoolName"
                        color="secondary"
                        isFullWidth
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        type="text"
                    />
                }
            />
            <Field
                label="Adresse"
                name="address"
                marginBottom="md"
                input={
                    <Input
                        id="address"
                        name="address"
                        color="secondary"
                        isFullWidth
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        type="text"
                    />
                }
            />
            <Field
                label="Ville"
                name="city"
                marginBottom="md"
                input={
                    <Input id="city" name="city" color="secondary" isFullWidth value={city} onChange={(e) => setCity(e.target.value)} type="text" />
                }
            />
            <Field
                label="Pays"
                name="country"
                marginBottom="md"
                isRequired
                input={
                    <CountrySelect
                        id="country"
                        name="country"
                        color="secondary"
                        isFullWidth
                        value={country}
                        onChange={(country) => setCountry(country)}
                    />
                }
            />
            <Field
                label="Village-monde"
                name="village"
                marginBottom="md"
                isRequired
                input={
                    <Select
                        id="village"
                        name="village"
                        color="secondary"
                        isFullWidth
                        value={village}
                        onChange={(village) => setVillage(village)}
                        options={villages?.map((v) => ({ label: v.name, value: v.id.toString() })) || []}
                    />
                }
            />
            <Field
                label="Professeur"
                name="teacher"
                marginBottom="md"
                isRequired
                input={
                    <Select
                        id="teacher"
                        name="teacher"
                        color="secondary"
                        isFullWidth
                        value={teacher}
                        onChange={(teacher) => setTeacher(teacher)}
                        options={teachers?.map((t) => ({ label: t.name, value: t.id })) || []}
                    />
                }
            />
            <div className={styles.buttons}>
                <Button label="Annuler" variant="outlined" color="grey" type="button" />
                <Button label="Enregistrer" variant="contained" color="secondary" type="submit" />
            </div>
        </form>
    );
}
