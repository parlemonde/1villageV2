import { Title } from '@frontend/components/ui/Title';

import { StartActivityButton } from './StartActivityButton';

export default function FreeContent() {
    return (
        <div style={{ padding: '16px 32px' }}>
            <Title marginBottom="md">Publication de contenu libre</Title>
            <p>
                Dans cette activité, nous vous proposons de créer une publication libre. Vous pourrez ensuite partager cette publication et décider de
                l&apos;épingler dans le fil d&apos;actualité.
            </p>
            <div style={{ textAlign: 'right' }}>
                <StartActivityButton href="/contenu-libre/1" />
            </div>
        </div>
    );
}
