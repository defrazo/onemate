import type { User } from '@supabase/supabase-js';

export interface IBaseUserPort {
	readonly id: string | null;
	readonly lastId: string | null;
}

export interface IUserProfilePort extends IBaseUserPort {
	readonly username: string;
	readonly email: string;
	updateUsername(username: string): Promise<void>;
	updateEmail(email: string): Promise<void>;
}

export interface IUserAuthPort extends IBaseUserPort {
	readonly email: string;
	reset(): void;
	loadUser(): Promise<void>;
}

export interface IUserAccountPort extends IBaseUserPort {
	loadUser(): Promise<void>;
	updateEmail(email: string): Promise<void>;
	updateUsername(username: string): Promise<void>;
	updatePassword(password: string): Promise<void>;
}

export interface IUserRepo {
	loadUser(): Promise<User>;
	updateUsername(username: string): Promise<User>;
	updateEmail(email: string): Promise<User>;
	updatePassword(password: string): Promise<User>;
}
