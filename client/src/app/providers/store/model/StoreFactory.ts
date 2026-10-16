import { UserRepoRouting, UserStore } from '@/entities/user';
import { UserLocationRepoRouting } from '@/entities/user-location';
import { ProfileRepoRouting, UserProfileStore } from '@/entities/user-profile';
import { ActivityRepoRouting, DeviceActivityStore, DeviceProviderRouting } from '@/features/device-activity';
import { ModalStore } from '@/features/modal';
import { NotificationRepoRouting, NotificationStore } from '@/features/notifications';
import { ThemeStore } from '@/features/theme-switcher';
import { NotifyStore } from '@/features/toast';
import { AuthFormStore, AuthStore } from '@/features/user-auth';
import { CloudRepoRouting, CloudStore } from '@/widgets/cloud';
import { CurrencyStore } from '@/widgets/currency';
import { NetworkRepoRouting, NetworkStore } from '@/widgets/network';
import { NotesRepoRouting, NotesStore } from '@/widgets/notes';
import { TranslatorProviderRouting, TranslatorStore } from '@/widgets/translator';
import { WeatherStore } from '@/widgets/weather';

import type { AllStores, CoreStores } from '.';

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
		const notificationStore = new NotificationStore(userStore, new NotificationRepoRouting(userStore));
		const deviceActivityStore = new DeviceActivityStore(
			userStore,
			authStore,
			new ActivityRepoRouting(userStore),
			new DeviceProviderRouting(userStore)
		);

		// Widgets
		const networkStore = new NetworkStore(userStore, new NetworkRepoRouting(userStore));
		const cloudStore = new CloudStore(userStore, new CloudRepoRouting(userStore));
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
			notificationStore,
			deviceActivityStore,

			// Widgets
			cloudStore,
			networkStore,
			weatherStore,
			notesStore,
			currencyStore,
			translatorStore,
		};
	}
}
