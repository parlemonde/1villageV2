'use client';

import { defaultContent } from '@frontend/components/html/HtmlEditor/HtmlEditor';
import { CircularProgress } from '@frontend/components/ui/CircularProgress';
import { debounce } from '@frontend/lib/debounce';
import { saveActivityVisibility } from '@server-actions/families/save-activity-visibility';
import { saveStudents } from '@server-actions/families/save-students';
import { useExtracted } from 'next-intl';
import { createContext, useCallback, useMemo, useState } from 'react';

export interface ActivityVisibilityForm {
    showOnlyClassroomActivities: boolean;
    activityVisibilityMap: Record<number, boolean>;
}

export interface StudentsForm {
    students: { id?: number; tempId: string; isDeleted?: boolean; firstName: string; lastName: string }[];
}

export interface EmailContentForm {
    emailContent: unknown;
}

export interface FamilyForm extends ActivityVisibilityForm, StudentsForm, EmailContentForm {}

export const FamilyContext = createContext<{
    form: FamilyForm;
    setActivitiesVisibility: (formState: Partial<ActivityVisibilityForm>) => Promise<void>;
    setStudents: (formState: Partial<StudentsForm>) => void;
}>({
    form: { showOnlyClassroomActivities: true, activityVisibilityMap: {}, students: [], emailContent: defaultContent },
    setActivitiesVisibility: () => Promise.resolve(),
    setStudents: () => {},
});

enum SaveState {
    Idle = 0,
    Loading,
    Saved,
}

let onCancelPreviousPromise: () => void = () => {};
const onSaveForm = async <T,>(serverAction: (form: Partial<T>) => Promise<void>, form: Partial<T>, setSaveStep: (step: number) => void) => {
    onCancelPreviousPromise();
    let cancelled = false;
    onCancelPreviousPromise = () => {
        cancelled = true;
    };
    try {
        setSaveStep(SaveState.Loading);
        const now = Date.now();
        await serverAction(form);
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

interface FamilyProviderProps {
    showOnlyClassroomActivities: boolean;
    activityVisibilityMap?: Record<number, boolean>;
    students?: { id?: number; tempId: string; isDeleted?: boolean; firstName: string; lastName: string }[];
}
export const FamilyProvider = ({
    showOnlyClassroomActivities,
    activityVisibilityMap = {},
    students = [],
    children,
}: React.PropsWithChildren<FamilyProviderProps>) => {
    const tCommon = useExtracted('common');

    const [formState, setFormState] = useState<FamilyForm>({
        showOnlyClassroomActivities,
        activityVisibilityMap,
        students,
        emailContent: defaultContent,
    });

    const [saveStep, setSaveStep] = useState(SaveState.Idle);

    const onSaveStudentsDebounced = useMemo(
        () =>
            debounce((formState: StudentsForm) => {
                onSaveForm(saveStudents, formState, setSaveStep).catch();
            }, 2000),
        [],
    );

    const setActivitiesVisibility = useCallback(async (formState: Partial<ActivityVisibilityForm>) => {
        setFormState((prev) => ({ ...prev, ...formState }));
        await onSaveForm(saveActivityVisibility, formState, setSaveStep);
    }, []);

    const setStudents = useCallback(
        (formState: Partial<StudentsForm>) => {
            setFormState((prev) => {
                const next = { ...prev, ...formState };
                onSaveStudentsDebounced({ students: next.students });
                return next;
            });
        },
        [onSaveStudentsDebounced],
    );

    const value = useMemo(() => ({ form: formState, setActivitiesVisibility, setStudents }), [formState, setActivitiesVisibility, setStudents]);
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
