'use client';

import { Button } from '@frontend/components/ui/Button';
import { Field, Input } from '@frontend/components/ui/Form';
import { CountrySelect } from '@frontend/components/ui/Form/CountrySelect';
import { Select } from '@frontend/components/ui/Form/Select';
import { Loader } from '@frontend/components/ui/Loader';
import { COUNTRIES } from '@lib/iso-3166-countries-french';
import { jsonFetcher } from '@lib/json-fetcher';
import { serializeToQueryUrl } from '@lib/serialize-to-query-url';
import type { Village } from '@server/database/schemas/villages';
import { createClassroom } from '@server-actions/classrooms/create-classroom';
import type { User } from 'better-auth';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import useSWR from 'swr';

import styles from '../../manage.module.css';

export function ClassroomForm() {
    const router = useRouter();

    const [level, setLevel] = useState('');
    const [schoolName, setSchoolName] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [country, setCountry] = useState('');
    const [village, setVillage] = useState('');
    const [teacher, setTeacher] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const { data: villages } = useSWR<Village[]>('/api/villages', jsonFetcher);
    const { data: currentVillageResponse } = useSWR<Village[]>(
        village ? `/api/villages${serializeToQueryUrl({ villageId: village })}` : null,
        jsonFetcher,
    );
    const { data: teachers } = useSWR<User[]>(`/api/users${serializeToQueryUrl({ role: 'teacher' })}`, jsonFetcher);

    const currentVillage = currentVillageResponse?.[0];

    const hasValidationErrors = !country || !village || !teacher || !schoolName || !address || !city;
    const isDisabled = hasValidationErrors || isLoading;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (hasValidationErrors) {
            return;
        }

        setError('');
        setIsLoading(true);

        try {
            await createClassroom({
                level,
                schoolName,
                address,
                city,
                country,
                villageId: Number(village),
                teacherId: teacher,
            });
            router.push('/admin/manage/classrooms');
        } catch (e) {
            console.error(e);
            const error = e as Error;
            if (error.name === 'MaxClassroomsError') {
                setError(`Le village a atteint le nombre maximum de classes pour le pays ${COUNTRIES[country]}`);
            } else {
                setError('Une erreur est survenue lors de la création de la classe');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <Loader isLoading={isLoading} />
            {error && <div className={styles.error}>{error}</div>}
            <Field
                label="Niveau de classe"
                name="level"
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
                isRequired
                input={
                    <Input
                        id="address"
                        name="address"
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
                isRequired
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
                isRequired
                input={
                    <Input id="city" name="city" color="secondary" isFullWidth value={city} onChange={(e) => setCity(e.target.value)} type="text" />
                }
            />
            <Field
                label="Pays"
                name="country"
                isRequired
                input={
                    <CountrySelect
                        id="country"
                        name="country"
                        color="secondary"
                        isFullWidth
                        value={country}
                        filter={(country: string) => {
                            if (currentVillage?.countries) {
                                return currentVillage?.countries.includes(country) ?? false;
                            }
                            return true;
                        }}
                        onChange={(country) => setCountry(country)}
                    />
                }
            />
            <Field
                label="Village-monde"
                name="village"
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
                <Button label="Annuler" variant="outlined" color="grey" type="button" as="a" href="/admin/manage/classrooms" />
                <Button label="Enregistrer" variant="contained" color="secondary" type="submit" disabled={isDisabled} />
            </div>
        </form>
    );
}
