import type { TablerIcon } from '@tabler/icons-react';

export type WidgetItem = {
	id: string;
	title: string;
	icon: TablerIcon;
	content: React.ReactNode;
	tip: React.ReactNode;
};

export type SlotKey = 'topL' | 'topR' | 'botL' | 'botR';
