import { useEffect, useState } from 'react';

import { userStore } from '@/entities/user';
import { userProfileService } from '@/entities/user-profile';
import { useIsMobile } from '@/shared/lib/hooks';
import { getBrowserInfo } from '@/shared/lib/utils';
import { notifyStore } from '@/shared/stores';

import { getIP } from '../api';
import { getAvailableDays } from '../lib';
import type { BrowserInfo, GenderOption } from '.';
import { profileStore } from '.';

export const useProfile = () => {
	const isMobile = useIsMobile();
	const [ip, setIp] = useState('');
	const [info, setInfo] = useState<BrowserInfo | null>(null);
	const [days, setDays] = useState<string[]>([]);
	const [isInitialized, setIsInitialized] = useState(false);

	const genderOptions: GenderOption[] = [
		{ value: 'male', label: 'Мужской' },
		{ value: 'female', label: 'Женский' },
		{ value: null, label: 'Не указывать' },
	];

	useEffect(() => {
		setDays(getAvailableDays(profileStore.draft.birthYear, profileStore.draft.birthMonth));
	}, [profileStore.draft.birthYear, profileStore.draft.birthMonth]);

	useEffect(() => {
		if (!userStore.id) {
			setIsInitialized(true);
			return;
		}

		userProfileService
			.loadProfile()
			.then(() => profileStore.loadFromProfile())
			.catch((err) => {
				console.error('Ошибка загрузки профиля:', err);
				notifyStore.setError(err.message || 'Не удалось загрузить профиль');
			})
			.finally(() => setIsInitialized(true));
	}, [userStore.id]);

	useEffect(() => {
		setInfo(getBrowserInfo());
		getIP().then(setIp);
	}, []);

	return { isMobile, isInitialized, ip, info, days, genderOptions };
};
