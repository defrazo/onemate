import type { Role, User } from '.';

export interface IBaseUserPort {
	readonly id: string | null;
	readonly lastId: string | null;
}

export interface IUserProfilePort extends IBaseUserPort {
	readonly username: string;
	readonly email: string;

	updateUsername(username: string): Promise<void>;
	updateEmail(email: string, currentPassword: string): Promise<void>;
}

export interface IUserAuthPort extends IBaseUserPort {
	readonly email: string;

	setUser(user: User | null): void;
	// loadUser(): Promise<void>;
	// reset(): void;
	clearSession(): void;
}

// export interface IUserAccountPort extends IBaseUserPort {
// 	loadUser(): Promise<void>;
// 	updateEmail(email: string, currentPassword: string): Promise<void>;
// 	updateUsername(username: string): Promise<void>;
// 	updatePassword(currentPassword: string, password: string, passwordConfirmation: string): Promise<void>;
// 	cancelPendingEmail(): Promise<void>;
// 	resendPendingEmail(): Promise<void>;
// 	deleteAccount(): Promise<void>;
// 	restoreAccount(): Promise<void>;
// }

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
