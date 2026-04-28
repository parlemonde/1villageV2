export enum EmailType {
    CONFIRM_ACCOUNT = 'CONFIRM_ACCOUNT',
    RESET_PASSWORD = 'RESET_PASSWORD',
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

export type EmailTemplateProps = {
    [EmailType.CONFIRM_ACCOUNT]: ConfirmAccountTemplateData;
    [EmailType.RESET_PASSWORD]: RequestNewPasswordTemplateData;
    [EmailType.INVALID_VILLAGE]: AdminNotificationTemplateData;
    [EmailType.INVALID_COUNTRY]: AdminNotificationTemplateData;
    [EmailType.UNASSIGNED_VILLAGE]: AdminNotificationTemplateData;
};
