import { cityStore } from '@/entities/city';
import { userStore } from '@/entities/user';
import { userProfileStore } from '@/entities/user-profile';
import { authStore } from '@/features/user-auth';
import { notesStore } from '@/widgets/notes';
import { profileStore } from '@/widgets/user-profile';

import { notifyStore } from './notifyStore';
import { uiStore } from './uiStore';

export const rootStore = {
	uiStore,
	notifyStore,
	userStore,
	userProfileStore,
	authStore,
	profileStore,

	async init() {
		if (userStore.init) await userStore.init();
		if (userProfileStore.init) await userProfileStore.init();
		if (authStore.init) await authStore.init();
		if (cityStore.init) await cityStore.init();
		if (profileStore.init) profileStore.init();
		if (notesStore.init) await notesStore.init();
	},
};
