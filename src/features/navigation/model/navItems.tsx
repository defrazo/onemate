import { ReactNode } from 'react';

import { openAuthContainer } from '@/app/lib/modal';
import { IconGen, IconKanban, IconLogin, IconMain, IconTodo, IconWidgets } from '@/shared/assets/icons';

type NavItem = {
	to: string;
	icon: ReactNode;
	label: string;
	onClick?: () => void;
	orderMobile?: number;
};

export const getNavItems = (isAuthenticated: boolean): NavItem[] => {
	if (isAuthenticated) {
		return [
			{ to: '/', icon: <IconMain />, label: 'Главная', orderMobile: 1 },
			{ to: '/main', icon: <IconWidgets />, label: 'Dashboard', orderMobile: 4 },
			{ to: '/todo', icon: <IconTodo />, label: 'To Do', orderMobile: 3 },
			{ to: '/kanban', icon: <IconKanban />, label: 'Канбан', orderMobile: 2 },
			{ to: '/generator', icon: <IconGen />, label: 'OneGen' },
		];
	} else {
		return [{ to: '', icon: <IconLogin />, label: 'Войти', onClick: openAuthContainer }];
	}
};
