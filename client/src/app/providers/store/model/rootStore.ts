import { type AllStores, StoreFactory, StoreInitializer } from '.';

export class RootStore implements AllStores {
	public readonly userStore: AllStores['userStore'];
	public readonly notifyStore: AllStores['notifyStore'];
	public readonly modalStore: AllStores['modalStore'];
	public readonly userProfileStore: AllStores['userProfileStore'];
	public readonly authStore: AllStores['authStore'];
	public readonly authFormStore: AllStores['authFormStore'];
	public readonly themeStore: AllStores['themeStore'];
	public readonly deviceActivityStore: AllStores['deviceActivityStore'];
	public readonly weatherStore: AllStores['weatherStore'];
	public readonly notesStore: AllStores['notesStore'];
	public readonly currencyStore: AllStores['currencyStore'];
	public readonly translatorStore: AllStores['translatorStore'];

	private initPromise: Promise<void> | null = null;
	private isInitialized = false;
	private isDestroyed = false;

	constructor() {
		const allStores = StoreFactory.createAllStores();

		this.userStore = allStores.userStore;
		this.notifyStore = allStores.notifyStore;
		this.modalStore = allStores.modalStore;
		this.userProfileStore = allStores.userProfileStore;
		this.authStore = allStores.authStore;
		this.authFormStore = allStores.authFormStore;
		this.themeStore = allStores.themeStore;
		this.deviceActivityStore = allStores.deviceActivityStore;
		this.weatherStore = allStores.weatherStore;
		this.notesStore = allStores.notesStore;
		this.currencyStore = allStores.currencyStore;
		this.translatorStore = allStores.translatorStore;
	}

	async init(): Promise<void> {
		if (this.isInitialized) return;
		if (this.initPromise) return this.initPromise;

		this.initPromise = this.initAllStores();

		try {
			await this.initPromise;
		} finally {
			this.initPromise = null;
		}
	}

	private async initAllStores(): Promise<void> {
		try {
			await StoreInitializer.initializeStores(this);
			this.isInitialized = true;
			this.isDestroyed = false;
		} catch (error) {
			throw new Error(
				`Произошла ошибка при инициализации приложения: ${
					error instanceof Error ? error.message : String(error)
				}`,
				{ cause: error }
			);
		}
	}

	get initialized(): boolean {
		return this.isInitialized && !this.isDestroyed;
	}

	destroy(): void {
		if (this.isDestroyed) return;

		try {
			StoreInitializer.destroyStores(this);
		} finally {
			this.isInitialized = false;
			this.initPromise = null;
			this.isDestroyed = true;
		}
	}

	async reinitialize(): Promise<void> {
		this.destroy();
		this.isDestroyed = false;
		await this.init();
	}
}

let rootStore: RootStore | null = import.meta.hot?.data.rootStore ?? null;

export const getRootStore = (): RootStore => {
	if (!rootStore) rootStore = new RootStore();

	if (import.meta.hot) import.meta.hot.data.rootStore = rootStore;

	return rootStore;
};

if (import.meta.hot) import.meta.hot.dispose((data) => (data.rootStore = rootStore));
