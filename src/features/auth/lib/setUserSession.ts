import { User, userStore } from '@/entities/user';
import { checkUserProfile, userProfileStore } from '@/entities/userProfile';
import { storage } from '@/shared/lib/storage/localStorage';

export function setUserSession(user: User) {
	const userProfile = checkUserProfile(user);

	userStore.setUser(user);
	userProfileStore.setProfile(userProfile);

	storage.set('user', user);
	storage.set('userProfile', userProfile);
	storage.set('isAuth', true);
}
