// create user type

export type UserRole = "user" | "admin" | "player";

export interface User {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    createdAt: string;
    updatedAt?: string;
}

export interface CreateUserDto {
    name: string;
    email: string;
    password: string;
    role: UserRole;
}

export interface UpdateUserDto {
    name?: string;
    email?: string;
    role?: UserRole;
}

export interface LoginUserDto {
    email: string;
    password: string;
}

export interface SignedUserDto extends User {
    accessToken: string;
}