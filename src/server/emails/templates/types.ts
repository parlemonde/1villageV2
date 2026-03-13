export interface EmailTemplate {
    html: string;
    text: string;
}

export enum EmailType {
    CONFIRM_ACCOUNT = 'CONFIRM_ACCOUNT',
}

export type EmailTemplateProps = {
    [EmailType.CONFIRM_ACCOUNT]: {
        confirmationLink: string;
    };
};
