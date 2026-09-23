import type { ReactNode } from 'react';
import type { Icon } from '@tabler/icons-react';

import type { WidgetId } from '@/shared/config';

export type WidgetItem = {
	id: WidgetId;
	title: string;
	icon: Icon;
	content: ReactNode;
	tip: ReactNode;
};

export type SwitcherOption = {
	value: WidgetId;
	label: ReactNode;
};
