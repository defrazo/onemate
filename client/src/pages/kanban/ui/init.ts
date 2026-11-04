import { reaction } from 'mobx';

import type { UserStore } from '@/entities/user';

import { KanbanRepoRouting } from '../api';
import { deviceUtils } from '../lib';
import { createState } from '../model';
import { renderKanban } from '.';

export const initKanban = (root: HTMLElement, userStore: UserStore) => {
	deviceUtils.init();

	const repo = new KanbanRepoRouting(userStore);
	const state = createState(repo);
	const destroyKanban = renderKanban(root, state);

	let destroyed = false;
	let stopSessionWatch = () => {};

	const destroy = () => {
		if (destroyed) return;

		destroyed = true;
		stopSessionWatch();
		state.destroy();
		destroyKanban();
	};

	stopSessionWatch = reaction(() => `${userStore.userRole}:${userStore.id ?? ''}`, destroy);

	const ready = state.loadData().catch((error: unknown) => {
		try {
			destroy();
		} finally {
			throw error;
		}
	});

	return { destroy, ready, state };
};
