import { ReactNode } from 'react';

import { openAuthContainer } from '@/app/lib/modal';
import { IconGen, IconKanban, IconLogin, IconMain, IconTodo } from '@/shared/assets/icons';

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
			{ to: '/main', icon: <IconMain />, label: 'Рабочий стол', orderMobile: 2 },
			{ to: '/todo', icon: <IconTodo />, label: 'Список дел', orderMobile: 3 },
			{ to: '/kanban', icon: <IconKanban />, label: 'Канбан', orderMobile: 1 },
			{ to: '/generator', icon: <IconGen />, label: 'OneGen', orderMobile: 1 },
		];
	} else {
		return [{ to: '', icon: <IconLogin />, label: 'Войти', onClick: openAuthContainer }];
	}
};
