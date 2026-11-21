import type { CredentialInput } from './types';

export const emptyCredential = (): CredentialInput => ({
	service: '',
	login: '',
	password: '',
	url: '',
	comment: '',
	color: 'sky',
});

export const exampleCredential = (): CredentialInput => ({
	...emptyCredential(),
	service: 'Пример аккаунта',
	login: 'demo@example.com',
	password: 'demo-password',
	comment: 'Это пример записи. Измени или удали её',
});
