import { useNavigate, useSearchParams } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

import { useStore } from '@/app/providers';
import { useDeviceType } from '@/shared/lib/hooks';

export const useProfile = () => {
	const { userProfileStore, userStore } = useStore();

	const navigate = useNavigate();
	const device = useDeviceType();
	const [searchParams] = useSearchParams();

	const rawPasswordDate = userProfileStore.passwordChangedAt ?? userStore.user?.created_at;

	const passwordDate = rawPasswordDate ? new Date(rawPasswordDate) : null;

	const formattedDate = passwordDate
		? `${format(passwordDate, 'dd.MM.yyyy', { locale: ru })} г. (${formatDistanceToNow(passwordDate, {
				locale: ru,
				addSuffix: true,
			})})`
		: 'Не указано';

	const { birthYear, birthMonth, birthDay } = userProfileStore;

	const isValidBirthDate =
		birthYear !== '' &&
		birthMonth !== '' &&
		birthDay !== '' &&
		!Number.isNaN(Number(birthYear)) &&
		!Number.isNaN(Number(birthMonth)) &&
		!Number.isNaN(Number(birthDay));

	const birthDate = isValidBirthDate ? new Date(Number(birthYear), Number(birthMonth) - 1, Number(birthDay)) : null;

	const formattedBirthDate = birthDate ? `${format(birthDate, 'dd.MM.yyyy', { locale: ru })} г.` : 'Не указано';

	return { device, searchParams, formattedBirthDate, formattedDate, navigate };
};
