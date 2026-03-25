'use client';

import { Select } from '@frontend/components/ui/Form/Select';
import { Loader } from '@frontend/components/ui/Loader';
import type { MarginProps, PaddingProps } from '@frontend/components/ui/css-styles';
import { UserContext } from '@frontend/contexts/userContext';
import type { Classroom } from '@server/database/schemas/classrooms';
import { selectClassroom } from '@server-actions/classrooms/select-classroom';
import { useRouter } from 'next/navigation';
import { useExtracted } from 'next-intl';
import { useContext, useState } from 'react';

interface ClassroomSelectProps extends MarginProps, PaddingProps {
    classrooms: Classroom[];
    className?: string;
}

export const ClassroomSelect = ({ classrooms, className, ...props }: ClassroomSelectProps) => {
    const router = useRouter();
    const t = useExtracted('app.(1village)');

    const { classroom, setClassroom } = useContext(UserContext);

    const [isLoading, setIsLoading] = useState(false);

    const classroomOptions =
        classrooms?.map((classroom) => ({
            label: classroom.name,
            value: classroom.id.toString(),
        })) ?? [];

    const updateClassroom = async (classroomId: string) => {
        setIsLoading(true);
        const classroom = classrooms.find((classroom) => classroom.id.toString() === classroomId);
        if (classroom) {
            await selectClassroom(classroom.id);
            setClassroom(classroom);
        }
        router.push('/');
        setIsLoading(false);
    };

    return (
        <>
            {isLoading && <Loader isLoading />}
            <Select
                className={className}
                {...props}
                placeholder={t('Sélectionner une classe')}
                options={classroomOptions}
                onChange={updateClassroom}
                value={classroom?.id.toString()}
            />
        </>
    );
};
