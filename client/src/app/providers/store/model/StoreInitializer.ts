import type { AllStores, InitKeys } from '.';

type LifecycleStore = {
	init?: () => void;
	destroy?: () => void;
};

export class StoreInitializer {
	private static readonly REACTIVE_STORES: ReadonlyArray<InitKeys> = [
		'themeStore',
		'userProfileStore',
		'profileStore',
		'accountStore',
		'cityStore',
		'locationStore',
		'deviceActivityStore',
		'notesStore',
		'weatherStore',
		'currencyStore',
	] as const;

	static async initializeStores(stores: AllStores): Promise<void> {
		stores.userStore.init();

		for (const name of this.REACTIVE_STORES) {
			const store = stores[name] as LifecycleStore;
			store.init?.();
		}

		await stores.authStore.init();
	}

	static destroyStores(stores: AllStores): void {
		stores.authStore.destroy?.();

		for (const name of [...this.REACTIVE_STORES].reverse()) {
			const store = stores[name] as LifecycleStore;
			store.destroy?.();
		}

		stores.userStore.destroy?.();
	}
}
