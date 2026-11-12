import { createElement } from 'react';

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
import { ConfirmDialog } from '@/shared/ui';
import { CalendarStore } from '@/widgets/calendar';
import { CloudRepoRouting, CloudStore } from '@/widgets/cloud';
import { CredentialsRepoRouting, CredentialsStore } from '@/widgets/credentials';
import { CurrencyStore } from '@/widgets/currency';
import { NetworkRepoRouting, NetworkStore } from '@/widgets/network';
import { NotesRepoRouting, NotesStore } from '@/widgets/notes';
import { TranslatorProviderRouting, TranslatorStore } from '@/widgets/translator';
import { WeatherStore } from '@/widgets/weather';

import type { AllStores, CoreStores } from './types';

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
		const calendarStore = new CalendarStore();
		const credentialsStore = new CredentialsStore(userStore, new CredentialsRepoRouting(userStore));
		const networkStore = new NetworkStore(userStore, new NetworkRepoRouting(userStore));
		const cloudStore = new CloudStore(userStore, new CloudRepoRouting(userStore));
		const weatherStore = new WeatherStore(userStore, new UserLocationRepoRouting(userStore, 'weather'));
		const notesStore = new NotesStore(userStore, new NotesRepoRouting(userStore), undefined, () => {
			authStore.endSession();
			notifyStore.setNotice(
				'Сессия завершена. Несохранённые заметки сохранены локально для повторного входа.',
				'warning'
			);
		});

		authStore.setLogoutGuard(
			async (userId) => {
				if (notesStore.hasUnsavedNotes()) {
					try {
						await notesStore.flushForLogout();
					} catch {
						if (userStore.id !== userId) return false;

						const discard = await new Promise<boolean>((resolve) => {
							const finish = (value: boolean) => {
								modalStore.closeModal();
								resolve(value);
							};

							modalStore.setModal(
								createElement(ConfirmDialog, {
									title: 'Есть несохранённые заметки',
									description: 'Не удалось сохранить изменения. При выходе они будут потеряны.',
									confirmLabel: 'Выйти без сохранения',
									cancelLabel: 'Остаться',
									variant: 'danger',
									onConfirm: () => finish(userStore.id === userId),
									onCancel: () => finish(false),
								}),
								'auto',
								{ onClose: () => resolve(false) }
							);
						});

						return discard ? 'discard' : false;
					}
				}

				if (userStore.id !== userId) return false;

				return 'saved';
			},
			(userId) => notesStore.discardForLogout(userId)
		);

		const todoStore = new TodoStore(userStore, new TodoRepoRouting(userStore));
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
			calendarStore,
			credentialsStore,
			cloudStore,
			networkStore,
			weatherStore,
			notesStore,
			todoStore,
			currencyStore,
			translatorStore,
		};
	}
}
