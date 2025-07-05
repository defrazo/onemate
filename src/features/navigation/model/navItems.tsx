import { openAuthContainer } from '@/app/lib/modal';
import { IconDash, IconGen, IconKanban, IconLogin, IconMain, IconTodo } from '@/shared/assets/icons';

import { NavItem } from '.';

export const getNavItems = (isAuth: boolean): NavItem[] => {
	if (isAuth) {
		return [
			{ to: '/', icon: <IconMain />, label: 'Главная', order: 1 },
			{ to: '/main', icon: <IconDash className="size-full" />, label: 'Dashboard', order: 4 },
			{ to: '/todo', icon: <IconTodo className="size-full" />, label: 'ToDo', order: 3 },
			{ to: '/kanban', icon: <IconKanban />, label: 'Канбан', order: 2 },
			{ to: '/generator', icon: <IconGen />, label: 'OneGen' },
		];
	} else {
		return [{ to: '', icon: <IconLogin />, label: 'Войти', onClick: openAuthContainer }];
	}
};
