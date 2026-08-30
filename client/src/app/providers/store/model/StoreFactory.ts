import { UserRepoRouting, UserStore } from '@/entities/user';
import { UserLocationRepoRouting } from '@/entities/user-location';
import { ProfileRepoRouting, UserProfileStore } from '@/entities/user-profile';
import { ActivityRepoRouting, DeviceActivityStore, DeviceProviderRouting } from '@/features/device-activity';
import { ThemeStore } from '@/features/theme-switcher';
import { AuthFormStore, AuthStore } from '@/features/user-auth';
import { ModalStore, NotifyStore } from '@/shared/stores';
import { NotesRepoRouting, NotesStore } from '@/widgets/notes';
import { TranslatorProviderRouting, TranslatorStore } from '@/widgets/translator';
import { WeatherStore } from '@/widgets/weather';
import { CurrencyStore } from '@/widgets/сurrency';

import { AllStores, CoreStores } from '.';

export class StoreFactory {
	static createCore(): CoreStores {
		const userStore = new UserStore();
		const userRepo = new UserRepoRouting(userStore);
		userStore.setRepo(userRepo);

		const notifyStore = new NotifyStore();
		const modalStore = new ModalStore();

		return { userStore, notifyStore, modalStore };
	}

	static createAllStores(): AllStores {
		const { userStore, notifyStore, modalStore } = this.createCore();

		// Entities
		const userProfileStore = new UserProfileStore(
			userStore,
			new ProfileRepoRouting(userStore),
			new UserLocationRepoRouting(userStore, 'profile')
		);

		// Features
		const authStore = new AuthStore(userStore);
		const authFormStore = new AuthFormStore();
		const themeStore = new ThemeStore(userStore, userProfileStore);
		const deviceActivityStore = new DeviceActivityStore(
			userStore,
			authStore,
			new ActivityRepoRouting(userStore),
			new DeviceProviderRouting(userStore)
		);

		// Widgets
		const weatherStore = new WeatherStore(userStore, new UserLocationRepoRouting(userStore, 'weather'));
		const notesStore = new NotesStore(userStore, new NotesRepoRouting(userStore));
		const currencyStore = new CurrencyStore(userStore);
		const translatorStore = new TranslatorStore(new TranslatorProviderRouting(userStore));

		return {
			// Core
			userStore,
			notifyStore,
			modalStore,

			// Entities
			userProfileStore,

			// Features
			authStore,
			authFormStore,
			themeStore,
			deviceActivityStore,

			// Widgets
			weatherStore,
			notesStore,
			currencyStore,
			translatorStore,
		};
	}
}
