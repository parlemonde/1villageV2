import { useState } from 'react';
import { updateUserPassword } from '@server-actions/users/update-user-password';

interface UseUpdatePasswordReturn {
    isUpdating: boolean;
    error: string | null;
    handleUpdate: (currentPassword: string, newPassword: string, confirmPassword: string) => Promise<void>;
}

export const useUpdatePassword = (): UseUpdatePasswordReturn => {
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleUpdate = async (currentPassword: string, newPassword: string, confirmPassword: string) => {
        try {
            setError(null);
            setIsUpdating(true);
            await updateUserPassword(currentPassword, newPassword, confirmPassword);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Echec de la mise à jour du mot de passe');
        } finally {
            setIsUpdating(false);
        }
    };

    return { isUpdating, error, handleUpdate };
};
