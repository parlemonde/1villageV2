'use client';

import type { HtmlEditorContent } from '@frontend/components/html/HtmlEditor/HtmlEditor';
import { defaultContent } from '@frontend/components/html/HtmlEditor/HtmlEditor';
import { CircularProgress } from '@frontend/components/ui/CircularProgress';
import { debounce } from '@frontend/lib/debounce';
import { saveParentInvitationMessage } from '@server-actions/families/save-parent-invitation-message';
import { saveStudents } from '@server-actions/families/save-students';
import { useExtracted } from 'next-intl';
import { createContext, useCallback, useMemo, useState } from 'react';

export interface ActivityVisibilityForm {
    showOnlyClassroomActivities: boolean;
}

export interface StudentsForm {
    students: { id?: number; tempId: string; isDeleted?: boolean; firstName: string; lastName: string }[];
}

export interface ParentInvitationMessageForm {
    parentInvitationMessage: HtmlEditorContent;
}

export interface FamilyForm extends ActivityVisibilityForm, StudentsForm, ParentInvitationMessageForm {}

export const FamilyContext = createContext<{
    form: FamilyForm;
    setStudents: (formState: Partial<StudentsForm>) => void;
    setParentInvitationMessage: (message: HtmlEditorContent) => void;
}>({
    form: { showOnlyClassroomActivities: true, students: [], parentInvitationMessage: defaultContent },
    setStudents: () => {},
    setParentInvitationMessage: () => {},
});

enum SaveState {
    Idle = 0,
    Loading,
    Saved,
}

let onCancelPreviousPromise: () => void = () => {};
async function onSaveForm<T>(serverAction: (form: Partial<T>) => Promise<void>, form: Partial<T>, setSaveStep: (step: number) => void) {
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
}

interface FamilyProviderProps {
    showOnlyClassroomActivities: boolean;
    students?: { id?: number; tempId: string; isDeleted?: boolean; firstName: string; lastName: string }[];
    parentInvitationMessage?: HtmlEditorContent;
}
export const FamilyProvider = ({
    showOnlyClassroomActivities,
    students = [],
    children,
    parentInvitationMessage = defaultContent,
}: React.PropsWithChildren<FamilyProviderProps>) => {
    const tCommon = useExtracted('common');

    const [formState, setFormState] = useState<FamilyForm>({
        showOnlyClassroomActivities,
        students,
        parentInvitationMessage,
    });

    const [saveStep, setSaveStep] = useState(SaveState.Idle);

    const onSaveStudentsDebounced = useMemo(
        () =>
            debounce((formState: StudentsForm) => {
                onSaveForm(saveStudents, formState, setSaveStep).catch();
            }, 2000),
        [],
    );

    const onSaveParentInvitationMessage = useMemo(
        () =>
            debounce((formState: ParentInvitationMessageForm) => {
                onSaveForm(saveParentInvitationMessage, formState, setSaveStep).catch();
            }, 2000),
        [],
    );

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

    const setParentInvitationMessage = useCallback(
        (parentInvitationMessage: HtmlEditorContent) => {
            setFormState((prev) => {
                const next = { ...prev, parentInvitationMessage };
                onSaveParentInvitationMessage({ parentInvitationMessage: next.parentInvitationMessage });
                return next;
            });
        },
        [onSaveParentInvitationMessage],
    );

    const value = useMemo(() => ({ form: formState, setStudents, setParentInvitationMessage }), [formState, setStudents, setParentInvitationMessage]);
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
