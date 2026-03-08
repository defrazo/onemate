import { createState } from '../model';
import { renderKanban } from '.';

export const initKanban = async (rootSelector: string) => {
	const root = document.querySelector<HTMLElement>(rootSelector);
	if (!root) throw new Error('Kanban root not found');

	const state = createState();
	await state.init();

	return renderKanban(root, state);
};
