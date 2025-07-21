import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

import { userStore } from '@/entities/user';
import { deviceActivityStore } from '@/features/device-activity';
import { useIsMobile } from '@/shared/lib/hooks';

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

	useEffect(() => {
		deviceActivityStore.setupDeviceLog();
	}, []);

	return { isMobile, searchParams, formattedDate, navigate };
};
