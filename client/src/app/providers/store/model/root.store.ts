import { StoreFactory } from './StoreFactory';
import { StoreInitializer } from './StoreInitializer';
import type { AllStores } from './types';

export class RootStore implements AllStores {
	public readonly modalStore: AllStores['modalStore'];
	public readonly notifyStore: AllStores['notifyStore'];
	public readonly userStore: AllStores['userStore'];

	public readonly userProfileStore: AllStores['userProfileStore'];

	public readonly authFormStore: AllStores['authFormStore'];
	public readonly authStore: AllStores['authStore'];
	public readonly deviceActivityStore: AllStores['deviceActivityStore'];
	public readonly notificationStore: AllStores['notificationStore'];
	public readonly themeStore: AllStores['themeStore'];

	public readonly calendarStore: AllStores['calendarStore'];
	public readonly credentialsStore: AllStores['credentialsStore'];
	public readonly cloudStore: AllStores['cloudStore'];
	public readonly currencyStore: AllStores['currencyStore'];
	public readonly networkStore: AllStores['networkStore'];
	public readonly notesStore: AllStores['notesStore'];
	public readonly todoStore: AllStores['todoStore'];
	public readonly translatorStore: AllStores['translatorStore'];
	public readonly weatherStore: AllStores['weatherStore'];

	private initPromise: Promise<void> | null = null;
	private isInitialized = false;
	private isDestroyed = false;

	constructor() {
		const allStores = StoreFactory.createAllStores();
		this.modalStore = allStores.modalStore;
		this.notifyStore = allStores.notifyStore;
		this.userStore = allStores.userStore;

		this.userProfileStore = allStores.userProfileStore;

		this.authFormStore = allStores.authFormStore;
		this.authStore = allStores.authStore;
		this.deviceActivityStore = allStores.deviceActivityStore;
		this.notificationStore = allStores.notificationStore;
		this.themeStore = allStores.themeStore;

		this.calendarStore = allStores.calendarStore;
		this.credentialsStore = allStores.credentialsStore;
		this.cloudStore = allStores.cloudStore;
		this.currencyStore = allStores.currencyStore;
		this.networkStore = allStores.networkStore;
		this.notesStore = allStores.notesStore;
		this.todoStore = allStores.todoStore;
		this.translatorStore = allStores.translatorStore;
		this.weatherStore = allStores.weatherStore;
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
			throw new Error(error instanceof Error ? error.message : String(error), { cause: error });
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
