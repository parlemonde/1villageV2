'use client';

import { FamilyProvider } from '@frontend/contexts/familyContext';
import { UserContext } from '@frontend/contexts/userContext';
import { jsonFetcher } from '@lib/json-fetcher';
import { serializeToQueryUrl } from '@lib/serialize-to-query-url';
import type { Student } from '@server/database/schemas/students';
import { useContext } from 'react';
import useSWR from 'swr';

const DEFAULT_PARENT_INVITATION_MESSAGE = {
    type: 'doc',
    content: [
        {
            type: 'paragraph',
            attrs: {
                align: 'left',
            },
            content: [
                {
                    type: 'text',
                    text: 'Bonjour,',
                },
            ],
        },
        {
            type: 'paragraph',
            attrs: {
                align: 'left',
            },
        },
        {
            type: 'paragraph',
            attrs: {
                align: 'left',
            },
            content: [
                {
                    type: 'text',
                    text: 'Notre classe participe au projet 1Village, de l’association Par Le Monde, agréée par le ministère de l’éducation nationale français.  1Village est un projet de correspondances avec d’autres classes du monde, accessible de façon sécurisée sur un site internet.',
                },
            ],
        },
        {
            type: 'paragraph',
            attrs: {
                align: 'left',
            },
        },
        {
            type: 'paragraph',
            attrs: {
                align: 'left',
            },
            content: [
                {
                    type: 'text',
                    text: 'Si vous souhaitez accéder à ce site et observer les échanges en famille, il vous faut suivre cette démarche :',
                },
            ],
        },
        {
            type: 'paragraph',
            attrs: {
                align: 'left',
            },
        },
        {
            type: 'paragraph',
            attrs: {
                align: 'left',
            },
            content: [
                {
                    type: 'text',
                    text: '    1. Créer un compte sur https://1v.parlemonde.org/inscription, en renseignant une adresse email et un mot de passe.',
                },
            ],
        },
        {
            type: 'paragraph',
            attrs: {
                align: 'left',
            },
            content: [
                {
                    type: 'text',
                    text: '    2. Confirmez votre adresse mail en cliquant sur le lien envoyé.',
                },
            ],
        },
        {
            type: 'paragraph',
            attrs: {
                align: 'left',
            },
            content: [
                {
                    type: 'text',
                    text: '    3. Connectez-vous sur https://1v.parlemonde.org/inscription et rattachez votre compte à l’identifiant unique ',
                },
                {
                    type: 'text',
                    marks: [
                        {
                            type: 'bold',
                        },
                    ],
                    text: '%inviteCode',
                },
                {
                    type: 'text',
                    text: '.',
                },
            ],
        },
        {
            type: 'paragraph',
            attrs: {
                align: 'left',
            },
        },
        {
            type: 'paragraph',
            attrs: {
                align: 'left',
            },
            content: [
                {
                    type: 'text',
                    text: 'Jusqu’à 5 personnes de votre famille peuvent créer un compte et le rattacher à l’identifiant unique de votre enfant.',
                },
            ],
        },
        {
            type: 'paragraph',
            attrs: {
                align: 'left',
            },
        },
        {
            type: 'paragraph',
            attrs: {
                align: 'left',
            },
        },
        {
            type: 'paragraph',
            attrs: {
                align: 'left',
            },
            content: [
                {
                    type: 'text',
                    text: 'Bonne journée',
                },
            ],
        },
    ],
};

export default function FamillesLayout({ children }: { children: React.ReactNode }) {
    const { classroom } = useContext(UserContext);

    const { data: students } = useSWR<Student[]>('/api/students', jsonFetcher);
    const { data: parentInvitationMessage } = useSWR<unknown>(
        `/api/user-preferences${serializeToQueryUrl({ keys: ['parentInvitationMessage'] })}`,
        jsonFetcher,
    );

    return (
        <FamilyProvider
            showOnlyClassroomActivities={!!classroom?.showOnlyClassroomActivities}
            activityVisibilityMap={{}}
            students={students?.map((s) => {
                const name = s.name.split(' ');
                return { id: s.id, tempId: s.id.toString(), firstName: name[0], lastName: name[1] };
            })}
            parentInvitationMessage={parentInvitationMessage ?? DEFAULT_PARENT_INVITATION_MESSAGE}
        >
            {children}
        </FamilyProvider>
    );
}
