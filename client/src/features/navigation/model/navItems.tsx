import { useStore } from '@/app/providers';
import { IconDash, IconKanban, IconLogin, IconMain, IconTodo } from '@/shared/assets/icons';
import AuthContainer from '@/widgets/authorization';

import type { NavItem } from '.';

export const getNavItems = (isAuth: boolean): NavItem[] => {
	const { authFormStore, modalStore } = useStore();

	const openAuth = () => {
		authFormStore.update('authType', 'login');
		authFormStore.setResetMode(false);
		modalStore.setModal(<AuthContainer />);
	};

	if (isAuth) {
		return [
			{ to: '/', icon: <IconMain />, label: 'Главная', order: 1 },
			{ to: '/dashboard', icon: <IconDash className="size-full" />, label: 'Dashboard', order: 4 },
			{ to: '/todo', icon: <IconTodo className="size-full" />, label: 'ToDo', order: 3 },
			{ to: '/kanban', icon: <IconKanban />, label: 'Kanban', order: 2 },
		];
	} else {
		return [{ to: '', icon: <IconLogin />, label: 'Войти', onClick: openAuth }];
	}
};
