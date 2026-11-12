import type { createState } from '../model/state';
import { createBoard } from './board';

export const renderKanban = (root: HTMLElement, state: ReturnType<typeof createState>) => {
	const kanban = createBoard(state);
	root.appendChild(kanban.element);

	return () => kanban.destroy();
};
