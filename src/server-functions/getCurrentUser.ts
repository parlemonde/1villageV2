export interface User {
    id: number;
    name: string;
    email: string;
}

export const getCurrentUser = async (): Promise<User | null> => {
    return {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com',
    };
    // return null;
};
