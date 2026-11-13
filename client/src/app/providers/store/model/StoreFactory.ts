import { TodoRepoRouting, TodoStore } from '@/entities/todo';
import { UserRepoRouting, UserStore } from '@/entities/user';
import { UserLocationRepoRouting } from '@/entities/user-location';
import { ProfileRepoRouting, UserProfileStore } from '@/entities/user-profile';
import { AuthFormStore, AuthStore } from '@/features/auth';
import { ActivityRepoRouting, DeviceActivityStore, DeviceProviderRouting } from '@/features/device-activity';
import { ModalStore } from '@/features/modal';
import { NotificationRepoRouting, NotificationStore } from '@/features/notifications';
import { ThemeStore } from '@/features/theme-switcher';
import { NotifyStore } from '@/features/toast';
import { CalendarStore } from '@/widgets/calendar';
import { CloudRepoRouting, CloudStore } from '@/widgets/cloud';
import { CredentialsRepoRouting, CredentialsStore } from '@/widgets/credentials';
import { CurrencyStore } from '@/widgets/currency';
import { NetworkRepoRouting, NetworkStore } from '@/widgets/network';
import { TranslatorProviderRouting, TranslatorStore } from '@/widgets/translator';
import { WeatherStore } from '@/widgets/weather';

import { createNotesStore } from './createNotesStore';
import type { AllStores, CoreStores } from './types';

export class StoreFactory {
	static createCore(): CoreStores {
		const modalStore = new ModalStore();
		const notifyStore = new NotifyStore();
		const userStore = new UserStore();

		const userRepo = new UserRepoRouting(userStore);
		userStore.setRepo(userRepo);

		return { modalStore, notifyStore, userStore };
	}

	static createAllStores(): AllStores {
		const { modalStore, notifyStore, userStore } = this.createCore();

		// Entities
		const userProfileStore = new UserProfileStore(
			userStore,
			new ProfileRepoRouting(userStore),
			new UserLocationRepoRouting(userStore, 'profile')
		);

		// Features
		const authFormStore = new AuthFormStore();
		const authStore = new AuthStore(userStore);
		const deviceActivityStore = new DeviceActivityStore(
			userStore,
			authStore,
			new ActivityRepoRouting(userStore),
			new DeviceProviderRouting(userStore)
		);
		const notificationStore = new NotificationStore(userStore, new NotificationRepoRouting(userStore));
		const themeStore = new ThemeStore(userStore, userProfileStore);

		// Widgets
		const calendarStore = new CalendarStore();
		const cloudStore = new CloudStore(userStore, new CloudRepoRouting(userStore));
		const credentialsStore = new CredentialsStore(userStore, new CredentialsRepoRouting(userStore));
		const currencyStore = new CurrencyStore(userStore);
		const networkStore = new NetworkStore(userStore, new NetworkRepoRouting(userStore));
		const notesStore = createNotesStore({ userStore, authStore, modalStore, notifyStore });
		const todoStore = new TodoStore(userStore, new TodoRepoRouting(userStore));
		const translatorStore = new TranslatorStore(new TranslatorProviderRouting(userStore));
		const weatherStore = new WeatherStore(userStore, new UserLocationRepoRouting(userStore, 'weather'));

		return {
			// Core
			modalStore,
			notifyStore,
			userStore,

			// Entities
			userProfileStore,

			// Features
			authFormStore,
			authStore,
			deviceActivityStore,
			notificationStore,
			themeStore,

			// Widgets
			calendarStore,
			cloudStore,
			credentialsStore,
			currencyStore,
			networkStore,
			notesStore,
			todoStore,
			translatorStore,
			weatherStore,
		};
	}
}
