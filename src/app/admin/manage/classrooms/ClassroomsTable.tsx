'use client';

import type { ClassroomVillageTeacher } from '@app/api/classrooms/route';
import { AdminTable } from '@frontend/components/AdminTable';
import { IconButton } from '@frontend/components/ui/Button';
import { Input } from '@frontend/components/ui/Form';
import { Modal } from '@frontend/components/ui/Modal';
import { Tooltip } from '@frontend/components/ui/Tooltip/Tooltip';
import { getClassroomFromProp } from '@lib/get-classroom';
import { jsonFetcher } from '@lib/json-fetcher';
import { serializeToQueryUrl } from '@lib/serialize-to-query-url';
import { MagnifyingGlassIcon, Pencil1Icon, TrashIcon } from '@radix-ui/react-icons';
import type { Classroom } from '@server/database/schemas/classrooms';
import { deleteClassroom } from '@server-actions/classrooms/delete-classroom';
import { useState } from 'react';
import useSWR from 'swr';

export function ClassroomsTable() {
    const [classroomToDeleteId, setClassroomToDeleteId] = useState<number | undefined>(undefined);
    const [isDeletingClassroom, setIsDeletingClassroom] = useState(false);
    const [search, setSearch] = useState('');

    const {
        data: classrooms,
        isLoading,
        mutate,
    } = useSWR<Classroom[] | ClassroomVillageTeacher[]>(`/api/classrooms${serializeToQueryUrl({ withVillage: true })}`, jsonFetcher);

    const classroomToDelete = classrooms?.find((c) => {
        const id = 'classroom' in c ? c.classroom.id : c.id;
        return id === classroomToDeleteId;
    });

    const filteredClassrooms = classrooms?.filter((classroom) => {
        if (classroom === undefined) return false;

        const cls: Classroom | undefined = getClassroomFromProp(classroom);

        return (
            cls?.name.toLowerCase().includes(search.toLowerCase()) ||
            cls?.address.toLowerCase().includes(search.toLowerCase()) ||
            cls?.level?.toLowerCase().includes(search.toLowerCase()) ||
            cls?.alias?.toLowerCase().includes(search.toLowerCase())
        );
    });

    const classroomData: Classroom | undefined = getClassroomFromProp(classroomToDelete);

    return (
        <>
            <Input
                iconAdornment={<MagnifyingGlassIcon style={{ width: '20px', height: 'auto' }} fill="currentColor" />}
                iconAdornmentProps={{
                    position: 'left',
                }}
                isFullWidth
                placeholder="Rechercher une classe..."
                size="sm"
                value={search}
                onChange={(e) => {
                    setSearch(e.target.value);
                }}
            />
            <AdminTable
                columns={[
                    {
                        id: 'alias',
                        header: 'Pseudo',
                        accessor: 'classroom.alias',
                        isSortable: true,
                    },
                    {
                        id: 'level',
                        header: 'Niveau',
                        accessor: 'classroom.level',
                        isSortable: true,
                    },
                    {
                        id: 'name',
                        header: 'Ecole',
                        accessor: 'classroom.name',
                        isSortable: true,
                    },
                    {
                        id: 'address',
                        header: 'Adresse',
                        accessor: 'classroom.address',
                        isSortable: true,
                    },
                    {
                        id: 'countryCode',
                        header: 'Pays',
                        accessor: 'classroom.countryCode',
                        isSortable: true,
                    },
                    {
                        id: 'teacherName',
                        header: 'Professeur',
                        accessor: 'teacherName',
                        isSortable: true,
                    },
                    {
                        id: 'villageName',
                        header: 'Village',
                        accessor: 'villageName',
                        isSortable: true,
                    },
                    {
                        id: 'actions',
                        header: 'Actions',
                        accessor: (classroom) => {
                            const cls: Classroom | undefined = getClassroomFromProp(classroom);
                            const classroomId = cls?.id;

                            return (
                                <>
                                    <Tooltip content="Modifier la classe" hasArrow>
                                        <IconButton
                                            as="a"
                                            href={`/admin/manage/classrooms/${classroomId}`}
                                            variant="borderless"
                                            color="primary"
                                            icon={Pencil1Icon}
                                        />
                                    </Tooltip>
                                    <Tooltip content="Supprimer la classe" hasArrow /* isEnabled={user.id !== currentUser.id} */>
                                        <IconButton
                                            /*disabled={user.id === currentUser.id}*/
                                            variant="borderless"
                                            color="error"
                                            icon={TrashIcon}
                                            onClick={() => setClassroomToDeleteId(classroomId)}
                                        />
                                    </Tooltip>
                                </>
                            );
                        },
                        width: '100px',
                        align: 'right',
                        cellPadding: '0 8px',
                    },
                ]}
                data={filteredClassrooms || []}
                isLoading={isLoading && classrooms === undefined}
                emptyState="Aucune classe trouvée !"
            />
            <Modal
                isOpen={classroomToDelete !== undefined}
                onClose={() => setClassroomToDeleteId(undefined)}
                title="Supprimer la classe"
                confirmLabel="Supprimer"
                confirmLevel="error"
                onConfirm={async () => {
                    if (classroomToDeleteId === null) {
                        return;
                    }
                    try {
                        setIsDeletingClassroom(true);
                        await deleteClassroom(classroomToDeleteId);
                        await mutate(); // refresh the classrooms list
                    } catch (error) {
                        console.error(error);
                    } finally {
                        setIsDeletingClassroom(false);
                        setClassroomToDeleteId(undefined);
                    }
                }}
                isLoading={isDeletingClassroom}
            >
                {classroomToDelete !== undefined && (
                    <p>
                        Êtes-vous sûr de vouloir supprimer la classe <strong>{classroomData?.name}</strong> ?
                    </p>
                )}
            </Modal>
        </>
    );
}
