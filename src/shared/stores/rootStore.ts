import { cityStore } from '@/entities/city';
import { userStore } from '@/entities/user';
import { userProfileStore } from '@/entities/user-profile';
import { authStore } from '@/features/user-auth';
import { notesStore } from '@/widgets/notes';
import { profileStore } from '@/widgets/user-profile';
import { currencyStore } from '@/widgets/сurrency';

export const rootStore = {
	async init() {
		await userStore.init();
		await userProfileStore.init();
		await authStore.init();
		await cityStore.init();
		profileStore.init();
		await notesStore.init();
		await currencyStore.init();
	},
};
