import { observable, runInAction } from 'mobx';
import { describe, expect, it, vi } from 'vitest';

import type { ITodoRepo } from './ports';
import { TodoStore } from './todo.store';
import type { TodoCanvas } from './types';

const flush = async () => {
	await new Promise<void>((resolve) => setTimeout(resolve, 0));
};

describe('TodoStore lifecycle', () => {
	it('aborts on destroy and ignores stale responses after StrictMode reinitialization', async () => {
		const requests: { signal: AbortSignal; resolve: (data: TodoCanvas[]) => void }[] = [];
		const load = vi.fn(
			(signal: AbortSignal) => new Promise<TodoCanvas[]>((resolve) => requests.push({ signal, resolve }))
		);
		const store = new TodoStore({ load } as unknown as ITodoRepo, { id: 'user', lastId: null });
		store.init();
		await flush();
		store.destroy();
		expect(requests[0].signal.aborted).toBe(true);
		store.init();
		await flush();
		requests[0].resolve([{ id: 'stale' } as TodoCanvas]);
		await flush();
		expect(store.canvases).toEqual([]);
		expect(store.isLoading).toBe(true);
		requests[1].resolve([{ id: 'current' } as TodoCanvas]);
		await flush();
		expect(store.canvases[0].id).toBe('current');
		expect(store.isLoading).toBe(false);
		store.destroy();
	});

	it('clears data on user changes and disposes the user subscription on destroy', async () => {
		const user = observable({ id: 'user' as string | null, lastId: null });
		const load = vi.fn().mockResolvedValue([{ id: 'owned' }]);
		const store = new TodoStore({ load } as unknown as ITodoRepo, user);
		store.init();
		await flush();
		expect(store.canvases).toHaveLength(1);
		runInAction(() => {
			user.id = 'another';
		});
		expect(store.canvases).toEqual([]);
		await flush();
		store.destroy();
		runInAction(() => {
			user.id = 'third';
		});
		expect(load).toHaveBeenCalledTimes(2);
	});
});
