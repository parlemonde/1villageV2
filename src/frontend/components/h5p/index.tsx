'use client';

import type { H5pEditorProps } from './H5pEditor';
import type { H5pPlayerProps } from './H5pPlayer';
import { H5pEditor as H5pEditorDynamic } from './dynamic-imports';
import { H5pPlayer as H5pPlayerDynamic } from './dynamic-imports';

export const H5pEditor = (props: H5pEditorProps) => {
    return <H5pEditorDynamic {...props} />;
};

export const H5pPlayer = (props: H5pPlayerProps) => {
    return <H5pPlayerDynamic {...props} />;
};
