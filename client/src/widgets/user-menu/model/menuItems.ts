import {
	IconBookFilled,
	IconFileDescription,
	IconInfoCircle,
	IconShieldLock,
	IconShieldLockFilled,
	IconUserFilled,
} from '@tabler/icons-react';

import { TabId } from '@/features/account-settings';

export const userMenuLinks = [
	{
		to: '/terms-of-service',
		icon: IconFileDescription,
		label: 'Пользовательское соглашение',
	},
	{
		to: '/privacy-policy',
		icon: IconShieldLock,
		label: 'Политика конфиденциальности',
	},
	{
		to: '/about',
		icon: IconInfoCircle,
		label: 'О проекте',
	},
];

export const profileTabs = [
	{ id: 'personal' as TabId, label: 'Личные данные', icon: IconUserFilled },
	{ id: 'contacts' as TabId, label: 'Контакты и адреса', icon: IconBookFilled },
	{ id: 'secure' as TabId, label: 'Безопасность', icon: IconShieldLockFilled },
];
