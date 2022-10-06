import { Exclude } from "class-transformer";

export class UserEntity {
    id: string;
    email: string;
    name: string;
    two_factor_auth: boolean;
    two_factor_auth_uri: string;

    @Exclude()
    two_factor_auth_key: string;

    created_at: Date;
    updated_at: Date;

    constructor(partial: Partial<UserEntity>) {
        Object.assign(this, partial);
    }
}