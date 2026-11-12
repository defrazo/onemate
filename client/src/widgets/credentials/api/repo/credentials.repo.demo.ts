import { CredentialsConflictError } from '@/shared/lib/errors';

import { CREDENTIAL_LIMIT } from '../../model/constants';
import { exampleCredential } from '../../model/defaults';
import type { ICredentialsRepo } from '../../model/ports';
import type {
	Credential,
	CredentialDetails,
	CredentialInput,
	CredentialSecret,
	CredentialsSnapshot,
} from '../../model/types';

type DemoCredential = Credential & { password: string };

export class CredentialsRepoDemo implements ICredentialsRepo {
	private revision = 0;
	private entries: DemoCredential[] = [];

	reset(): void {
		this.entries = [];
		this.revision = 0;
	}

	private snapshot(): CredentialsSnapshot {
		return {
			revision: this.revision,
			entries: this.entries.map(({ password, ...entry }) => ({ ...entry, has_password: password !== '' })),
		};
	}

	private check(revision: number): void {
		if (revision !== this.revision) throw new CredentialsConflictError();
	}

	private find(id: string): DemoCredential {
		const entry = this.entries.find((item) => item.id === id);
		if (!entry) throw new Error('Аккаунт недоступен');

		return entry;
	}

	async load(): Promise<CredentialsSnapshot> {
		return this.snapshot();
	}

	async initialize(): Promise<CredentialsSnapshot> {
		if (this.revision === 0) return this.create(exampleCredential(), 0);
		return this.snapshot();
	}

	async show(id: string): Promise<CredentialDetails> {
		const entry = this.snapshot().entries.find((item) => item.id === id);
		if (!entry) throw new Error('Аккаунт недоступен');

		return { revision: this.revision, entry };
	}

	async password(id: string): Promise<CredentialSecret> {
		return { revision: this.revision, password: this.find(id).password };
	}

	async create(input: CredentialInput, revision: number): Promise<CredentialsSnapshot> {
		this.check(revision);

		if (this.entries.length >= CREDENTIAL_LIMIT)
			throw new Error(`Можно сохранить не больше ${CREDENTIAL_LIMIT} аккаунтов`);

		if (!input.service.trim()) throw new Error('Укажите название сервиса');

		const now = new Date().toISOString();

		this.entries.push({
			...input,
			service: input.service.trim(),
			id: crypto.randomUUID(),
			has_password: !!input.password,
			order_idx: this.entries.length,
			created_at: now,
			updated_at: now,
		});

		this.revision++;

		return this.snapshot();
	}

	async update(id: string, input: Partial<CredentialInput>, revision: number): Promise<CredentialsSnapshot> {
		this.check(revision);

		const entry = this.find(id);

		Object.assign(entry, input, {
			has_password: input.password === undefined ? entry.has_password : !!input.password,
			updated_at: new Date().toISOString(),
		});

		this.revision++;

		return this.snapshot();
	}

	async remove(id: string, revision: number): Promise<CredentialsSnapshot> {
		this.check(revision);
		this.find(id);

		this.entries = this.entries
			.filter((entry) => entry.id !== id)
			.map((entry, index) => ({ ...entry, order_idx: index }));

		this.revision++;

		return this.snapshot();
	}

	async reorder(ids: string[], revision: number): Promise<CredentialsSnapshot> {
		this.check(revision);

		if (ids.length !== this.entries.length || new Set(ids).size !== ids.length)
			throw new Error('Некорректный порядок');

		this.entries = ids.map((id, order_idx) => ({ ...this.find(id), order_idx }));

		this.revision++;

		return this.snapshot();
	}
}
