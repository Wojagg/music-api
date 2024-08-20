
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export class User {
    id: string;
    pass?: Nullable<string>;
    name?: Nullable<string>;
    isActive?: Nullable<boolean>;
    isAdmin?: Nullable<boolean>;
}

export abstract class IQuery {
    abstract getUser(id: string): Nullable<User> | Promise<Nullable<User>>;

    abstract getUsers(): Nullable<Nullable<User>[]> | Promise<Nullable<Nullable<User>[]>>;
}

export abstract class IMutation {
    abstract createUser(name: string, pass: string, isAdmin: boolean): Nullable<string> | Promise<Nullable<string>>;

    abstract updateUser(id: string, name?: Nullable<string>, isActive?: Nullable<boolean>, isAdmin?: Nullable<boolean>, pass?: Nullable<string>): Nullable<Void> | Promise<Nullable<Void>>;

    abstract updateCurrentUser(name?: Nullable<string>, isActive?: Nullable<boolean>, isAdmin?: Nullable<boolean>, pass?: Nullable<string>): Nullable<Void> | Promise<Nullable<Void>>;

    abstract deleteUser(id: string): Nullable<Void> | Promise<Nullable<Void>>;
}

export type Void = any;
type Nullable<T> = T | null;
