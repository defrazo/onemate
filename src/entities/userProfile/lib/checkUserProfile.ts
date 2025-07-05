import type { User } from '@/entities/user';
import { storage } from '@/shared/lib/storage/localStorage';

import type { UserProfile } from '../model';

export const checkUserProfile = (user: User): UserProfile => {
	const userProfiles: UserProfile[] = storage.get('userProfiles') || [];

	let userProfile = userProfiles.find((userProfile) => userProfile.userId === user.id);

	if (!userProfile) {
		userProfile = {
			userId: user.id,
			firstName: '',
			lastName: '',
			birthDate: { year: '', month: '', day: '' },
			gender: null,
			location: '',
			phone: [''],
			email: [''],
		};

		userProfiles.push(userProfile);
		storage.set('userProfiles', userProfiles);

		return userProfile;
	}

	return userProfile;
};
