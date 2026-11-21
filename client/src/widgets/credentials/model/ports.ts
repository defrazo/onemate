import type { CredentialDetails, CredentialInput, CredentialSecret, CredentialsSnapshot } from './types';

export interface ICredentialsRepo {
	load(signal?: AbortSignal): Promise<CredentialsSnapshot>;
	initialize(signal?: AbortSignal): Promise<CredentialsSnapshot>;
	show(id: string, signal?: AbortSignal): Promise<CredentialDetails>;
	password(id: string, signal?: AbortSignal): Promise<CredentialSecret>;
	create(input: CredentialInput, revision: number, signal?: AbortSignal): Promise<CredentialsSnapshot>;
	update(
		id: string,
		input: Partial<CredentialInput>,
		revision: number,
		signal?: AbortSignal
	): Promise<CredentialsSnapshot>;
	remove(id: string, revision: number, signal?: AbortSignal): Promise<CredentialsSnapshot>;
	reorder(ids: string[], revision: number, signal?: AbortSignal): Promise<CredentialsSnapshot>;
}
