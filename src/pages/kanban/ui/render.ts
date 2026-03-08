import { createState } from '../model';
import { createBoard } from '.';

export const renderKanban = (root: HTMLElement, state: ReturnType<typeof createState>) => {
	const kanban = createBoard(state);
	root.appendChild(kanban.board);

	return () => {
		kanban.destroy();
		root.innerHTML = '';
	};
};
