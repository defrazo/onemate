import type { TodoStore } from '@/entities/todo';
import type { UserStore } from '@/entities/user';
import type { UserProfileStore } from '@/entities/user-profile';
import type { AuthFormStore, AuthStore } from '@/features/auth';
import type { DeviceActivityStore } from '@/features/device-activity';
import type { ModalStore } from '@/features/modal';
import type { NotificationStore } from '@/features/notifications';
import type { ThemeStore } from '@/features/theme-switcher';
import type { NotifyStore } from '@/features/toast';
import type { CalendarStore } from '@/widgets/calendar';
import type { CloudStore } from '@/widgets/cloud';
import type { CredentialsStore } from '@/widgets/credentials';
import type { CurrencyStore } from '@/widgets/currency';
import type { NetworkStore } from '@/widgets/network';
import type { NotesStore } from '@/widgets/notes';
import type { TranslatorStore } from '@/widgets/translator';
import type { WeatherStore } from '@/widgets/weather';

export type AllStores = {
	modalStore: ModalStore;
	notifyStore: NotifyStore;
	userStore: UserStore;

	userProfileStore: UserProfileStore;

	authFormStore: AuthFormStore;
	authStore: AuthStore;
	deviceActivityStore: DeviceActivityStore;
	notificationStore: NotificationStore;
	themeStore: ThemeStore;

	calendarStore: CalendarStore;
	cloudStore: CloudStore;
	credentialsStore: CredentialsStore;
	currencyStore: CurrencyStore;
	networkStore: NetworkStore;
	notesStore: NotesStore;
	todoStore: TodoStore;
	translatorStore: TranslatorStore;
	weatherStore: WeatherStore;
};

export type InitKeys =
	| 'userProfileStore'
	| 'authStore'
	| 'deviceActivityStore'
	| 'notificationStore'
	| 'themeStore'
	| 'calendarStore'
	| 'cloudStore'
	| 'credentialsStore'
	| 'currencyStore'
	| 'networkStore'
	| 'notesStore'
	| 'todoStore'
	| 'weatherStore';

export interface CoreStores {
	readonly userStore: UserStore;
	readonly notifyStore: NotifyStore;
	readonly modalStore: ModalStore;
}
