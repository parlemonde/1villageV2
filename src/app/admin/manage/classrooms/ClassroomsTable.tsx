'use client';

import type { ClassroomVillageTeacher } from '@app/api/classrooms/route';
import { AdminTable } from '@frontend/components/AdminTable';
import { IconButton } from '@frontend/components/ui/Button';
import { Input } from '@frontend/components/ui/Form';
import { Tooltip } from '@frontend/components/ui/Tooltip/Tooltip';
import { jsonFetcher } from '@lib/json-fetcher';
import { serializeToQueryUrl } from '@lib/serialize-to-query-url';
import { MagnifyingGlassIcon, Pencil1Icon, TrashIcon } from '@radix-ui/react-icons';
import { useState } from 'react';
import useSWR from 'swr';

export function ClassroomsTable() {
    //const { user: currentUser } = useContext(UserContext);

    //const [classroomToDeleteId, setClassroomToDeleteId] = useState<number | null>(null);
    //const [isDeletingClassroom, setIsDeletingClassroom] = useState(false);
    const [search, setSearch] = useState('');

    const { data: classrooms, isLoading, mutate: _ } = useSWR<ClassroomVillageTeacher[]>(`/api/classrooms${serializeToQueryUrl({ withVillage: true })}`, jsonFetcher);

    //const userToDelete = users?.find((user) => user.id === userToDeleteId);

    const filteredClassrooms = classrooms?.filter((classroom) => {
        const cls = classroom.classroom;

        return (
            cls.name.toLowerCase().includes(search.toLowerCase()) ||
            cls.address.toLowerCase().includes(search.toLowerCase()) ||
            cls.level?.toLowerCase().includes(search.toLowerCase()) ||
            cls.alias?.toLowerCase().includes(search.toLowerCase())
        );
    });

    return (
        <div>
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
                        accessor: (classroom) => (
                            <>
                                <Tooltip content="Modifier la classe" hasArrow>
                                    <IconButton
                                        as="a"
                                        href={`/admin/manage/classrooms/${classroom.classroom.id}`}
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
                                        //onClick={() => setClassroomToDeleteId(classroom.id)}
                                    />
                                </Tooltip>
                            </>
                        ),
                        width: '100px',
                        align: 'right',
                        cellPadding: '0 8px',
                    },
                ]}
                data={filteredClassrooms || []}
                isLoading={isLoading && classrooms === undefined}
                emptyState="Aucune classe trouvée !"
            />
        </div>
    );
}
