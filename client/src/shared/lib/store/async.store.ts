import { action, computed, makeObservable, observable } from 'mobx';

import { BaseStore } from './base.store';

export abstract class AsyncStore extends BaseStore {
	private activeOperations = 0;
	private latestOperationId = 0;

	protected loading = false;
	error: Error | null = null;

	get isLoading(): boolean {
		return this.loading;
	}

	private setLoading(value: boolean): void {
		this.loading = value;
	}

	protected setError(error: Error | null): void {
		this.error = error;
	}

	protected async withLoading<T>(operation: () => Promise<T>): Promise<T> {
		const operationId = ++this.latestOperationId;
		this.activeOperations++;

		this.setLoading(true);
		this.setError(null);

		try {
			return await operation();
		} catch (error) {
			if (operationId === this.latestOperationId)
				this.setError(error instanceof Error ? error : new Error(String(error)));

			throw error;
		} finally {
			this.activeOperations--;
			this.setLoading(this.activeOperations > 0);
		}
	}

	constructor() {
		super();

		makeObservable<this, 'loading' | 'setLoading' | 'setError'>(this, {
			loading: observable,
			error: observable,
			isLoading: computed,
			setLoading: action,
			setError: action,
		});
	}
}
