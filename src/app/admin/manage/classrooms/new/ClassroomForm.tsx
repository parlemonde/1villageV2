'use client';

import type { NominatimPlace } from '@app/api/geo/route';
import { Map } from '@frontend/components/Map';
import { DEFAULT_COORDINATES, type Coordinates } from '@frontend/components/Map/Map';
import { Button } from '@frontend/components/ui/Button';
import { Field, Input } from '@frontend/components/ui/Form';
import { Select } from '@frontend/components/ui/Form/Select';
import { Loader } from '@frontend/components/ui/Loader';
import { jsonFetcher } from '@lib/json-fetcher';
import { serializeToQueryUrl } from '@lib/serialize-to-query-url';
import type { Classroom } from '@server/database/schemas/classrooms';
import type { Village } from '@server/database/schemas/villages';
import { createClassroom } from '@server-actions/classrooms/create-classroom';
import { updateClassroom } from '@server-actions/classrooms/update-classroom';
import type { User } from 'better-auth';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import useSWR from 'swr';

import styles from '../../manage.module.css';

interface ClassroomFormProps {
    classroom?: Classroom;
}

export function ClassroomForm({ classroom }: ClassroomFormProps) {
    const isEditMode = !!classroom;
    const router = useRouter();

    const [alias, setAlias] = useState(classroom?.alias ?? '');
    const [level, setLevel] = useState(classroom?.level ?? '');
    const [schoolName, setSchoolName] = useState(classroom?.name ?? '');
    const [address, setAddress] = useState(classroom?.address ?? '');
    const [village, setVillage] = useState(classroom?.villageId?.toString() ?? '');
    const [teacher, setTeacher] = useState(classroom?.teacherId ?? '');
    const [coordinates, setCoordinates] = useState<Coordinates>(
        classroom?.coordinates ? { lat: classroom.coordinates.latitude, lng: classroom.coordinates.longitude } : DEFAULT_COORDINATES,
    );

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [useFallback, setUseFallback] = useState(false);
    const [hasAddressChanged, setHasAddressChanged] = useState(false);

    const { data: villages } = useSWR<Village[]>('/api/villages', jsonFetcher);
    const { data: teachers } = useSWR<User[]>(
        `/api/users${serializeToQueryUrl({ role: 'teacher', teacherId: isEditMode ? classroom?.teacherId : null })}`,
        jsonFetcher,
    );

    const hasValidationErrors = !village || !teacher || !schoolName || !address;
    const isDisabled = hasValidationErrors || isLoading;

    useEffect(() => {
        if (error) {
            window.scrollTo({
                top: 0,
                behavior: 'smooth',
            });
        }
    }, [error]);

    const getAddressPosition = async () => {
        const response = await fetch(`/api/geo${serializeToQueryUrl({ query: address })}`);
        const [data] = (await response.json()) as NominatimPlace[];

        if (!data) {
            setUseFallback(true);
            setError("Nous n'avont pas pu trouver l'adresse de l'école. Veuillez déplacer le marqueur à l'emplacement de votre école.");
            return;
        }

        return {
            countryCode: data.address.country_code.toUpperCase(),
            latitude: data.lat,
            longitude: data.lon,
        };
    };

    const getAddressPositionData = async () => {
        if (hasAddressChanged) {
            return await getAddressPosition();
        }

        return {
            countryCode: classroom?.countryCode ?? '',
            latitude: classroom?.coordinates?.latitude ?? '0',
            longitude: classroom?.coordinates?.longitude ?? '0',
        };
    };

    const prepareFallbackClassroomData = async () => {
        const country = await getCountryByCoordinates();
        return {
            alias,
            level,
            schoolName,
            address,
            country,
            villageId: Number(village),
            teacherId: teacher,
            coordinates: { latitude: coordinates.lat, longitude: coordinates.lng },
        };
    };

    const prepareStandardClassroomData = async () => {
        const addressPosition = await getAddressPositionData();
        if (!addressPosition) {
            return;
        }

        return {
            alias,
            level,
            schoolName,
            address,
            country: addressPosition?.countryCode ?? '',
            villageId: Number(village),
            teacherId: teacher,
            coordinates: {
                latitude: Number(addressPosition?.latitude),
                longitude: Number(addressPosition?.longitude),
            },
        };
    };

    const prepareClassroomData = async () => {
        if (useFallback) {
            return await prepareFallbackClassroomData();
        }

        return await prepareStandardClassroomData();
    };

    const getCountryByCoordinates = async () => {
        const response = await fetch(`/api/geo${serializeToQueryUrl({ query: `${coordinates?.lat},${coordinates?.lng}` })}`);
        const [data] = (await response.json()) as NominatimPlace[];

        return data.address.country_code.toUpperCase();
    };

    const createOrUpdateClassroom = async ({
        alias,
        level,
        schoolName,
        address,
        country,
        villageId,
        teacherId,
        coordinates,
    }: {
        alias: string;
        level: string;
        schoolName: string;
        address: string;
        country: string;
        villageId: number;
        teacherId: string;
        coordinates: { latitude: number; longitude: number };
    }) => {
        if (isEditMode) {
            await updateClassroom({
                id: classroom.id,
                alias,
                level,
                name: schoolName,
                address,
                countryCode: country,
                villageId,
                teacherId,
                coordinates,
            });
        } else {
            await createClassroom({
                alias,
                level,
                schoolName,
                address,
                country,
                villageId,
                teacherId,
                coordinates,
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (hasValidationErrors) {
            return;
        }

        setError('');
        setIsLoading(true);

        try {
            const classroomData = await prepareClassroomData();
            if (!classroomData) {
                return;
            }
            await createOrUpdateClassroom(classroomData);
            router.push('/admin/manage/classrooms');
        } catch (e) {
            handleSubmitError(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmitError = (e: unknown) => {
        const error = e as Error;
        if (error.name === 'MaxClassroomsError' || error.name === 'CountryNotAllowedError') {
            setError(error.message);
        } else {
            setError('Une erreur est survenue lors de la création de la classe');
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <Loader isLoading={isLoading} />
            {error && <div className={styles.error}>{error}</div>}
            <Field
                label="Pseudo"
                name="alias"
                input={
                    <Input
                        id="alias"
                        name="alias"
                        color="secondary"
                        isFullWidth
                        value={alias}
                        onChange={(e) => setAlias(e.target.value)}
                        type="text"
                    />
                }
            />
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
                        onChange={(e) => {
                            setAddress(e.target.value);
                            setHasAddressChanged(true);
                        }}
                        type="text"
                    />
                }
            />
            {useFallback && <Map marginBottom="md" marginX="auto" coordinates={coordinates} setCoordinates={setCoordinates} />}
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
