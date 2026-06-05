export enum EmailType {
    CONFIRM_ACCOUNT = 'CONFIRM_ACCOUNT',
    RESET_PASSWORD = 'RESET_PASSWORD',
    NEW_ADMIN_PUBLICATION = 'NEW_ADMIN_PUBLICATION',
    NEW_COMMENT = 'NEW_COMMENT',
    INVALID_VILLAGE = 'INVALID_VILLAGE',
    INVALID_COUNTRY = 'INVALID_COUNTRY',
    UNASSIGNED_VILLAGE = 'UNASSIGNED_VILLAGE',
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
export interface AdminNotificationTemplateData {
    userName: string;
    userEmail: string;
    frontUrl: string;
}

export interface NewAdminPublicationTemplateData extends BaseTemplateData {
    link: string;
}

export interface NewCommentTemplateData extends BaseTemplateData {
    activityName: string;
    commenterName: string;
    commentPreview?: string;
    link: string;
}

export type EmailTemplateProps = {
    [EmailType.CONFIRM_ACCOUNT]: ConfirmAccountTemplateData;
    [EmailType.RESET_PASSWORD]: RequestNewPasswordTemplateData;
    [EmailType.NEW_ADMIN_PUBLICATION]: NewAdminPublicationTemplateData;
    [EmailType.NEW_COMMENT]: NewCommentTemplateData;
    [EmailType.INVALID_VILLAGE]: AdminNotificationTemplateData;
    [EmailType.INVALID_COUNTRY]: AdminNotificationTemplateData;
    [EmailType.UNASSIGNED_VILLAGE]: AdminNotificationTemplateData;
};
