import { useNavigate, useSearchParams } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

import { useStore } from '@/app/providers';
import { useDeviceType } from '@/shared/lib/hooks';

export const useProfile = () => {
	const { profileStore: store, userProfileStore, userStore } = useStore();
	const navigate = useNavigate();
	const device = useDeviceType();
	const [searchParams] = useSearchParams();

	const rawDate = userProfileStore.passwordChangedAt || userStore.user?.created_at;
	const passChangedDate = rawDate ? new Date(rawDate) : null;
	const formattedDate = passChangedDate
		? `${format(passChangedDate, 'dd.MM.yyyy', { locale: ru })} г. (${formatDistanceToNow(passChangedDate, {
				locale: ru,
				addSuffix: true,
			})})`
		: 'Не указано';

	const isValidDate =
		store.birthYear !== undefined &&
		store.birthMonth !== undefined &&
		store.birthDay !== undefined &&
		!Number.isNaN(+store.birthYear) &&
		!Number.isNaN(+store.birthMonth) &&
		!Number.isNaN(+store.birthDay);
	const date = isValidDate && new Date(+store.birthYear, +store.birthMonth, +store.birthDay);
	const formattedBirthDate = date ? `${format(date, 'dd.MM.yyyy', { locale: ru })} г.` : 'Не указано';

	return { device, searchParams, formattedBirthDate, formattedDate, navigate };
};
