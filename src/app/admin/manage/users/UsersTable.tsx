'use client';

import { MagnifyingGlassIcon, Pencil1Icon, TrashIcon } from '@radix-ui/react-icons';
import { useContext, useState } from 'react';
import useSWR from 'swr';

import { AdminTable } from '@/components/AdminTable';
import { IconButton } from '@/components/ui/Button';
import { Input } from '@/components/ui/Form';
import { Modal } from '@/components/ui/Modal';
import { Tooltip } from '@/components/ui/Tooltip/Tooltip';
import { UserContext } from '@/contexts/userContext';
import type { User } from '@/database/schemas/users';
import { jsonFetcher } from '@/lib/json-fetcher';
import { deleteUser } from '@/server-actions/users/delete-user';

const ROLE_LABELS: Record<User['role'], string> = {
    admin: 'Admin',
    mediator: 'Médiateur',
    teacher: 'Professeur',
    parent: 'Parent',
};

export function UsersTable() {
    const { user: currentUser } = useContext(UserContext);

    const [userToDeleteId, setUserToDeleteId] = useState<number | null>(null);
    const [isDeletingUser, setIsDeletingUser] = useState(false);
    const [search, setSearch] = useState('');

    const { data: users, isLoading, mutate } = useSWR<User[]>('/api/users', jsonFetcher);

    const userToDelete = users?.find((user) => user.id === userToDeleteId);

    const filteredUsers = users?.filter(
        (user) =>
            user.name.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase()) ||
            user.role.toLowerCase().includes(search.toLowerCase()),
    );

    return (
        <div>
            <Input
                iconAdornment={<MagnifyingGlassIcon width={20} height="auto" fill="currentColor" />}
                iconAdornmentProps={{
                    position: 'left',
                }}
                isFullWidth
                placeholder="Rechercher un utilisateur..."
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
                                <Tooltip content="Modifier l'utilisateur" hasArrow>
                                    <IconButton
                                        as="a"
                                        href={`/admin/manage/users/${user.id}`}
                                        variant="borderless"
                                        color="primary"
                                        icon={Pencil1Icon}
                                    />
                                </Tooltip>
                                <Tooltip content="Supprimer l'utilisateur" hasArrow isEnabled={user.id !== currentUser.id}>
                                    <IconButton
                                        disabled={user.id === currentUser.id}
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
                data={filteredUsers || []}
                isLoading={isLoading && users === undefined}
                emptyState="Aucun utilisateur trouvé !"
            />
            <Modal
                isOpen={userToDelete !== undefined}
                onClose={() => setUserToDeleteId(null)}
                title="Supprimer l'utilisateur"
                confirmLabel="Supprimer"
                confirmLevel="error"
                onConfirm={async () => {
                    if (userToDeleteId === null) {
                        return;
                    }
                    try {
                        setIsDeletingUser(true);
                        await deleteUser(userToDeleteId);
                        await mutate(); // refresh the users list
                    } catch (error) {
                        console.error(error);
                    } finally {
                        setIsDeletingUser(false);
                        setUserToDeleteId(null);
                    }
                }}
                isLoading={isDeletingUser}
            >
                {userToDelete !== undefined && (
                    <p>
                        Êtes-vous sûr de vouloir supprimer l&apos;utilisateur <strong>{userToDelete.name}</strong> ?
                    </p>
                )}
            </Modal>
        </div>
    );
}
