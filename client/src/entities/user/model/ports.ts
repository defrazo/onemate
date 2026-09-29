import type { Role, User } from '.';

export interface IBaseUserPort {
	readonly id: string | null;
	readonly lastId: string | null;
}

export interface IUserAuthPort extends IBaseUserPort {
	setUser(user: User | null): void;
	clearSession(): void;
}

export interface IUserRoutingPort {
	readonly user: User | null;
	readonly userRole: Role;
}

export interface IUserRepo {
	loadUser(): Promise<User>;
	updateUsername(username: string): Promise<User>;
	updateEmail(email: string, currentPassword: string): Promise<User>;
	updatePassword(currentPassword: string, password: string, passwordConfirmation: string): Promise<User>;
	verifyPendingEmail(id: string, hash: string, params: Record<string, string>): Promise<User>;
	cancelPendingEmail(): Promise<User>;
	resendPendingEmail(): Promise<void>;
	deleteAccount(): Promise<User>;
	restoreAccount(): Promise<User>;
}
