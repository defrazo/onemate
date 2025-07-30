import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

import { userStore } from '@/entities/user';
import { deviceActivityStore } from '@/features/device-activity';
import { useIsMobile } from '@/shared/lib/hooks';

import { profileStore } from '.';

export const useProfile = () => {
	const isMobile = useIsMobile();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();

	const rawDate = userStore.passwordChangedAt || userStore.user?.created_at;
	const passChangedDate = rawDate ? new Date(rawDate) : null;
	const formattedDate = passChangedDate
		? `${format(passChangedDate, 'dd.MM.yyyy', { locale: ru })} г. (${formatDistanceToNow(passChangedDate, {
				locale: ru,
				addSuffix: true,
			})})`
		: 'Не указано';

	const isValidDate =
		profileStore.birthYear !== undefined &&
		profileStore.birthMonth !== undefined &&
		profileStore.birthDay !== undefined &&
		!Number.isNaN(+profileStore.birthYear) &&
		!Number.isNaN(+profileStore.birthMonth) &&
		!Number.isNaN(+profileStore.birthDay);
	const date = isValidDate
		? new Date(+profileStore.birthYear, +profileStore.birthMonth, +profileStore.birthDay)
		: null;
	const formattedBirthDate = date ? `${format(date, 'dd.MM.yyyy', { locale: ru })} г.` : 'Не указано';

	useEffect(() => {
		deviceActivityStore.setupDeviceLog();
	}, []);

	return { isMobile, searchParams, formattedBirthDate, formattedDate, navigate };
};
