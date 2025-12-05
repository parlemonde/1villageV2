import { Field, Input } from '@frontend/components/ui/Form';
import { CountrySelect } from '@frontend/components/ui/Form/CountrySelect';
import { Modal } from '@frontend/components/ui/Modal';
import { UserContext } from '@frontend/contexts/userContext';
import { updateClassroom } from '@server-actions/classrooms/update-classroom';
import { useContext, useState } from 'react';

interface UpdateClassroomModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function UpdateClassroomModal({ isOpen, onClose }: UpdateClassroomModalProps) {
    const { user, classroom, setClassroom } = useContext(UserContext);

    const [currentLevel, setCurrentLevel] = useState(classroom?.level || '');
    const [currentSchoolName, setCurrentSchoolName] = useState(classroom?.name || '');
    const [currentAddress, setCurrentAddress] = useState(classroom?.address || '');
    const [currentCity, setCurrentCity] = useState(classroom?.city || '');
    const [currentCountry, setCurrentCountry] = useState(classroom?.countryCode || '');

    const [isUpdating, setIsUpdating] = useState(false);
    const [updateErrorMessage, setUpdateErrorMessage] = useState('');

    const handleClose = () => {
        setCurrentLevel(classroom?.level || '');
        setCurrentSchoolName(classroom?.name || '');
        setCurrentAddress(classroom?.address || '');
        setCurrentCity(classroom?.city || '');
        setCurrentCountry(classroom?.countryCode || '');
        setUpdateErrorMessage('');
        onClose();
    };

    const handleConfirm = async () => {
        if (!currentCountry) {
            return;
        }

        setUpdateErrorMessage('');
        setIsUpdating(true);
        try {
            const [updatedClassroom] = await updateClassroom({
                teacherId: user.id,
                id: classroom?.id,
                level: currentLevel,
                name: currentSchoolName,
                address: currentAddress,
            });
            setClassroom(updatedClassroom);
            handleClose();
        } catch {
            setUpdateErrorMessage('Une erreur est survenue lors de la mise à jour de votre classe');
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Modifier ma classe"
            confirmLabel="Modifier"
            onConfirm={handleConfirm}
            isLoading={isUpdating}
            width="md"
            isConfirmDisabled={false}
        >
            {updateErrorMessage && <p style={{ color: 'var(--error-color)', marginBottom: 4, textAlign: 'center' }}>{updateErrorMessage}</p>}
            <Field
                name="level"
                label="Niveau de classe"
                marginBottom="md"
                input={
                    <Input
                        id="level"
                        type="text"
                        isFullWidth
                        hasError={false}
                        value={currentLevel}
                        onChange={(e) => setCurrentLevel(e.target.value)}
                        placeholder="Entrez le niveau de votre classe"
                        autoFocus
                    />
                }
            />
            <Field
                name="name"
                label="École"
                marginBottom="md"
                input={
                    <Input
                        id="name"
                        type="text"
                        isFullWidth
                        hasError={false}
                        value={currentSchoolName}
                        onChange={(e) => setCurrentSchoolName(e.target.value)}
                        placeholder="Entrez le nom de votre école"
                    />
                }
            />
            <Field
                name="address"
                label="Adresse"
                marginBottom="md"
                input={
                    <Input
                        id="address"
                        type="text"
                        isFullWidth
                        hasError={false}
                        value={currentAddress}
                        onChange={(e) => setCurrentAddress(e.target.value)}
                        placeholder="Entrez l'adresse de l'école"
                    />
                }
            />
            <Field
                name="city"
                label="Ville"
                marginBottom="md"
                input={
                    <Input id="city" type="text" isFullWidth hasError={false} value={currentCity} onChange={(e) => setCurrentCity(e.target.value)} />
                }
            />
            <Field
                name="country"
                label="Pays"
                marginBottom="md"
                input={<CountrySelect value={currentCountry} onChange={setCurrentCountry} isFullWidth disabled />}
            />
        </Modal>
    );
}
