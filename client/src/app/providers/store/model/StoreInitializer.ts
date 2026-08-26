import type { AllStores, InitKeys } from '.';

export class StoreInitializer {
	private static readonly INIT_ORDER: ReadonlyArray<InitKeys> = [
		'themeStore',
		'userProfileStore',
		'profileStore',
		'authStore',
		'accountStore',
		'cityStore',
		'locationStore',
		'deviceActivityStore',
		'notesStore',
		'weatherStore',
		'currencyStore',
	] as const;

	static async initializeStores(stores: AllStores): Promise<void> {
		for (const name of this.INIT_ORDER) {
			const store: any = (stores as any)[name];

			if (store?.init) {
				try {
					await store.init();
				} catch (error: any) {
					console.warn(`Ошибка инициализации ${name}:`, error);
				}
			}
		}

		try {
			await stores.userStore.init();
		} catch (error: any) {
			throw new Error('Ошибка инициализации userStore:', error.message);
		}
	}

	static destroyStores(stores: AllStores): void {
		for (const name of [...this.INIT_ORDER].reverse()) {
			const store: any = (stores as any)[name];
			if (store?.destroy) {
				try {
					store.destroy();
				} catch (e) {
					console.warn(`Ошибка destroy ${name}:`, e);
				}
			}
		}

		try {
			(stores as any).userStore?.destroy?.();
		} catch (e) {
			console.warn('Ошибка destroy userStore:', e);
		}
	}
}
