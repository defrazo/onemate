import {
	IconAppsFilled,
	IconLayoutDashboardFilled,
	IconLayoutKanbanFilled,
	IconSquareCheckFilled,
} from '@tabler/icons-react';

import type { NavItem } from '.';

export const navItems: NavItem[] = [
	{ to: '/dashboard', icon: <IconLayoutDashboardFilled />, label: 'Dashboard', order: 3, primaryMobile: true },
	{ to: '/todo', icon: <IconSquareCheckFilled />, label: 'ToDo', order: 2 },
	{ to: '/kanban', icon: <IconLayoutKanbanFilled />, label: 'Kanban', order: 4 },
	{
		to: 'https://toolbox.letunoff.ru/',
		icon: <IconAppsFilled />,
		label: 'ToolBox',
		order: 5,
		mobile: false,
		external: true,
	},
];
