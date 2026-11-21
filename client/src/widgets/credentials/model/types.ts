import type { PaletteColor } from '@/shared/config';

export type CredentialInput = {
	service: string;
	login: string;
	password: string;
	url: string;
	comment: string;
	color: PaletteColor;
};

export type Credential = Omit<CredentialInput, 'password'> & {
	id: string;
	has_password: boolean;
	order_idx: number;
	created_at: string;
	updated_at: string;
};

export type CredentialsSnapshot = {
	revision: number;
	entries: Credential[];
};

export type CredentialDetails = {
	revision: number;
	entry: Credential;
};

export type CredentialSecret = {
	revision: number;
	password: string;
};
