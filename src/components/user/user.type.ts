export class UserType {
    readonly id?: number;
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    activationToken?: string | null;
    lastLoggedIn?: string | null;
    isActivated?: boolean;
    deactivatedAt?: Date | null;
    isDeleted?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    role?: string;
}

export class UserProfileType {
    readonly _id?: number;
    readonly id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    lastLoggedIn?: string | null;
    isActivated?: boolean;
    deactivatedAt?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
    role?: string;
}

export class PreUserCreationProcessOutput {
    hashedPassword: string;
}

