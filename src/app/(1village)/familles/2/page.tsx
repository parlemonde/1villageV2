'use client';

import { Button, IconButton } from '@frontend/components/ui/Button';
import { Input } from '@frontend/components/ui/Form';
import { Modal } from '@frontend/components/ui/Modal';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Steps } from '@frontend/components/ui/Steps';
import { Title } from '@frontend/components/ui/Title';
import { FamilyContext } from '@frontend/contexts/familyContext';
import { ChevronLeftIcon, ChevronRightIcon, Pencil1Icon, TrashIcon } from '@radix-ui/react-icons';
import { useExtracted } from 'next-intl';
import { useContext, useState } from 'react';

import styles from './page.module.css';

export default function FamillesStep2() {
    const t = useExtracted('app.(1village).familles.2');
    const tCommon = useExtracted('common');

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    const [idToEdit, setIdToEdit] = useState('');
    const [editFirstName, setEditFirstName] = useState('');
    const [editLastName, setEditLastName] = useState('');

    const [idToDelete, setIdToDelete] = useState<string | undefined>(undefined);

    const { form, setForm } = useContext(FamilyContext);

    const addChild = () => {
        setForm({
            ...form,
            students: [...form.students, { tempId: `${firstName}${lastName}${new Date().getTime()}`, firstName, lastName }],
        });
        setFirstName('');
        setLastName('');
    };

    const deleteChild = (tempId: string, id?: number) => {
        if (id) {
            setForm({
                ...form,
                students: form.students.map((student) => (student.id === id ? { ...student, isDeleted: true } : student)),
            });
        }
        setForm({
            ...form,
            students: form.students.filter((student) => student.tempId !== tempId),
        });
    };

    const editChild = (tempId: string) => {
        setForm({
            ...form,
            students: form.students.map((student) =>
                student.tempId === tempId ? { ...student, firstName: editFirstName, lastName: editLastName } : student,
            ),
        });

        setIdToEdit('');
    };

    const openEditionFields = (tempId: string) => {
        setIdToEdit(tempId);
        setEditFirstName(form.students.find((student) => student.tempId === tempId)?.firstName || '');
        setEditLastName(form.students.find((student) => student.tempId === tempId)?.lastName || '');
    };

    return (
        <PageContainer>
            <Steps
                steps={[
                    { label: t('Visibilité'), href: '/familles/1' },
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
            <p>{t("Vous devez ajouter autant d'enfants qu'il y a dans votre classe (vous pouvez ajouter des enfants en cours d'années !):")}</p>
            <div className={styles.row}>
                <Input type="text" placeholder={t('Prénom')} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                <Input type="text" placeholder={t('Nom')} value={lastName} onChange={(e) => setLastName(e.target.value)} />
                <Button onClick={addChild} color="primary" label={t('Ajouter un enfant')} />
            </div>
            {form.students.map((s) =>
                idToEdit === s.tempId ? (
                    <div key={s.tempId} className={styles.row}>
                        <Input type="text" placeholder={t('Prénom')} value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)} />
                        <Input type="text" placeholder={t('Nom')} value={editLastName} onChange={(e) => setEditLastName(e.target.value)} />
                        <Button color="primary" label={tCommon('Enregistrer')} onClick={() => editChild(s.tempId)} />
                        <Button color="primary" label={tCommon('Annuler')} onClick={() => setIdToEdit('')} />
                    </div>
                ) : (
                    <div key={s.tempId} className={styles.child}>
                        <p>
                            {s.firstName} {s.lastName}
                        </p>
                        <div className={styles.buttons}>
                            <IconButton icon={Pencil1Icon} color="primary" onClick={() => openEditionFields(s.tempId)} />
                            <IconButton icon={TrashIcon} color="primary" onClick={() => deleteChild(s.tempId, s.id)} />
                        </div>
                    </div>
                ),
            )}
            <div className={styles.buttonsContainer}>
                <Button as="a" href="/familles/1" color="primary" label={tCommon('Étape précédente')} rightIcon={<ChevronLeftIcon />} />
                <Button as="a" href="/familles/3" color="primary" label={tCommon('Étape suivante')} rightIcon={<ChevronRightIcon />} />
            </div>
            <Modal
                isOpen={idToDelete !== undefined}
                onClose={() => setIdToDelete(undefined)}
                title={t("Supprimer l'élève")}
                description={t('Voulez-vous vraiment supprimer cet élève ?')}
                confirmLabel={tCommon('Supprimer')}
                confirmLevel="error"
            />
        </PageContainer>
    );
}
