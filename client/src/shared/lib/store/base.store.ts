export abstract class BaseStore {
	protected readonly disposers = new Set<() => void>();
	protected inited = false;

	abstract init(): void | Promise<void>;
	protected abstract reset(): void;

	destroy(): void {
		this.disposeAll();
		this.inited = false;
	}

	async restart(): Promise<void> {
		this.destroy();
		await this.init();
	}

	protected track(disposer?: (() => void) | void): void {
		if (disposer) this.disposers.add(disposer);
	}

	private disposeAll(): void {
		this.disposers.forEach((dispose) => dispose());
		this.disposers.clear();
	}
}
