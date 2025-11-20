export interface PasswordStrength {
    level: 'weak' | 'strong';
    percentage: number;
}

export const getPasswordStrength = (password: string): PasswordStrength => {
    const hasMinLength = password.length >= 8;
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasDigits = /\d/.test(password);

    const meetsAllRequirements = hasMinLength && hasLowercase && hasUppercase && hasDigits;

    if (meetsAllRequirements) {
        return { level: 'strong', percentage: 100 };
    }
    return { level: 'weak', percentage: 25 };
};

export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
