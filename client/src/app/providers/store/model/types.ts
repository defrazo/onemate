import type { UserStore } from '@/entities/user';
import type { UserProfileStore } from '@/entities/user-profile';
import type { DeviceActivityStore } from '@/features/device-activity';
import type { ThemeStore } from '@/features/theme-switcher';
import type { AuthFormStore, AuthStore } from '@/features/user-auth';
import type { ModalStore, NotifyStore } from '@/shared/stores';
import type { NotesStore } from '@/widgets/notes';
import type { TranslatorStore } from '@/widgets/translator';
import type { WeatherStore } from '@/widgets/weather';
import type { CurrencyStore } from '@/widgets/сurrency';

export type AllStores = {
	notifyStore: NotifyStore;
	modalStore: ModalStore;
	userStore: UserStore;

	userProfileStore: UserProfileStore;
	themeStore: ThemeStore;

	authFormStore: AuthFormStore;
	authStore: AuthStore;

	deviceActivityStore: DeviceActivityStore;

	notesStore: NotesStore;
	currencyStore: CurrencyStore;
	weatherStore: WeatherStore;
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
