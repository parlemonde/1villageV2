export enum EmailType {
    CONFIRM_ACCOUNT = 'CONFIRM_ACCOUNT',
}

export interface BaseTemplateData extends React.PropsWithChildren {
    firstName: string;
}

export interface ConfirmAccountTemplateData extends BaseTemplateData {
    confirmationLink: string;
}

export type EmailTemplateProps = {
    [EmailType.CONFIRM_ACCOUNT]: ConfirmAccountTemplateData;
};
