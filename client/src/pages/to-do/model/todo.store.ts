import { action, computed, makeObservable, observable, reaction, runInAction } from 'mobx';

import type { IBaseUserPort } from '@/entities/user';
import { BaseStore } from '@/shared/lib/store';

import type { ItemChanges, ITodoRepo, ListChanges, TodoCanvas } from '.';

export class TodoStore extends BaseStore {
	canvases: TodoCanvas[] = [];
	error: string | null = null;
	private pending = 0;
	private generation = 0;
	private queue: Promise<void> = Promise.resolve();
	private readonly controllers = new Set<AbortController>();

	get isLoading() {
		return this.pending > 0;
	}

	constructor(
		private readonly repo: ITodoRepo,
		private readonly userStore: IBaseUserPort
	) {
		super();
		makeObservable<this, 'pending' | 'reset'>(this, {
			canvases: observable,
			error: observable,
			pending: observable,
			isLoading: computed,
			reset: action,
		});
	}

	init(): void {
		if (this.inited) return;
		this.inited = true;
		this.track(
			reaction(
				() => this.userStore.id,
				(id) => {
					this.reset();
					if (id) void this.reload();
				},
				{ fireImmediately: true }
			)
		);
	}

	protected reset(): void {
		this.generation++;
		this.controllers.forEach((controller) => controller.abort());
		this.controllers.clear();
		this.queue = Promise.resolve();
		this.pending = 0;
		this.canvases = [];
		this.error = null;
	}

	destroy(): void {
		super.destroy();
		this.reset();
	}

	// Serialize operations because every response contains the complete current snapshot.
	private execute(operation: (signal: AbortSignal) => Promise<TodoCanvas[]>): Promise<void> {
		if (!this.inited || !this.userStore.id) return Promise.resolve();
		const generation = this.generation;
		runInAction(() => {
			this.pending++;
		});
		const task = this.queue.then(async () => {
			if (generation !== this.generation) return;
			const controller = new AbortController();
			this.controllers.add(controller);
			runInAction(() => {
				this.error = null;
			});
			try {
				const canvases = await operation(controller.signal);
				if (generation === this.generation)
					runInAction(() => {
						this.canvases = canvases;
					});
			} catch (error) {
				if (generation === this.generation && !controller.signal.aborted) {
					runInAction(() => {
						this.error = error instanceof Error ? error.message : 'Не удалось выполнить операцию ToDo';
					});
				}
			} finally {
				this.controllers.delete(controller);
				if (generation === this.generation)
					runInAction(() => {
						this.pending--;
					});
			}
		});
		this.queue = task;
		return task;
	}

	reload = () => this.execute((signal) => this.repo.load(signal));
	createCanvas = (title: string) => this.execute((signal) => this.repo.createCanvas(title, signal));
	renameCanvas = (id: string, title: string) => this.execute((signal) => this.repo.renameCanvas(id, title, signal));
	deleteCanvas = (id: string) => this.execute((signal) => this.repo.deleteCanvas(id, signal));
	createList = (canvasId: string, title: string, color = 'slate') =>
		this.execute((signal) => this.repo.createList(canvasId, title, color, signal));
	updateList = (id: string, changes: ListChanges) =>
		this.execute((signal) => this.repo.updateList(id, changes, signal));
	setListCollapsed = (id: string, isCollapsed: boolean) => this.updateList(id, { is_collapsed: isCollapsed });
	deleteList = (id: string) => this.execute((signal) => this.repo.deleteList(id, signal));
	moveList = (id: string, slot: number) => this.execute((signal) => this.repo.moveList(id, slot, signal));
	createItem = (listId: string, text: string) => this.execute((signal) => this.repo.createItem(listId, text, signal));
	updateItem = (id: string, changes: ItemChanges) =>
		this.execute((signal) => this.repo.updateItem(id, changes, signal));
	setItemCompleted = (id: string, isCompleted: boolean) => this.updateItem(id, { is_completed: isCompleted });
	deleteItem = (id: string) => this.execute((signal) => this.repo.deleteItem(id, signal));
	reorderItems = (listId: string, itemIds: string[]) =>
		this.execute((signal) => this.repo.reorderItems(listId, itemIds, signal));
	moveItem = (id: string, listId: string, position: number) =>
		this.execute((signal) => this.repo.moveItem(id, listId, position, signal));
}
