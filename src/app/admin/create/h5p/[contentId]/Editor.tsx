'use client';

import { H5pEditor } from '@frontend/components/h5p';
import { useRouter } from 'next/navigation';

interface EditorProps {
    contentId: string;
}
export const Editor = ({ contentId }: EditorProps) => {
    const router = useRouter();
    return (
        <H5pEditor
            contentId={contentId}
            onSaved={() => {
                router.push(`/admin/create/h5p`);
            }}
        />
    );
};
