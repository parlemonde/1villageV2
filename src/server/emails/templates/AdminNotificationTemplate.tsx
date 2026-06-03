import { Heading, Link, Text } from '@react-email/components';
import BaseTemplate from '@server/emails/templates/BaseTemplate';

import type { AdminNotificationTemplateData } from './utils/types';
import { EmailType } from './utils/types';

interface AdminNotificationTemplateProps extends AdminNotificationTemplateData {
    type: EmailType.INVALID_VILLAGE | EmailType.INVALID_COUNTRY | EmailType.UNASSIGNED_VILLAGE;
}

const MESSAGES: Record<AdminNotificationTemplateProps['type'], string> = {
    [EmailType.INVALID_VILLAGE]:
        "Une classe n'a pas ou n'est pas dans son village monde qui lui est attribué ! Une erreur de synchronisation est certainement survenue...",
    [EmailType.INVALID_COUNTRY]: "Une classe n'est pas dans son pays ! Une erreur de synchronisation est certainement survenue...",
    [EmailType.UNASSIGNED_VILLAGE]: "Un professeur demande à être assigné à un village. Sa classe n'appartient à aucun village-monde.",
};

const BASE_TRANSLATIONS = {
    altText: 'Association Par Le Monde',
    greeting: 'Bonjour',
    notification: 'Vous recevez cette notification e-mail envoyée automatiquement dans le cadre du projet 1Village.',
    joinButton: 'Rejoindre 1Village',
    followUs: 'Suivez-nous !',
};

export default function AdminNotificationTemplate({ type, userName, userEmail, frontUrl }: AdminNotificationTemplateProps) {
    return (
        <BaseTemplate baseTranslations={BASE_TRANSLATIONS}>
            <Heading as="h2" style={{ margin: '16px 0' }}>
                Notification administrateur — 1Village
            </Heading>
            <Text>{MESSAGES[type]}</Text>
            <Text style={{ margin: '8px 0' }}>
                <strong>Nom de la classe / Pseudo :</strong> {userName}
            </Text>
            <Text style={{ margin: '8px 0' }}>
                <strong>Email du professeur :</strong> {userEmail}
            </Text>
            <Text style={{ margin: '16px 0' }}>
                Vous pouvez corriger cela sur : <Link href={`${frontUrl}/admin/manage/users`}>1Village — gestion des utilisateurs</Link>
            </Text>
        </BaseTemplate>
    );
}
