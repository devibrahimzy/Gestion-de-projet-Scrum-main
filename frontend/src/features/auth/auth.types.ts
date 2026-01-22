export interface User {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    role: 'ADMIN' | 'SCRUM_MASTER' | 'TEAM_MEMBER' | 'PRODUCT_OWNER';
    isActive?: boolean;
    is_verified?: boolean;
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface LoginCredentials {
    email: string;
    password?: string;
}

export interface RegisterCredentials {
    email: string;
    password?: string;
    first_name: string;
    last_name: string;
    role: string;
}
