import { authFormStore } from '@/features/user-auth';
import { IconDash, IconGen, IconKanban, IconLogin, IconMain, IconTodo } from '@/shared/assets/icons';
import { uiStore } from '@/shared/stores';
import AuthContainer from '@/widgets/authorization';

import type { NavItem } from '.';

export const getNavItems = (isAuth: boolean): NavItem[] => {
	const openAuth = () => {
		authFormStore.update('authType', 'login');
		authFormStore.setResetMode(false);
		uiStore.setModal(<AuthContainer />);
	};

	if (isAuth) {
		return [
			{ to: '/', icon: <IconMain />, label: 'Главная', order: 1 },
			{ to: '/dashboard', icon: <IconDash className="size-full" />, label: 'Dashboard', order: 4 },
			{ to: '/todo', icon: <IconTodo className="size-full" />, label: 'ToDo', order: 3 },
			{ to: '/kanban', icon: <IconKanban />, label: 'Канбан', order: 2 },
			{ to: '/generator', icon: <IconGen />, label: 'OneGen' },
		];
	} else {
		return [{ to: '', icon: <IconLogin />, label: 'Войти', onClick: openAuth }];
	}
};
