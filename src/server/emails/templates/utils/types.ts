export enum EmailType {
    CONFIRM_ACCOUNT = 'CONFIRM_ACCOUNT',
    RESET_PASSWORD = 'RESET_PASSWORD',
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

export type EmailTemplateProps = {
    [EmailType.CONFIRM_ACCOUNT]: ConfirmAccountTemplateData;
    [EmailType.RESET_PASSWORD]: RequestNewPasswordTemplateData;
};
