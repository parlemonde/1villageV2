import type { NominatimPlace } from '@app/api/geo/route';
import { Field, Input } from '@frontend/components/ui/Form';
import { CountrySelect } from '@frontend/components/ui/Form/CountrySelect';
import { Modal } from '@frontend/components/ui/Modal';
import { WorldMap2D } from '@frontend/components/worldMaps/WorldMap2D';
import { DEFAULT_COORDINATES } from '@frontend/components/worldMaps/WorldMap2D/WorldMap2D';
import type { Coordinates } from '@frontend/components/worldMaps/world-map.types';
import { UserContext } from '@frontend/contexts/userContext';
import { VillageContext } from '@frontend/contexts/villageContext';
import { serializeToQueryUrl } from '@lib/serialize-to-query-url';
import type { Classroom } from '@server/database/schemas/classrooms';
import { updateClassroom } from '@server-actions/classrooms/update-classroom';
import { useContext, useEffect, useState } from 'react';

interface UpdateClassroomModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function UpdateClassroomModal({ isOpen, onClose }: UpdateClassroomModalProps) {
    const { user, classroom, setClassroom } = useContext(UserContext);
    const { invalidateClassrooms } = useContext(VillageContext);

    const [currentLevel, setCurrentLevel] = useState('');
    const [currentSchoolName, setCurrentSchoolName] = useState('');
    const [currentAddress, setCurrentAddress] = useState('');
    const [currentCountry, setCurrentCountry] = useState('');
    const [currentCoordinates, setCurrentCoordinates] = useState<Coordinates>(DEFAULT_COORDINATES);

    const [isUpdating, setIsUpdating] = useState(false);
    const [updateErrorMessage, setUpdateErrorMessage] = useState('');
    const [useFallback, setUseFallback] = useState(true);
    const [hasAddressChanged, setHasAddressChanged] = useState(false);

    const hasValidationErrors = !currentSchoolName || !currentAddress;
    const isConfirmDisabled = isUpdating || hasValidationErrors;

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCurrentLevel(classroom?.level || '');
        setCurrentSchoolName(classroom?.name || '');
        setCurrentAddress(classroom?.address || '');
        setCurrentCountry(classroom?.countryCode || '');
        setCurrentCoordinates({ lat: classroom?.coordinates?.latitude ?? 0, lng: classroom?.coordinates?.longitude ?? 0 });
    }, [classroom, isOpen]);

    const updateClassroomAndInvalidateContext = (classroom: Classroom) => {
        setClassroom(classroom);
        invalidateClassrooms();
    };

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
            countryCode: data.address.country_code.toUpperCase(),
            latitude: Number(data.lat),
            longitude: Number(data.lon),
        };
    };

    const getAddressPositionData = async () => {
        if (hasAddressChanged) {
            return await getAddressPosition();
        }

        return {
            countryCode: currentCountry,
            latitude: currentCoordinates.lat,
            longitude: currentCoordinates.lng,
        };
    };

    const getCountryByCoordinates = async () => {
        const response = await fetch(`/api/geo${serializeToQueryUrl({ query: `${currentCoordinates?.lat},${currentCoordinates?.lng}` })}`);
        const [data] = (await response.json()) as NominatimPlace[];

        return data.address.country_code.toUpperCase();
    };

    const prepareFallbackClassroomData = async () => {
        const country = await getCountryByCoordinates();
        if (country !== currentCountry) {
            setUpdateErrorMessage("L'emplacement sélectionné ne correspond pas à votre pays.");
            return;
        }
        return {
            currentLevel,
            currentSchoolName,
            currentAddress,
            currentCountry: country,
            currentCoordinates: { latitude: currentCoordinates.lat, longitude: currentCoordinates.lng },
        };
    };

    const prepareStandardClassroomData = async () => {
        const addressPosition = await getAddressPositionData();
        if (!addressPosition) {
            return;
        }
        return {
            currentLevel,
            currentSchoolName,
            currentAddress,
            currentCountry: addressPosition.countryCode,
            currentCoordinates: { latitude: addressPosition.latitude, longitude: addressPosition.longitude },
        };
    };

    const prepareClassroomData = async () => {
        if (useFallback) {
            return prepareFallbackClassroomData();
        }
        return prepareStandardClassroomData();
    };

    const handleConfirm = async () => {
        if (hasValidationErrors) {
            return;
        }

        setUpdateErrorMessage('');
        setIsUpdating(true);
        const classroomData = await prepareClassroomData();
        if (!classroomData || !classroom) {
            return;
        }

        const { data, error } = await updateClassroom({
            teacherId: user.id,
            id: classroom.id,
            level: classroomData.currentLevel,
            name: classroomData.currentSchoolName,
            address: classroomData.currentAddress,
            countryCode: classroomData.currentCountry,
            coordinates: {
                latitude: classroomData.currentCoordinates.latitude,
                longitude: classroomData.currentCoordinates.longitude,
            },
        });
        if (error) {
            setUpdateErrorMessage(error.message);
            setIsUpdating(false);
            return;
        }

        const updatedClassroom = data![0];
        updateClassroomAndInvalidateContext(updatedClassroom);
        handleClose();
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
                        onChange={(e) => {
                            setCurrentAddress(e.target.value);
                            setHasAddressChanged(true);
                        }}
                        placeholder="Entrez l'adresse de l'école"
                    />
                }
            />
            {useFallback && <WorldMap2D coordinates={currentCoordinates} setCoordinates={setCurrentCoordinates} />}
            <Field
                style={{ pointerEvents: 'none' }}
                isRequired={useFallback}
                name="country"
                label="Pays"
                marginBottom="md"
                marginTop="md"
                input={<CountrySelect value={currentCountry} onChange={setCurrentCountry} isFullWidth disabled />}
            />
        </Modal>
    );
}
