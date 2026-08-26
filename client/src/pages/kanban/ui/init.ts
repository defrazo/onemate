import type { UserStore } from '@/entities/user';

import { KanbanRepoRouting } from '../api';
import { deviceUtils } from '../lib';
import { createState } from '../model';
import { renderKanban } from '.';

export const initKanban = async (root: HTMLElement, userStore: UserStore) => {
	deviceUtils.init();

	const repo = new KanbanRepoRouting(userStore);
	const state = createState(repo);

	await state.loadData();

	return renderKanban(root, state);
};
