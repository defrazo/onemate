import type { UserStore } from '@/entities/user';
import type { UserProfileStore } from '@/entities/user-profile';
import type { DeviceActivityStore } from '@/features/device-activity';
import type { ModalStore } from '@/features/modal';
import type { NotifyStore } from '@/features/notification';
import type { ThemeStore } from '@/features/theme-switcher';
import type { AuthFormStore, AuthStore } from '@/features/user-auth';
import type { CurrencyStore } from '@/widgets/currency';
import type { NotesStore } from '@/widgets/notes';
import type { TranslatorStore } from '@/widgets/translator';
import type { WeatherStore } from '@/widgets/weather';

export type AllStores = {
	userStore: UserStore;
	notifyStore: NotifyStore;
	modalStore: ModalStore;
	userProfileStore: UserProfileStore;
	authStore: AuthStore;
	authFormStore: AuthFormStore;
	themeStore: ThemeStore;
	deviceActivityStore: DeviceActivityStore;
	weatherStore: WeatherStore;
	notesStore: NotesStore;
	currencyStore: CurrencyStore;
	translatorStore: TranslatorStore;
};

export type InitKeys =
	| 'themeStore'
	| 'userProfileStore'
	| 'authStore'
	| 'deviceActivityStore'
	| 'notesStore'
	| 'weatherStore'
	| 'currencyStore';

export interface CoreStores {
	readonly userStore: UserStore;
	readonly notifyStore: NotifyStore;
	readonly modalStore: ModalStore;
}
