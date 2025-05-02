export interface User {
    id: number;
    email: string;
    name: string;
    role: {
        id: number;
        name: string;
    };
}