export type User = {
    id: number;
    name: string;
    email: string;
    created_at: string;
};

export type LoginResponse = User & {
    token: string;
};

export type RegisterResponse = User;
