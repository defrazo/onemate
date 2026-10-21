import { action, computed, makeObservable, observable } from 'mobx';

import { BaseStore } from './base.store';

export abstract class AsyncStore extends BaseStore {
	protected loading = false;

	get isLoading(): boolean {
		return this.loading;
	}

	private setLoading(value: boolean): void {
		this.loading = value;
	}

	protected async withLoading<T>(operation: () => Promise<T>): Promise<T> {
		this.setLoading(true);

		try {
			return await operation();
		} finally {
			this.setLoading(false);
		}
	}

	constructor() {
		super();

		makeObservable<this, 'loading' | 'setLoading'>(this, {
			loading: observable,
			isLoading: computed,
			setLoading: action,
		});
	}
}
