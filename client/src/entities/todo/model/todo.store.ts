import { action, computed, makeObservable, observable, reaction, runInAction } from 'mobx';

import type { IBaseUserPort } from '@/entities/user';
import { BaseStore } from '@/shared/lib/store';

import { todoCache, todoChannel } from '../lib';
import type { ItemChanges, ITodoRepo, ListChanges, TodoCanvas, TodoList } from '.';

export class TodoStore extends BaseStore {
	private readonly controllers = new Set<AbortController>();
	private queue: Promise<void> = Promise.resolve();
	private pending = 0;
	private generation = 0;

	selectedCanvasId: string | null = null;
	selectedListId: string | null = null;
	canvases: TodoCanvas[] = [];
	isReady = false;

	get isLoading(): boolean {
		return this.pending > 0;
	}

	get isSyncing(): boolean {
		return this.isLoading;
	}

	get activeCanvas(): TodoCanvas | undefined {
		return (
			this.canvases.find(({ id }) => id === this.selectedCanvasId) ??
			this.canvases.find(({ title }) => title === 'Общее') ??
			this.canvases[0]
		);
	}

	get activeList(): TodoList | undefined {
		const lists = this.canvases.flatMap((canvas) => canvas.lists);
		return lists.find(({ id }) => id === this.selectedListId) ?? lists[0];
	}

	ensureLoaded(): Promise<void> {
		if (this.isReady || this.isLoading) return Promise.resolve();
		return this.reload();
	}

	setSelectedCanvas(id: string): void {
		const userId = this.userStore.id;
		if (!userId || !this.canvases.some((canvas) => canvas.id === id)) return;

		this.selectedCanvasId = id;
		todoCache.writeSelectedCanvasId(userId, id);
	}

	setSelectedList(id: string): void {
		const userId = this.userStore.id;
		if (!userId) return;

		const exists = this.canvases.some((canvas) => canvas.lists.some((list) => list.id === id));
		if (!exists) return;

		this.selectedListId = id;
		todoCache.writeSelectedListId(userId, id);
	}

	async reload(): Promise<void> {
		await this.execute((signal) => this.repo.load(signal));
	}

	async createCanvas(title: string): Promise<boolean> {
		return this.execute((signal) => this.repo.createCanvas(title, signal), true);
	}

	async renameCanvas(id: string, title: string): Promise<boolean> {
		return this.execute((signal) => this.repo.renameCanvas(id, title, signal), true);
	}

	async deleteCanvas(id: string): Promise<boolean> {
		return this.execute((signal) => this.repo.deleteCanvas(id, signal), true);
	}

	async createList(canvasId: string, title: string, color = 'slate'): Promise<boolean> {
		return this.execute((signal) => this.repo.createList(canvasId, title, color, signal), true);
	}

	async updateList(id: string, changes: ListChanges): Promise<boolean> {
		return this.execute((signal) => this.repo.updateList(id, changes, signal), true);
	}

	async setListCollapsed(id: string, isHide: boolean): Promise<boolean> {
		return this.updateList(id, { is_collapsed: isHide });
	}

	async deleteList(id: string): Promise<boolean> {
		return this.execute((signal) => this.repo.deleteList(id, signal), true);
	}

	async moveList(id: string, slot: number): Promise<boolean> {
		return this.execute((signal) => this.repo.moveList(id, slot, signal), true);
	}

	async createItem(listId: string, text: string): Promise<boolean> {
		return this.execute((signal) => this.repo.createItem(listId, text, signal), true);
	}

	async updateItem(id: string, changes: ItemChanges): Promise<boolean> {
		return this.execute((signal) => this.repo.updateItem(id, changes, signal), true);
	}

	async setItemCompleted(id: string, isCompleted: boolean): Promise<boolean> {
		return this.updateItem(id, { is_completed: isCompleted });
	}

	async deleteItem(id: string): Promise<boolean> {
		return this.execute((signal) => this.repo.deleteItem(id, signal), true);
	}

	async reorderItems(listId: string, itemIds: string[]): Promise<boolean> {
		return this.execute((signal) => this.repo.reorderItems(listId, itemIds, signal), true);
	}

	async moveItem(id: string, listId: string, position: number): Promise<boolean> {
		return this.execute((signal) => this.repo.moveItem(id, listId, position, signal), true);
	}

	private async execute(
		operation: (signal: AbortSignal) => Promise<TodoCanvas[]>,
		broadcast = false
	): Promise<boolean> {
		if (!this.inited || !this.userStore.id) return false;

		const generation = this.generation;

		runInAction(() => this.pending++);

		const task = this.queue.then(async (): Promise<boolean> => {
			if (generation !== this.generation) return false;

			const controller = new AbortController();
			this.controllers.add(controller);

			try {
				const canvases = await operation(controller.signal);

				if (generation !== this.generation || controller.signal.aborted) return false;

				runInAction(() => {
					this.canvases = canvases;
					this.isReady = true;
				});

				if (broadcast) this.broadcast();

				return true;
			} catch {
				return false;
			} finally {
				this.controllers.delete(controller);
			}
		});

		this.queue = task.then(() => undefined);

		return task.finally(() => {
			if (generation === this.generation) runInAction(() => this.pending--);
		});
	}

	private broadcast(): void {
		todoChannel.postMessage({ type: 'updated', userId: this.userStore.id });
	}

	private handleBroadcast = (event: MessageEvent<{ type: string; userId: string }>): void => {
		if (event.data?.type !== 'updated') return;
		if (!this.userStore.id || event.data.userId !== this.userStore.id) return;
		if (!this.isReady) return;

		void this.reload();
	};

	constructor(
		private readonly userStore: IBaseUserPort,
		private readonly repo: ITodoRepo
	) {
		super();

		makeObservable<this, 'pending' | 'reset'>(this, {
			selectedCanvasId: observable,
			selectedListId: observable,
			canvases: observable,
			isReady: observable,
			pending: observable,

			isLoading: computed,
			isSyncing: computed,
			activeCanvas: computed,
			activeList: computed,

			setSelectedCanvas: action,
			setSelectedList: action,
			reset: action,
		});
	}

	init(): void {
		if (this.inited) return;
		this.inited = true;

		todoChannel.addEventListener('message', this.handleBroadcast);

		this.track(
			reaction(
				() => this.userStore.id,
				(userId) => {
					this.reset();
					if (!userId) return;

					const selectedCanvasId = todoCache.readSelectedCanvasId(userId);
					const selectedListId = todoCache.readSelectedListId(userId);

					runInAction(() => {
						this.selectedCanvasId = selectedCanvasId;
						this.selectedListId = selectedListId;
					});
				},
				{ fireImmediately: true }
			)
		);
	}

	protected reset(): void {
		this.selectedCanvasId = null;
		this.selectedListId = null;
		this.generation++;

		this.controllers.forEach((controller) => controller.abort());
		this.controllers.clear();

		this.queue = Promise.resolve();
		this.pending = 0;
		this.canvases = [];
		this.isReady = false;
	}

	destroy(): void {
		todoChannel.removeEventListener('message', this.handleBroadcast);

		super.destroy();
		this.reset();
	}
}
