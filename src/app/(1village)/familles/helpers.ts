import type { HtmlEditorContent } from '@frontend/components/html/HtmlEditor/HtmlEditor';
import { downloadFile } from '@frontend/lib/download-file';
import { useExtracted } from 'next-intl';

const generatePdfName = (suffix: string) => {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}_${hours}${minutes}${seconds}_${suffix}.pdf`;
};

export const downloadPdf = async (pdfBuffer: Uint8Array<ArrayBufferLike>, suffix: string) => {
    const buffer = new Uint8Array(pdfBuffer);
    const blob = new Blob([buffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    downloadFile(url, generatePdfName(suffix));
};

export const useDefaultParentInvitationMessage = () => {
    const t = useExtracted('app.(1village).familles');
    const DEFAULT_PARENT_INVITATION_MESSAGE: HtmlEditorContent = {
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
                        text: t('Bonjour,'),
                    },
                ],
            },
            {
                type: 'paragraph',
                attrs: {
                    align: 'left',
                },
                content: [],
            },
            {
                type: 'paragraph',
                attrs: {
                    align: 'left',
                },
                content: [
                    {
                        type: 'text',
                        text: t(
                            "Notre classe participe au projet 1Village, de l'association Par Le Monde, agréée par le ministère de l'éducation nationale français. 1Village est un projet de correspondances avec d'autres classes du monde, accessible de façon sécurisée sur un site internet.",
                        ),
                    },
                ],
            },
            {
                type: 'paragraph',
                attrs: {
                    align: 'left',
                },
                content: [],
            },
            {
                type: 'paragraph',
                attrs: {
                    align: 'left',
                },
                content: [
                    {
                        type: 'text',
                        text: t('Si vous souhaitez accéder à ce site et observer les échanges en famille, il vous faut suivre cette démarche :'),
                    },
                ],
            },
            {
                type: 'paragraph',
                attrs: {
                    align: 'left',
                },
                content: [],
            },
            {
                type: 'paragraph',
                attrs: {
                    align: 'left',
                },
                content: [
                    {
                        type: 'text',
                        text: `    ${t('1. Créer un compte sur https://1v-new.parlemonde.org/login/famille/inscription, en renseignant une adresse email et un mot de passe.')}`,
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
                        text: `    ${t('2. Confirmez votre adresse mail en cliquant sur le lien envoyé.')}`,
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
                        text: `    ${t("3. Connectez vous sur https://1v-new.parlemonde.org/login/famille/inscription et rattachez votre compte à l'identifiant unique")} `,
                    },
                    {
                        type: 'text',
                        marks: [
                            {
                                type: 'bold',
                            },
                        ],
                        text: '%code',
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
                content: [],
            },
            {
                type: 'paragraph',
                attrs: {
                    align: 'left',
                },
                content: [
                    {
                        type: 'text',
                        text: t(
                            "Jusqu'à 5 personnes de votre famille peuvent créer un compte et le rattacher à l'identifiant unique de votre enfant.",
                        ),
                    },
                ],
            },
            {
                type: 'paragraph',
                attrs: {
                    align: 'left',
                },
                content: [],
            },
            {
                type: 'paragraph',
                attrs: {
                    align: 'left',
                },
                content: [],
            },
            {
                type: 'paragraph',
                attrs: {
                    align: 'left',
                },
                content: [
                    {
                        type: 'text',
                        text: t('Bonne journée'),
                    },
                ],
            },
        ],
    };

    return DEFAULT_PARENT_INVITATION_MESSAGE;
};
