import { H5PAjaxEndpoint, H5PEditor, H5PPlayer, UrlGenerator } from '@lumieducation/h5p-server';
import type { IH5PConfig } from '@lumieducation/h5p-server';
import { registerService } from '@server/lib/register-service';
import { v4 } from 'uuid';

import { ContentStorage } from './lib/content-storage';
import { ContentUserDataStorage } from './lib/content-user-data-storage';
import { KeyValueStorage } from './lib/key-value-storage';
import { LibraryStorage } from './lib/library-storage';
import { TemporaryStorage } from './lib/temporary-storage';

const DEFAULT_CONFIG: IH5PConfig = {
    uuid: '',
    disableFullscreen: false,
    fetchingDisabled: 0,
    siteType: 'local',
    sendUsageStatistics: false,
    contentHubEnabled: true,
    hubRegistrationEndpoint: 'https://api.h5p.org/v1/sites',
    hubContentTypesEndpoint: 'https://api.h5p.org/v1/content-types/',
    contentTypeCacheRefreshInterval: 86400000,
    contentHubMetadataRefreshInterval: 86400000,
    contentWhitelist:
        'json png jpg jpeg gif bmp tif tiff eot ttf woff woff2 otf webm mp4 ogg mp3 m4a wav txt pdf rtf doc docx xls xlsx ppt pptx odt ods odp xml csv diff patch swf md textile vtt webvtt gltf glb',
    enableLrsContentTypes: true,
    maxFileSize: 52428800, // 50MB
    contentUserStateSaveInterval: 5000,
    maxTotalSize: 52428800, // 50MB
    editorAddons: {
        'H5P.CoursePresentation': ['H5P.MathDisplay'],
        'H5P.InteractiveVideo': ['H5P.MathDisplay'],
        'H5P.DragQuestion': ['H5P.MathDisplay'],
    },
    coreApiVersion: {
        major: 1,
        minor: 27,
    },
    h5pVersion: '1.27.0',
    libraryWhitelist: 'js css svg',
    lrsContentTypes: ['H5P.Questionnaire', 'H5P.FreeTextQuestion'],
    platformName: 'H5P-Editor-NodeJs',
    platformVersion: '0.10',
    installLibraryLockMaxOccupationTime: 10000,
    installLibraryLockTimeout: 20000,
    temporaryFileLifetime: 7200000,
    exportMaxContentPathLength: 200,
    load: () => Promise.resolve(),
    save: () => Promise.resolve(),
    customization: {
        global: {
            editor: {
                scripts: [],
                styles: [],
            },
            player: {
                scripts: [],
                styles: [],
            },
        },
    },
    contentHubContentEndpoint: 'https://hub-api.h5p.org/v1/contents',
    contentHubMetadataEndpoint: 'https://hub-api.h5p.org/v1/metadata',
    baseUrl: '/api/h5p',
    contentUserDataUrl: '/content-user-data',
    setFinishedEnabled: true,
    setFinishedUrl: '/set-finished',
    librariesUrl: '/libraries',
    contentFilesUrl: '/content',
    contentFilesUrlPlayerOverride: '/api/h5p/content/{{contentId}}',
    temporaryFilesUrl: '/temp-file',
    paramsUrl: '/params',
    editorLibraryUrl: '/editor',
    downloadUrl: '/download',
    coreUrl: '/core',
    ajaxUrl: '/ajax',
    playUrl: '/play',
};

const initH5p = async () => {
    const keyValueStorage = new KeyValueStorage();

    // Retrieve or generate h5p uuid
    let uuid: string | undefined = (await keyValueStorage.load('uuid')) as string | undefined;
    if (uuid === undefined) {
        uuid = v4();
        await keyValueStorage.save('uuid', uuid);
    }
    const config: IH5PConfig = { ...DEFAULT_CONFIG, uuid };

    const urlGenerator = new UrlGenerator(config);

    const h5pEditor = new H5PEditor(
        keyValueStorage,
        config,
        new LibraryStorage(),
        new ContentStorage(),
        new TemporaryStorage(),
        undefined,
        urlGenerator,
        {},
        new ContentUserDataStorage(),
    );
    h5pEditor.setRenderer((model) => model);

    const h5pPlayer = new H5PPlayer(
        h5pEditor.libraryStorage,
        h5pEditor.contentStorage,
        config,
        undefined,
        urlGenerator,
        undefined,
        undefined,
        h5pEditor.contentUserDataStorage,
    );
    h5pPlayer.setRenderer((model) => model);

    const h5pEditorAjax = new H5PAjaxEndpoint(h5pEditor);

    return { h5pPlayer, h5pEditor, h5pEditorAjax };
};

export const getH5pEditors = async () => {
    return await registerService('h5p-editors', initH5p);
};
