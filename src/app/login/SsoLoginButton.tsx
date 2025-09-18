'use client';

import { Button } from '@frontend/components/ui/Button';
import { authClient } from '@frontend/lib/auth-client';

interface SsoLoginButtonProps {
    provider: string;
    isEnabled: boolean;
}
export const SsoLoginButton = ({ provider, isEnabled }: SsoLoginButtonProps) => {
    return (
        <Button
            color="primary"
            label="1Village en classe"
            isUpperCase={false}
            disabled={!isEnabled}
            onClick={() => authClient.signIn.social({ provider })}
        />
    );
};
