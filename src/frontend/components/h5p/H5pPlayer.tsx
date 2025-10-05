import { jsonFetcher } from '@lib/json-fetcher';
import { H5PPlayerUI } from '@lumieducation/h5p-react';
import * as React from 'react';

export interface H5pPlayerProps {
    contentId?: string;
    contextId?: string;
}

const H5pPlayer = ({ contentId, contextId }: H5pPlayerProps) => {
    if (!contentId) {
        return null;
    }

    return (
        <H5PPlayerUI
            contentId={contentId}
            contextId={contextId}
            loadContentCallback={async (cId, ctxId) =>
                await jsonFetcher(`/api/h5p/data/${cId}/play${ctxId ? `?contextId=${ctxId}` : ''}`, {
                    method: 'GET',
                })
            }
        ></H5PPlayerUI>
    );
};

export default H5pPlayer;
