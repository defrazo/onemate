import {
	IconBook,
	IconFileDescription,
	IconInfoCircle,
	IconSettings,
	IconShieldLock,
	IconStack2,
	IconUser,
} from '@tabler/icons-react';

import type { TabId } from '@/features/account-settings';

export const profileTabs = [
	{ id: 'personal' as TabId, label: 'Личные данные', icon: IconUser },
	{ id: 'contacts' as TabId, label: 'Контакты и адреса', icon: IconBook },
	{ id: 'secure' as TabId, label: 'Безопасность', icon: IconShieldLock },
	{ id: 'interface' as TabId, label: 'Интерфейс', icon: IconStack2 },
];

export const mobileUserMenuLinks = [
	{ to: '/terms-of-service', icon: IconFileDescription, label: 'Пользовательское соглашение' },
	{ to: '/privacy-policy', icon: IconShieldLock, label: 'Политика конфиденциальности' },
	{ to: '/about', icon: IconInfoCircle, label: 'О проекте' },
];

export const desktopUserLinks = [
	{ to: '/account/profile?tab=overview', icon: IconSettings, label: 'Настройки аккаунта' },
	{ to: '/account/profile?tab=interface', icon: IconStack2, label: 'Настройки интерфейса' },
];
