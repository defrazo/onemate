import { createState } from '../model';
import { renderKanban } from '.';

export const initKanban = (rootSelector: string) => {
	const root = document.querySelector<HTMLElement>(rootSelector);
	if (!root) throw new Error('Kanban root not found');

	const state = createState();
	const cleanup = renderKanban(root, state);

	return () => {
		cleanup();
	};
};
