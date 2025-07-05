import { IconDZ, IconOK, IconTG, IconVK } from '@/shared/assets/icons';

export const links = [
	{ title: '© 2025 Евгений Летунов' },
	{ to: '/about', title: 'О проекте' },
	{ to: '/terms', title: 'Пользовательское соглашение' },
	{ to: '/privacy', title: 'Политика конфиденциальности' },
];

export const socials = [
	{ href: 'https://vk.com', icon: IconVK, title: 'ВКонтакте', style: 'size-6 hover:text-blue-500' },
	{ href: 'https://ok.ru', icon: IconOK, title: 'Одноклассники', style: 'size-6 hover:text-orange-500' },
	{ href: 'https://dzen.ru', icon: IconDZ, title: 'Дзен', style: 'size-6 hover:text-yellow-500' },
	{ href: 'https://t.me', icon: IconTG, title: 'Telegram', style: 'size-6 hover:text-blue-400' },
];
