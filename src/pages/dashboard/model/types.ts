import type { ReactNode } from 'react';

export type WidgetItem = {
	id: string;
	content: ReactNode;
};

export type SlotKey = 'topL' | 'topR' | 'botL' | 'botR';
