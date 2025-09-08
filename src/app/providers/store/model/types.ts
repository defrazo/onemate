import type { CityStore } from '@/entities/city';
import type { UserStore } from '@/entities/user';
import type { UserProfileStore } from '@/entities/user-profile';
import type { DeviceActivityStore } from '@/features/device-activity';
import type { LocationStore } from '@/features/location';
import type { ThemeStore } from '@/features/theme-switcher';
import type { AccountStore } from '@/features/user-account';
import type { AuthFormStore, AuthStore } from '@/features/user-auth';
import type { ModalStore, NotifyStore } from '@/shared/stores';
import type { GenStore } from '@/widgets/generator';
import type { NotesStore } from '@/widgets/notes';
import type { TranslatorStore } from '@/widgets/translator';
import type { ProfileStore } from '@/widgets/user-profile';
import type { WeatherStore } from '@/widgets/weather';
import type { CurrencyStore } from '@/widgets/сurrency';

export type AllStores = {
	notifyStore: NotifyStore;
	modalStore: ModalStore;
	userStore: UserStore;

	userProfileStore: UserProfileStore;
	themeStore: ThemeStore;
	profileStore: ProfileStore;

	authFormStore: AuthFormStore;
	authStore: AuthStore;
	accountStore: AccountStore;

	cityStore: CityStore;
	locationStore: LocationStore;
	deviceActivityStore: DeviceActivityStore;

	notesStore: NotesStore;
	currencyStore: CurrencyStore;
	weatherStore: WeatherStore;
	translatorStore: TranslatorStore;
	genStore: GenStore;
};

export type InitKeys =
	| 'themeStore'
	| 'userProfileStore'
	| 'profileStore'
	| 'authStore'
	| 'accountStore'
	| 'cityStore'
	| 'locationStore'
	| 'deviceActivityStore'
	| 'notesStore'
	| 'weatherStore'
	| 'currencyStore';

export interface CoreStores {
	readonly userStore: UserStore;
	readonly notifyStore: NotifyStore;
	readonly modalStore: ModalStore;
}
