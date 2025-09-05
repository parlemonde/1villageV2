type HtmlContent = {
    type: 'html';
    html: unknown;
};
type ImageContent = {
    type: 'image';
    image: string;
};
type AudioContent = {
    type: 'audio';
    audio: string;
};
type VideoContent = {
    type: 'video';
    video: string;
};
type H5pContent = {
    type: 'h5p';
    h5p: string;
};
export type AnyContent = HtmlContent | ImageContent | AudioContent | VideoContent | H5pContent;
