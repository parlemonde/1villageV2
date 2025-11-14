import { useState } from 'react';
import { updateUserEmail } from '@server-actions/users/update-user-email';

interface UseUpdateEmailReturn {
    isUpdating: boolean;
    error: string | null;
    handleUpdate: (email: string) => Promise<void>;
}

export const useUpdateEmail = (onSuccess: (result: any) => void): UseUpdateEmailReturn => {
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleUpdate = async (email: string) => {
        try {
            setError(null);
            setIsUpdating(true);
            const result = await updateUserEmail(email);
            onSuccess(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Echec de la mise à jour de l\'email');
        } finally {
            setIsUpdating(false);
        }
    };

    return { isUpdating, error, handleUpdate };
};
