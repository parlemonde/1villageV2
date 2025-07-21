export interface User {
    id: number;
    name: string;
    email: string;
}

export const getCurrentUser = async (): Promise<User | null> => {
    return null;
};
