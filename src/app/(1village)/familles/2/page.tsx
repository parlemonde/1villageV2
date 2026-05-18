'use client';

import { Button, IconButton } from '@frontend/components/ui/Button';
import { Input } from '@frontend/components/ui/Form';
import { Loader } from '@frontend/components/ui/Loader';
import { Modal } from '@frontend/components/ui/Modal';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Steps } from '@frontend/components/ui/Steps';
import { Title } from '@frontend/components/ui/Title';
import { jsonFetcher } from '@lib/json-fetcher';
import { ChevronLeftIcon, ChevronRightIcon, Pencil1Icon, TrashIcon } from '@radix-ui/react-icons';
import type { Student } from '@server/database/schemas/students';
import { createStudent } from '@server-actions/students/create-student';
import { deleteStudent } from '@server-actions/students/delete-student';
import { updateStudent } from '@server-actions/students/update-student';
import { useExtracted } from 'next-intl';
import { useState } from 'react';
import useSWR from 'swr';

import styles from './page.module.css';

export default function FamillesStep2() {
    const t = useExtracted('app.(1village).familles.2');
    const tCommon = useExtracted('common');

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    const [idToEdit, setIdToEdit] = useState<number | undefined>();
    const [editFirstName, setEditFirstName] = useState('');
    const [editLastName, setEditLastName] = useState('');

    const [idToDelete, setIdToDelete] = useState<number | undefined>(undefined);

    const { data: students, isLoading, mutate } = useSWR<Student[]>('/api/students', jsonFetcher, { keepPreviousData: true });

    const addChild = async () => {
        const studentName = `${firstName} ${lastName}`;
        await createStudent(studentName);
        setFirstName('');
        setLastName('');
        await mutate();
    };

    const deleteChild = async (id: number | undefined) => {
        if (!id) {
            return;
        }

        await deleteStudent(id);
        setIdToDelete(undefined);
        await mutate();
    };

    const editChild = async (id: number | undefined) => {
        if (!id) {
            return;
        }

        await updateStudent(id, `${editFirstName} ${editLastName}`);
        setIdToEdit(undefined);
        await mutate();
    };

    const openEditionFields = (id: number | undefined) => {
        if (!id) {
            return;
        }

        setIdToEdit(id);
        const studentToEdit = students?.find((student) => student.id === id);
        const studentName = studentToEdit?.name?.split(' ');
        setEditFirstName(studentName?.[0] || '');
        setEditLastName(studentName?.[1] || '');
    };

    return (
        <PageContainer>
            <Steps
                steps={[
                    { label: t('Visibilité'), href: '/familles/1', status: 'success' },
                    { label: t('Ajout enfants'), href: '/familles/2' },
                    { label: t('Communication'), href: '/familles/3' },
                    { label: t('Gestion'), href: '/familles/4' },
                ]}
                activeStep={2}
                marginTop="xl"
                marginBottom="md"
            />
            <Title variant="h2" marginBottom="md">
                <p>{t('Ajoutez les enfants de votre classe')}</p>
            </Title>
            <p>{t('Chaque enfant possède un "code enfant" qui permet à 5 membres de sa famille de se créer un compte.')}</p>
            <br />
            <p>{t("Vous devez ajouter autant d'enfants qu'il y a dans votre classe (vous pouvez ajouter des enfants en cours d'année !) :")}</p>
            <div className={styles.row}>
                <Input type="text" placeholder={t('Prénom')} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                <Input type="text" placeholder={t('Nom')} value={lastName} onChange={(e) => setLastName(e.target.value)} />
                <Button disabled={!firstName || !lastName} onClick={addChild} color="primary" label={t('Ajouter un enfant')} />
            </div>
            <Loader isLoading={isLoading} />
            {students?.map((s) =>
                idToEdit === s.id ? (
                    <div key={s.id} className={styles.row}>
                        <Input type="text" placeholder={t('Prénom')} value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)} />
                        <Input type="text" placeholder={t('Nom')} value={editLastName} onChange={(e) => setEditLastName(e.target.value)} />
                        <Button
                            disabled={!editFirstName || !editLastName}
                            color="primary"
                            label={tCommon('Enregistrer')}
                            onClick={() => editChild(s.id)}
                        />
                        <Button color="primary" label={tCommon('Annuler')} onClick={() => setIdToEdit(undefined)} />
                    </div>
                ) : (
                    <div key={s.id} className={styles.child}>
                        <p>
                            {s.name?.split(' ')[0]} {s.name?.split(' ')[1]}
                        </p>
                        <div className={styles.buttons}>
                            <IconButton icon={Pencil1Icon} color="primary" onClick={() => openEditionFields(s.id)} />
                            <IconButton icon={TrashIcon} color="primary" onClick={() => setIdToDelete(s.id)} />
                        </div>
                    </div>
                ),
            )}
            <div className={styles.buttonsContainer}>
                <Button as="a" href="/familles/1" color="primary" label={tCommon('Étape précédente')} leftIcon={<ChevronLeftIcon />} />
                <Button as="a" href="/familles/3" color="primary" label={tCommon('Étape suivante')} rightIcon={<ChevronRightIcon />} />
            </div>
            <Modal
                isOpen={idToDelete !== undefined}
                onClose={() => setIdToDelete(undefined)}
                title={t("Supprimer l'élève")}
                confirmLabel={tCommon('Supprimer')}
                confirmLevel="error"
                onConfirm={() => deleteChild(idToDelete)}
            >
                {t('Voulez-vous vraiment supprimer cet élève ?')}
            </Modal>
        </PageContainer>
    );
}
