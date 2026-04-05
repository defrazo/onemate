import { createKanbanRepo, getUserRole } from '../api';
import { deviceUtils } from '../lib';
import { createState } from '../model';
import { renderKanban } from '.';

export const initKanban = async (root: HTMLElement) => {
	deviceUtils.init();

	const role = await getUserRole();
	const repo = createKanbanRepo(role);

	const state = createState(repo);
	await state.loadData();

	return renderKanban(root, state);
};
