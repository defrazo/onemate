import { useEffect, useState } from 'react';

import { cityStore } from '@/entities/city';
import { userStore } from '@/entities/user';
import { userProfileStore } from '@/entities/user-profile';
import { useIsMobile } from '@/shared/lib/hooks';
import { getBrowserInfo } from '@/shared/lib/utils';
import { notifyStore } from '@/shared/stores';

import { getIP } from '../api';
import { getAvailableDays } from '../lib';
import type { BrowserInfo, DraftProfile, GenderOption } from '.';

export const useProfile = () => {
	const isMobile = useIsMobile();
	const [days, setDays] = useState<string[]>([]);
	const [info, setInfo] = useState<BrowserInfo | null>(null);
	const [ip, setIp] = useState<string>('');
	const [draft, setDraft] = useState<DraftProfile>({
		avatar: userProfileStore.avatar,
		firstName: userProfileStore.firstName,
		lastName: userProfileStore.lastName,
		username: userStore.username,
		year: userProfileStore.birthYear,
		month: userProfileStore.birthMonth,
		day: userProfileStore.birthDay,
		gender: userProfileStore.gender,
		mainEmail: userStore.email,
		phone: userProfileStore.phone,
		email: userProfileStore.email,
	});

	const genderOptions: GenderOption[] = [
		{ value: 'male', label: 'Мужской' },
		{ value: 'female', label: 'Женский' },
		{ value: null, label: 'Не указывать' },
	];

	const updateDraft = <K extends keyof DraftProfile>(key: K, value: DraftProfile[K]) => {
		setDraft((prev) => ({ ...prev, [key]: value }));
	};

	const updateArrayField = (key: 'phone' | 'email', index: number, value: string) => {
		const updated = [...draft[key]];
		updated[index] = value;
		updateDraft(key, updated);
	};

	const addField = (key: 'phone' | 'email') => {
		updateDraft(key, [...draft[key], '']);
	};

	const removeField = (key: 'phone' | 'email', index: number) => {
		const updated = draft[key].filter((_, i) => i !== index);
		updateDraft(key, updated.length ? updated : ['']);
	};

	const saveChanges = () => {
		userProfileStore.updateField('avatarUrl', draft.avatar);
		userProfileStore.updateField('firstName', draft.firstName);
		userProfileStore.updateField('lastName', draft.lastName);
		userStore.updateUsername(draft.username);
		userProfileStore.updateBirthDate({ year: draft.year, month: draft.month, day: draft.day });
		userProfileStore.updateField('gender', draft.gender);
		userProfileStore.updateField('location', cityStore.cityName);
		userStore.updateEmail(draft.mainEmail);
		userProfileStore.updateField('phone', draft.phone);
		userProfileStore.updateField('email', draft.email);

		notifyStore.setSuccess('Данные успешно сохранены');
	};

	useEffect(() => {
		setDays(getAvailableDays(draft.year, draft.month));
	}, [draft.year, draft.month]);

	useEffect(() => {
		const data = getBrowserInfo();
		setInfo(data);

		getIP().then(setIp);
	}, []);

	return {
		isMobile,
		draft,
		updateDraft,
		ip,
		info,
		days,
		genderOptions,
		saveChanges,
		updateArrayField,
		addField,
		removeField,
	};
};
