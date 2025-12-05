'use client';

import { AdminTable } from '@frontend/components/AdminTable';
import { IconButton } from '@frontend/components/ui/Button';
import { Input } from '@frontend/components/ui/Form';
import { Modal } from '@frontend/components/ui/Modal';
import { Tooltip } from '@frontend/components/ui/Tooltip/Tooltip';
import { UserContext } from '@frontend/contexts/userContext';
import { authClient } from '@frontend/lib/auth-client';
import { jsonFetcher } from '@lib/json-fetcher';
import { MagnifyingGlassIcon, Pencil1Icon, TrashIcon } from '@radix-ui/react-icons';
import type { Classroom } from '@server/database/schemas/classrooms';
import type { User } from '@server/database/schemas/users';
import { useContext, useState } from 'react';
import useSWR from 'swr';

const ROLE_LABELS: Record<User['role'], string> = {
    admin: 'Admin',
    mediator: 'Médiateur',
    teacher: 'Professeur',
    parent: 'Parent',
};

export function ClassroomsTable() {
    const { user: currentUser } = useContext(UserContext);

    /*const [userToDeleteId, setUserToDeleteId] = useState<string | null>(null);
    const [isDeletingUser, setIsDeletingUser] = useState(false); */
    const [search, setSearch] = useState('');

    const { data: classrooms, isLoading, mutate } = useSWR<Classroom[]>('/api/classrooms', jsonFetcher);

    //const userToDelete = users?.find((user) => user.id === userToDeleteId);

    const filteredClassrooms = classrooms?.filter(
        (classroom) =>
            classroom.name.toLowerCase().includes(search.toLowerCase()) ||
            classroom.address.toLowerCase().includes(search.toLowerCase()) ||
            classroom.level?.toLowerCase().includes(search.toLowerCase()) ||
            classroom.city.toLowerCase().includes(search.toLowerCase()),
    );

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
                        id: 'name',
                        header: 'Nom',
                        accessor: 'name',
                        isSortable: true,
                    },
                    {
                        id: 'email',
                        header: 'Email',
                        accessor: 'email',
                        isSortable: true,
                    },
                    {
                        id: 'role',
                        header: 'Rôle',
                        accessor: (user) => ROLE_LABELS[user.role],
                        width: '150px',
                        isSortable: true,
                        getSortValue: (user) => ROLE_LABELS[user.role],
                    },
                    {
                        id: 'actions',
                        header: 'Actions',
                        accessor: (user) => (
                            <>
                                <Tooltip content="Modifier la classe" hasArrow>
                                    <IconButton
                                        as="a"
                                        href={`/admin/manage/classrooms/${user.id}`}
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
                                        onClick={() => setUserToDeleteId(user.id)}
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
            {/* <Modal
                isOpen={userToDelete !== undefined}
                onClose={() => setUserToDeleteId(null)}
                title="Supprimer l'utilisateur"
                confirmLabel="Supprimer"
                confirmLevel="error"
                onConfirm={async () => {
                    if (userToDeleteId === null) {
                        return;
                    }
                    setIsDeletingUser(true);
                    const { error } = await authClient.admin.removeUser({
                        userId: userToDeleteId,
                    });
                    if (error) {
                        console.error(error);
                    } else {
                        await mutate(); // refresh the users list
                    }
                    setIsDeletingUser(false);
                    setUserToDeleteId(null);
                }}
                isLoading={isDeletingUser}
            >
                {userToDelete !== undefined && (
                    <p>
                        Êtes-vous sûr de vouloir supprimer l&apos;utilisateur <strong>{userToDelete.name}</strong> ?
                    </p>
                )}
            </Modal> */}
        </div>
    );
}
