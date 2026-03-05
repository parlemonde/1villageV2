'use client';

import { sendToast } from '@frontend/components/Toasts';
import { Select } from '@frontend/components/ui/Form/Select';
import { Loader } from '@frontend/components/ui/Loader';
import type { MarginProps, PaddingProps } from '@frontend/components/ui/css-styles';
import { UserContext } from '@frontend/contexts/userContext';
import { VillageContext } from '@frontend/contexts/villageContext';
import { serializeToQueryUrl } from '@lib/serialize-to-query-url';
import type { Classroom } from '@server/database/schemas/classrooms';
import type { Village } from '@server/database/schemas/villages';
import { useRouter } from 'next/navigation';
import { useExtracted } from 'next-intl';
import { useContext, useState } from 'react';

interface ClassroomSelectProps extends MarginProps, PaddingProps {
    classrooms: Classroom[];
}

export const ClassroomSelect = ({ classrooms, ...props }: ClassroomSelectProps) => {
    const router = useRouter();
    const t = useExtracted('app.(1village)');
    const tCommon = useExtracted('common');

    const { classroom, setClassroom } = useContext(UserContext);
    const { setVillage } = useContext(VillageContext);

    const [isLoading, setIsLoading] = useState(false);

    const classroomOptions =
        classrooms?.map((classroom) => ({
            label: classroom.name,
            value: classroom.id.toString(),
        })) ?? [];

    const updateClassroom = async (classroomId: string) => {
        setIsLoading(true);
        const classroom = await fetchClassroom(classroomId);
        if (classroom) {
            const village = classroom?.villageId ? await fetchVillage(classroom.villageId) : undefined;

            // eslint-disable-next-line react-hooks/immutability
            document.cookie = `classroomId=${classroomId}; path=/`;

            setClassroom(classroom);
            setVillage(village);
        }
        router.push('/');
        setIsLoading(false);
    };

    const fetchClassroom = async (classroomId: string): Promise<Classroom | null> => {
        const classroomResponse = await fetch(`/api/classrooms${serializeToQueryUrl({ classroomId: classroomId })}`);
        if (!classroomResponse.ok) {
            sendToast({
                message: tCommon('Une erreur est survenue'),
                type: 'error',
            });
        }
        const [classroom]: Classroom[] = await classroomResponse.json();
        return classroom;
    };

    const fetchVillage = async (villageId: number): Promise<Village> => {
        const villageResponse = await fetch(`/api/villages${serializeToQueryUrl({ villageId: villageId })}`);
        if (!villageResponse.ok) {
            sendToast({
                message: tCommon('Une erreur est survenue'),
                type: 'error',
            });
        }
        const [village]: Village[] = await villageResponse.json();
        return village;
    };

    return (
        <>
            {isLoading && <Loader isLoading />}
            <Select
                {...props}
                placeholder={t('Sélectionner une classe')}
                options={classroomOptions}
                onChange={updateClassroom}
                value={classroom?.id.toString()}
            />
        </>
    );
};
