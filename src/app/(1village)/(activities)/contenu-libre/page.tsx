'use client';

import { Button } from '@frontend/components/ui/Button';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { SectionContainer } from '@frontend/components/ui/SectionContainer';
import { Title } from '@frontend/components/ui/Title';
import { ActivityContext } from '@frontend/contexts/activityContext';
import { UserContext } from '@frontend/contexts/userContext';
import { ChevronRightIcon } from '@radix-ui/react-icons';
import { useRouter } from 'next/navigation';
import { useContext } from 'react';

export default function FreeContent() {
    const { user } = useContext(UserContext);
    const { onCreateActivity } = useContext(ActivityContext);
    const router = useRouter();

    return (
        <PageContainer title="Publication de contenu libre">
            <SectionContainer>
                <p>
                    Dans cette activité, nous vous proposons de créer une publication libre. Vous pourrez ensuite partager cette publication et
                    décider de l&apos;épingler dans le fil d&apos;actualité.
                </p>
            </SectionContainer>

            <div style={{ textAlign: 'right' }}>
                <Button
                    color="primary"
                    label="Démarrer"
                    rightIcon={<ChevronRightIcon />}
                    onClick={() => {
                        onCreateActivity('libre', user.role === 'admin' || user.role === 'teacher');
                        router.push('/contenu-libre/1');
                    }}
                ></Button>
            </div>
        </PageContainer>
    );
}
