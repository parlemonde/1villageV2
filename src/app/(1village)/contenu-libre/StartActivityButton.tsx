'use client';

import { Button } from '@frontend/components/ui/Button';
import { useLocalStorage } from '@frontend/hooks/useLocalStorage';
import { ChevronRightIcon } from '@radix-ui/react-icons';
import type { Activity } from '@server/database/schemas/activities';
import { useRouter } from 'next/navigation';

interface StartActivityButtonProps {
    href: string;
}
export const StartActivityButton = ({ href }: StartActivityButtonProps) => {
    const router = useRouter();
    const [_localActivity, setLocalActivity] = useLocalStorage<Partial<Activity> | undefined>('activity', undefined);

    return (
        <Button
            color="primary"
            label="Étape suivante"
            rightIcon={<ChevronRightIcon />}
            onClick={() => {
                setLocalActivity(undefined); // Reset current activity
                router.push(href);
            }}
        ></Button>
    );
};
