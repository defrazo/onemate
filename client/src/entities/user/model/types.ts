import type { Role } from '.';

export type User = {
	id: string;
	username: string;
	email: string;
	pending_email: string | null;
	role: Role;
	email_verified_at: string | null;
	last_login_at: string | null;
	created_at: string;
	updated_at: string;
	deleted_at: string | null;
};

export type UserByEmail = {
	id: string;
	email: string;
	email_confirmed_at: string;
};

export type ConnectedApp = {
	id: string;
	name: string;
	description: string;
	account_type: 'cloud' | 'local';
};

export type ConnectedAppsResponse = {
	apps: ConnectedApp[];
};
