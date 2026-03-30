import { createKanbanRepo, getUserRole } from '../api';
import { deviceUtils } from '../lib';
import { createState } from '../model';
import { renderKanban } from '.';

export const initKanban = async (rootSelector: string) => {
	const root = document.querySelector<HTMLElement>(rootSelector);
	if (!root) throw new Error('Kanban root not found');

	deviceUtils.init();

	const role = await getUserRole();
	const repo = createKanbanRepo(role);

	const state = createState(repo);
	await state.loadData();

	return renderKanban(root, state);
};
