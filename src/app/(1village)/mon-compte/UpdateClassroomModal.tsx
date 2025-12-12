import type { NominatimPlace } from '@app/api/geo/route';
import { Map } from '@frontend/components/Map';
import type { Coordinates } from '@frontend/components/Map/Map';
import { Field, Input } from '@frontend/components/ui/Form';
import { CountrySelect } from '@frontend/components/ui/Form/CountrySelect';
import { Modal } from '@frontend/components/ui/Modal';
import { UserContext } from '@frontend/contexts/userContext';
import { serializeToQueryUrl } from '@lib/serialize-to-query-url';
import { updateClassroom } from '@server-actions/classrooms/update-classroom';
import { useContext, useEffect, useState } from 'react';

interface UpdateClassroomModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function UpdateClassroomModal({ isOpen, onClose }: UpdateClassroomModalProps) {
    const { user, classroom, setClassroom } = useContext(UserContext);

    const [currentLevel, setCurrentLevel] = useState('');
    const [currentSchoolName, setCurrentSchoolName] = useState('');
    const [currentAddress, setCurrentAddress] = useState('');
    const [currentCountry, setCurrentCountry] = useState('');
    const [currentCoordinates, setCurrentCoordinates] = useState<Coordinates | undefined>();

    const [isUpdating, setIsUpdating] = useState(false);
    const [updateErrorMessage, setUpdateErrorMessage] = useState('');
    const [useFallback, setUseFallback] = useState(false);

    const hasValidationErrors = !currentSchoolName || !currentAddress;
    const isConfirmDisabled = isUpdating || hasValidationErrors;

    useEffect(() => {
        setCurrentLevel(classroom?.level || '');
        setCurrentSchoolName(classroom?.name || '');
        setCurrentAddress(classroom?.address || '');
        setCurrentCountry(classroom?.countryCode || '');
        setCurrentCoordinates(classroom?.coordinates ? { lat: classroom.coordinates.latitude, lng: classroom.coordinates.longitude } : undefined);
    }, [classroom, isOpen]);

    const handleClose = () => {
        setUseFallback(false);
        setUpdateErrorMessage('');
        onClose();
    };

    const getAddressPosition = async () => {
        const response = await fetch(`/api/geo${serializeToQueryUrl({ query: currentAddress })}`);
        const [data] = (await response.json()) as NominatimPlace[];

        if (!data) {
            setUseFallback(true);
            setUpdateErrorMessage(
                "Nous n'avons pas pu trouver l'adresse de votre école. Veuillez déplacer le marqueur à l'emplacement de votre école",
            );
            return;
        }

        return {
            city: data.address.city,
            countryCode: data.address.country_code.toUpperCase(),
            latitude: data.lat,
            longitude: data.lon,
        };
    };

    const getCountryByCoordinates = async () => {
        const response = await fetch(`/api/geo${serializeToQueryUrl({ query: `${currentCoordinates?.lat},${currentCoordinates?.lng}` })}`);
        const [data] = (await response.json()) as NominatimPlace[];

        return data.address.country_code.toUpperCase();
    };

    const handleConfirm = async () => {
        if (hasValidationErrors) {
            return;
        }

        setUpdateErrorMessage('');
        setIsUpdating(true);
        try {
            if (useFallback) {
                const country = await getCountryByCoordinates();
                if (country !== currentCountry) {
                    setUpdateErrorMessage("L'emplacement sélectionné ne correspond pas à votre pays.");
                    setIsUpdating(false);
                    return;
                }

                const [updatedClassroom] = await updateClassroom({
                    teacherId: user.id,
                    id: classroom?.id,
                    level: currentLevel,
                    name: currentSchoolName,
                    address: currentAddress,
                    countryCode: country,
                    coordinates: currentCoordinates ? { latitude: currentCoordinates.lat, longitude: currentCoordinates.lng } : undefined,
                });
                setClassroom(updatedClassroom);
                handleClose();
                return;
            }

            const address = await getAddressPosition();
            if (!address) {
                return;
            }
            const [updatedClassroom] = await updateClassroom({
                teacherId: user.id,
                id: classroom?.id,
                level: currentLevel,
                name: currentSchoolName,
                address: currentAddress,
                countryCode: address.countryCode,
                coordinates: { latitude: Number(address.latitude), longitude: Number(address.longitude) },
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
            isConfirmDisabled={isConfirmDisabled}
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
                isRequired
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
                isRequired
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
            {useFallback && <Map marginBottom="md" marginX="auto" coordinates={currentCoordinates} zoom={5} setCoordinates={setCurrentCoordinates} />}
            <Field
                style={{ pointerEvents: 'none' }}
                isRequired={useFallback}
                name="country"
                label="Pays"
                marginBottom="md"
                input={<CountrySelect value={currentCountry} onChange={setCurrentCountry} isFullWidth disabled />}
            />
        </Modal>
    );
}
