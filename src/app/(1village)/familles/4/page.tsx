'use client';

import { downloadPdf } from '@app/(1village)/familles/helpers';
import { sendToast } from '@frontend/components/Toasts';
import { Button } from '@frontend/components/ui/Button';
import { Checkbox } from '@frontend/components/ui/Form/Checkbox';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Steps } from '@frontend/components/ui/Steps';
import { Title } from '@frontend/components/ui/Title';
import { FamilyContext } from '@frontend/contexts/familyContext';
import { jsonFetcher } from '@lib/json-fetcher';
import { ChevronLeftIcon } from '@radix-ui/react-icons';
import type { Student } from '@server/database/schemas/students';
import { generateInvitationsPdf } from '@server-actions/families/generate-invitations-pdf';
import { useExtracted } from 'next-intl';
import { useContext, useState } from 'react';
import useSWR from 'swr';

import styles from './page.module.css';

const isStep3Valid = (message: unknown) => {
    const json = JSON.stringify(message);
    return json.includes('%code');
};

export default function FamillesStep4() {
    const t = useExtracted('app.(1village).familles.4');
    const tCommon = useExtracted('common');

    const { data: students } = useSWR<Student[]>('/api/students', jsonFetcher, { keepPreviousData: true });

    const [checked, setChecked] = useState<number[]>([]);

    const { form } = useContext(FamilyContext);

    const handleCheck = (id: number) => {
        if (checked.includes(id)) {
            setChecked(checked.filter((i) => i !== id));
        } else {
            setChecked([...checked, id]);
        }
    };

    const download = async (studentIds: number[]) => {
        const pdfBuffer = await generateInvitationsPdf(form.parentInvitationMessage, studentIds);
        if (!pdfBuffer) {
            sendToast({ type: 'error', message: t('Une erreur est survenue lors de la génération du PDF') });
            return;
        }

        downloadPdf(pdfBuffer, t('code-enfants'));
    };

    const checkAll = () => {
        if (checked.length === students?.length) {
            setChecked([]);
        } else {
            setChecked(students?.map((s) => s.id) ?? []);
        }
    };

    return (
        <PageContainer>
            <Steps
                steps={[
                    { label: t('Visibilité'), href: '/familles/1', status: 'success' },
                    { label: t('Ajout enfants'), href: '/familles/2', status: 'success' },
                    { label: t('Communication'), href: '/familles/3', status: isStep3Valid(form.parentInvitationMessage) ? 'success' : 'warning' },
                    { label: t('Gestion'), href: '/familles/4' },
                ]}
                activeStep={4}
                marginTop="xl"
                marginBottom="md"
            />
            <Title variant="h2">{t('Gérez les accès aux familles')}</Title>
            <p>
                {t(
                    'Pour chaque enfant de votre classe, vous pouvez voir le nombre de compte famille crée ainsi que télécharger individuellement le texte de présentation (si une famille a perdu le sien par exemple).',
                )}
            </p>
            {students && (
                <>
                    <Button
                        onClick={() => download(checked.length === 0 ? students.map((s) => s.id) : checked)}
                        label={t('Télécharger {count} {presentations}', {
                            count: checked.length === 0 ? students.length.toString() : checked.length.toString(),
                            presentations: checked.length === 1 ? t('presentation') : t('presentations'),
                        })}
                        color="primary"
                        marginY="lg"
                    />
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th scope="col">
                                    <Checkbox
                                        name="all_checkbox"
                                        isChecked={checked.length !== 0 && checked.length === students.length}
                                        onChange={() => checkAll()}
                                    />
                                </th>
                                <th scope="col">{t("Prénom et nom de l'enfant")}</th>
                                <th scope="col">{t('Accès familles')}</th>
                                <th scope="col">{t('Code enfant')}</th>
                                <th scope="col">{t('Actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student) => (
                                <tr key={student.id}>
                                    <td>
                                        <Checkbox
                                            name={`${student.id}_checkbox`}
                                            isChecked={checked.includes(student.id)}
                                            onChange={() => handleCheck(student.id)}
                                        />
                                    </td>
                                    <td>{student.name}</td>
                                    <td>0 {/* TODO */}</td>
                                    <td>{student.inviteCode}</td>
                                    <td>
                                        <Button label={t('Télécharger la présentation')} color="primary" onClick={() => download([student.id])} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}
            <Button as="a" href="/familles/3" label={tCommon('Étape précédente')} color="primary" leftIcon={<ChevronLeftIcon />} marginY="xl" />
        </PageContainer>
    );
}
