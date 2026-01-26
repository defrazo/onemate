import { CityRepoRouting, CityStore } from '@/entities/city';
import { UserRepoRouting, UserStore } from '@/entities/user';
import { ProfileRepoRouting, UserProfileStore } from '@/entities/user-profile';
import { ActivityRepoRouting, DeviceActivityStore, DeviceProviderRouting } from '@/features/device-activity';
import { LocationStore } from '@/features/location';
import { ThemeStore } from '@/features/theme-switcher';
import { AccountStore } from '@/features/user-account';
import { AuthFormStore, AuthStore } from '@/features/user-auth';
import { ModalStore, NotifyStore } from '@/shared/stores';
import { GenStore } from '@/widgets/generator';
import { NotesRepoRouting, NotesStore } from '@/widgets/notes';
import { TranslatorProviderRouting, TranslatorStore } from '@/widgets/translator';
import { ProfileStore } from '@/widgets/user-profile';
import { WeatherStore } from '@/widgets/weather';
import { CurrencyStore } from '@/widgets/сurrency';

import { AllStores, CoreStores } from '.';

export class StoreFactory {
	static createCore(): CoreStores {
		const notifyStore = new NotifyStore();
		const modalStore = new ModalStore();
		const userStore = new UserStore();
		const userRepo = new UserRepoRouting(userStore);
		userStore.setRepo(userRepo);

		return { notifyStore, modalStore, userStore };
	}

	static createAllStores(): AllStores {
		const { userStore, notifyStore, modalStore } = this.createCore();

		// User
		const userProfileStore = new UserProfileStore(userStore, new ProfileRepoRouting(userStore));
		const themeStore = new ThemeStore(userStore, userProfileStore);
		const profileStore = new ProfileStore(userStore, userProfileStore);

		// Auth
		const authFormStore = new AuthFormStore();
		const authStore = new AuthStore(userStore);
		const accountStore = new AccountStore(authStore, userStore, userProfileStore);

		// Location
		const cityStore = new CityStore(userStore, new CityRepoRouting(userStore));
		const locationStore = new LocationStore(userStore, cityStore);
		const deviceActivityStore = new DeviceActivityStore(
			userStore,
			authStore,
			cityStore,
			new ActivityRepoRouting(userStore),
			new DeviceProviderRouting(userStore)
		);

		// Features
		const weatherStore = new WeatherStore(userStore, cityStore);
		const notesStore = new NotesStore(userStore, new NotesRepoRouting(userStore));
		const currencyStore = new CurrencyStore(userStore);
		const translatorStore = new TranslatorStore(new TranslatorProviderRouting(userStore));
		const genStore = new GenStore();

		return {
			// Core
			userStore,
			notifyStore,
			modalStore,

			// User
			themeStore,
			userProfileStore,
			profileStore,

			// Auth
			authFormStore,
			authStore,
			accountStore,

			// Location
			cityStore,
			locationStore,
			deviceActivityStore,

			// Features
			weatherStore,
			notesStore,
			currencyStore,
			translatorStore,
			genStore,
		};
	}
}
