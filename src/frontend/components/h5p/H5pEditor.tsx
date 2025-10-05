import { Button } from '@frontend/components/ui/Button';
import { jsonFetcher } from '@lib/json-fetcher';
import { H5PEditorUI } from '@lumieducation/h5p-react';
import React from 'react';

export interface H5pEditorProps {
    contentId?: string;
    onSaved?: () => void;
}
const H5pEditor = ({ contentId = 'new', onSaved }: H5pEditorProps) => {
    const h5pEditorRef = React.useRef<H5PEditorUI | null>(null);

    return (
        <>
            <div style={{ width: '100%', maxWidth: '960px', margin: '0 auto' }}>
                <H5PEditorUI
                    ref={(ref) => {
                        h5pEditorRef.current = ref;
                    }}
                    contentId={contentId}
                    loadContentCallback={(contentId) =>
                        jsonFetcher(`/api/h5p/data/${contentId || 'new'}/edit`, {
                            method: 'GET',
                        })
                    }
                    saveContentCallback={(cId, body) => {
                        if (!cId || cId === 'new' || cId === 'undefined') {
                            return jsonFetcher(`/api/h5p/data`, {
                                method: 'POST',
                                body: JSON.stringify(body),
                            });
                        } else {
                            return jsonFetcher(`/api/h5p/data/${cId}`, {
                                method: 'PATCH',
                                body: JSON.stringify(body),
                            });
                        }
                    }}
                    onSaved={onSaved}
                />
            </div>
            <div style={{ margin: '2rem 0 1rem 0', textAlign: 'center' }}>
                <Button
                    label={contentId === 'new' ? 'Créer le contenu H5P !' : 'Mettre à jour le contenu H5P !'}
                    color="primary"
                    variant="contained"
                    onClick={() => {
                        h5pEditorRef.current?.save().catch();
                    }}
                ></Button>
            </div>
        </>
    );
};

export default H5pEditor;
