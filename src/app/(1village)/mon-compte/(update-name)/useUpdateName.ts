import type { User } from '@server/database/schemas/users';
import { updateUserName } from '@server-actions/users/update-user-name';
import { useState } from 'react';

interface UseUpdateNameReturn {
    isUpdating: boolean;
    error: string | null;
    handleUpdate: (name: string) => Promise<void>;
}

export const useUpdateName = (onSuccess: (result: User) => void): UseUpdateNameReturn => {
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleUpdate = async (name: string) => {
        try {
            setError(null);
            setIsUpdating(true);
            const result = await updateUserName(name);
            onSuccess(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Echec de la mise à jour du nom');
        } finally {
            setIsUpdating(false);
        }
    };

    return { isUpdating, error, handleUpdate };
};
