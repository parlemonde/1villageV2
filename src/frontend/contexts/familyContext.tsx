'use client';

import { defaultContent } from '@frontend/components/html/HtmlEditor/HtmlEditor';
import { CircularProgress } from '@frontend/components/ui/CircularProgress';
import { debounce } from '@frontend/lib/debounce';
import { saveForm } from '@server-actions/families/save-form';
import { useExtracted } from 'next-intl';
import { createContext, useCallback, useMemo, useState } from 'react';

export interface FamilyForm {
    showOnlyClassroomActivities: boolean;
    hiddenActivities: number[];
    students: string[];
    emailContent: unknown;
}

export const FamilyContext = createContext<{
    form: FamilyForm;
    setForm: (formState: FamilyForm) => void;
}>({
    form: { showOnlyClassroomActivities: true, hiddenActivities: [], students: [], emailContent: defaultContent },
    setForm: () => {},
});

enum SaveState {
    Idle = 0,
    Loading,
    Saved,
}

let onCancelPreviousPromise: () => void = () => {};
const onSaveForm = async (form: Partial<FamilyForm>, setSaveStep: (step: number) => void) => {
    onCancelPreviousPromise();
    let cancelled = false;
    onCancelPreviousPromise = () => {
        cancelled = true;
    };
    try {
        setSaveStep(SaveState.Loading);
        const now = Date.now();
        await saveForm(form);
        const minDuration = 1000 - (Date.now() - now);
        if (minDuration > 0) {
            await new Promise((resolve) => setTimeout(resolve, minDuration));
        }
        if (cancelled) {
            return;
        }
        setSaveStep(SaveState.Saved);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        if (cancelled) {
            return;
        }
        setSaveStep(SaveState.Idle);
    } catch {
        if (cancelled) {
            return;
        }
        setSaveStep(SaveState.Idle);
    }
    onCancelPreviousPromise = () => {};
};

const onSaveFormDebounced = debounce((form: Partial<FamilyForm>, setSaveStep: (step: number) => void) => {
    onSaveForm(form, setSaveStep).catch();
}, 2000);

interface FamilyProviderProps {
    showOnlyClassroomActivities: boolean;
    hiddenActivities?: number[];
    students?: [];
}
export const FamilyProvider = ({
    showOnlyClassroomActivities,
    hiddenActivities = [],
    students = [],
    children,
}: React.PropsWithChildren<FamilyProviderProps>) => {
    const tCommon = useExtracted('common');

    const [formState, setFormState] = useState<FamilyForm>({
        showOnlyClassroomActivities,
        hiddenActivities,
        students,
        emailContent: defaultContent,
    });

    const [saveStep, setSaveStep] = useState(0);

    const setForm = useCallback(
        (formState: Partial<FamilyForm>) => {
            setFormState((prev) => ({ ...prev, ...formState }));
            onSaveFormDebounced(formState, setSaveStep);
        },
        [setSaveStep],
    );

    const value = useMemo(() => ({ form: formState, setForm }), [formState, setForm]);
    return (
        <FamilyContext.Provider value={value}>
            {children}
            {saveStep > SaveState.Idle && (
                <div style={{ position: 'fixed', bottom: '16px', right: '72px' }}>
                    <div
                        style={{
                            backgroundColor: 'var(--primary-color)',
                            color: 'white',
                            padding: '0 8px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            borderRadius: '4px',
                            fontSize: '14px',
                        }}
                    >
                        {saveStep === SaveState.Loading && <CircularProgress color="inherit" size={18} />}
                        {saveStep === SaveState.Saved && <p className="text text--small">{tCommon('Paramètres enregistrés')}</p>}
                    </div>
                </div>
            )}
        </FamilyContext.Provider>
    );
};
