export enum EmailType {
    CONFIRM_ACCOUNT = 'CONFIRM_ACCOUNT',
    RESET_PASSWORD = 'RESET_PASSWORD',
    NEW_ADMIN_PUBLICATION = 'NEW_ADMIN_PUBLICATION',
    NEW_COMMENT = 'NEW_COMMENT',
}

export interface BaseTemplateData extends React.PropsWithChildren {
    firstName?: string;
}

export interface ConfirmAccountTemplateData extends BaseTemplateData {
    confirmationLink: string;
}
export interface RequestNewPasswordTemplateData extends BaseTemplateData {
    resetPasswordLink: string;
}

export interface NewAdminPublicationTemplateData extends BaseTemplateData {
    title: string;
    description?: string;
    link: string;
}

export interface NewCommentTemplateData extends BaseTemplateData {
    activityTitle: string;
    commenterName: string;
    commentPreview?: string;
    link: string;
}

export type EmailTemplateProps = {
    [EmailType.CONFIRM_ACCOUNT]: ConfirmAccountTemplateData;
    [EmailType.RESET_PASSWORD]: RequestNewPasswordTemplateData;
    [EmailType.NEW_ADMIN_PUBLICATION]: NewAdminPublicationTemplateData;
    [EmailType.NEW_COMMENT]: NewCommentTemplateData;
};
