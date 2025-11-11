type HtmlContent = {
    type: 'html';
    html: unknown;
};
type ImageContent = {
    type: 'image';
    imageUrl: string;
};
type AudioContent = {
    type: 'audio';
    audioUrl: string;
};
type VideoContent = {
    type: 'video';
    videoUrl: string;
};
type DocumentContent = {
    type: 'document';
    documentUrl: string;
};
type H5pContent = {
    type: 'h5p';
    h5pId: string;
};
export type AnyContent = HtmlContent | ImageContent | AudioContent | VideoContent | DocumentContent | H5pContent;
export type AnyContentType = AnyContent['type'];
