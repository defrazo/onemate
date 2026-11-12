import axios from 'axios';

import { api } from '@/shared/api';
import { CredentialsConflictError } from '@/shared/lib/errors';

import type { ICredentialsRepo } from '../../model/ports';
import type { CredentialDetails, CredentialInput, CredentialSecret, CredentialsSnapshot } from '../../model/types';

const BASE_URL = '/user/credentials';

type RequestMethod = 'get' | 'post' | 'patch' | 'delete';

export class CredentialsRepoLaravel implements ICredentialsRepo {
	private async request<T>(method: RequestMethod, path: string, data?: unknown, signal?: AbortSignal): Promise<T> {
		try {
			const { data: response } = await api.request<T>({ method, url: BASE_URL + path, data, signal });
			return response;
		} catch (error) {
			if (axios.isCancel(error)) throw error;

			if (axios.isAxiosError(error)) {
				if (error.response?.status === 409 && error.response.data?.code === 'CREDENTIALS_REVISION_CONFLICT')
					throw new CredentialsConflictError();

				if (error.response?.status === 422)
					throw new Error('Проверьте заполнение полей и ограничение в 50 аккаунтов');
			}

			throw new Error('Что-то пошло не так');
		}
	}

	async load(signal?: AbortSignal): Promise<CredentialsSnapshot> {
		return this.request<CredentialsSnapshot>('get', '', undefined, signal);
	}

	async initialize(signal?: AbortSignal): Promise<CredentialsSnapshot> {
		return this.request<CredentialsSnapshot>('post', '/initialize', undefined, signal);
	}

	async show(id: string, signal?: AbortSignal): Promise<CredentialDetails> {
		return this.request<CredentialDetails>('get', `/${id}`, undefined, signal);
	}

	async password(id: string, signal?: AbortSignal): Promise<CredentialSecret> {
		return this.request<CredentialSecret>('get', `/${id}/password`, undefined, signal);
	}

	async create(input: CredentialInput, revision: number, signal?: AbortSignal): Promise<CredentialsSnapshot> {
		return this.request<CredentialsSnapshot>('post', '', { ...input, revision }, signal);
	}

	async update(
		id: string,
		input: Partial<CredentialInput>,
		revision: number,
		signal?: AbortSignal
	): Promise<CredentialsSnapshot> {
		return this.request<CredentialsSnapshot>('patch', `/${id}`, { ...input, revision }, signal);
	}

	async remove(id: string, revision: number, signal?: AbortSignal): Promise<CredentialsSnapshot> {
		return this.request<CredentialsSnapshot>('delete', `/${id}`, { revision }, signal);
	}

	async reorder(ids: string[], revision: number, signal?: AbortSignal): Promise<CredentialsSnapshot> {
		return this.request<CredentialsSnapshot>('patch', '/order', { ids, revision }, signal);
	}
}
