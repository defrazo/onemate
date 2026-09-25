import { addIcon, insertSvg, settingsIcon } from '../../lib';
import { type Column, COLUMN_COLORS } from '../../model';

type CreateColumnHeaderProps = {
	column: Column;
	tasksCount: number;
	isMoving: boolean;
	onAdd: () => void;
	onEdit: () => void;
};

export const createColumnHeader = ({ column, tasksCount, isMoving, onAdd, onEdit }: CreateColumnHeaderProps) => {
	// === HEADER ===
	const element = document.createElement('div');
	element.dataset.columnHeader = '';
	element.dataset.columnDragHandle = '';
	element.className =
		'group/header flex min-w-0 items-center gap-2 rounded-lg border border-white/4 bg-white/1 px-3 py-2';

	// === ACCENT ===
	const accent = document.createElement('span');
	accent.className = 'h-1 w-3 shrink-0 rounded-full';

	// === TITLE ===
	const title = document.createElement('h2');
	title.className = 'min-w-0 truncate pt-px font-bold';

	// === ADD BUTTON ===
	const addButton = document.createElement('button');
	addButton.type = 'button';
	addButton.title = 'Добавить задачу';
	addButton.className =
		'mr-auto size-4.5 cursor-pointer text-(--color-secondary) transition-[color,opacity] hover:text-(--accent-hover) xl:opacity-0 xl:group-hover:opacity-100';
	insertSvg(addButton, addIcon, 'size-4.5');

	// === SETTINGS BUTTON ===
	const settingsButton = document.createElement('button');
	settingsButton.type = 'button';
	settingsButton.title = 'Настройки колонки';
	settingsButton.className =
		'size-4.5 cursor-pointer text-(--color-secondary) transition-[color,opacity] hover:text-(--accent-hover) xl:opacity-0 xl:group-hover/header:opacity-100';
	insertSvg(settingsButton, settingsIcon, 'size-4.5');

	// === COUNTER ===
	const counter = document.createElement('span');
	counter.className = 'shrink-0 text-xs text-(--color-secondary)';

	// === UPDATE ===
	function update(nextColumn: Column, nextTasksCount: number) {
		const limit = nextColumn.taskLimit ?? Infinity;
		const isLimitReached = nextTasksCount >= limit;

		title.textContent = nextColumn.title;
		title.title = nextColumn.title;

		counter.textContent = `${nextTasksCount} / ${limit === Infinity ? '∞' : limit}`;

		accent.style.backgroundColor = COLUMN_COLORS[nextColumn.color ?? 'slate'];

		addButton.classList.toggle('hidden', isLimitReached);
	}

	function setMoving(moving: boolean) {
		element.classList.toggle('cursor-grab', !moving);
		element.classList.toggle('cursor-progress', moving);
	}

	// === EVENTS ===
	addButton.addEventListener('click', onAdd);
	settingsButton.addEventListener('click', onEdit);

	// === LIFECYCLE ===
	function destroy() {
		addButton.removeEventListener('click', onAdd);
		settingsButton.removeEventListener('click', onEdit);
	}

	// === INITIAL STATE ===
	update(column, tasksCount);
	setMoving(isMoving);

	// === ASSEMBLY ===
	element.append(accent, title, addButton, settingsButton, counter);

	return { element, update, setMoving, destroy };
};
