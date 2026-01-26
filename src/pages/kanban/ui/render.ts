import dragIcon from '@/shared/assets/icons/actions/move.svg';
import { cn, fullDate } from '@/shared/lib/utils';

import { insertSvg } from '../lib';
import { createState, setupDnD, type Task } from '../model';

export const createBoard = (state: ReturnType<typeof createState>): HTMLElement => {
	const board = document.createElement('div');
	board.className = 'flex gap-4 w-full h-full';

	state.getColumns().forEach((columnName) => {
		const column = document.createElement('div');
		column.dataset.column = columnName;
		column.className = cn('core-card core-base relative flex flex-1 flex-col gap-2');

		const header = document.createElement('div');
		header.className = 'flex flex-col';

		const title = document.createElement('h2');
		title.textContent = columnName.toUpperCase();
		title.className = cn(
			'text-center text-xl leading-tight font-bold select-none md:mr-auto md:ml-0 md:leading-normal'
		);

		const count = document.createElement('div');
		count.textContent = `Всего: 0. Максимум: 10`;
		count.className = cn('text-sm select-none');
		count.dataset.count = 'true';

		const separator = document.createElement('hr');
		separator.className = cn('mb-2 border-(--border-color)');

		const addButton = document.createElement('button');
		addButton.textContent = 'Добавить';
		addButton.className = cn(
			'cursor-pointer rounded-xl border border-solid border-(--border-light) bg-(--accent-default) p-1 text-(--accent-text) ring-(--color-primary) select-none ring-inset hover:bg-(--accent-hover) hover:text-(--accent-text) focus-visible:ring-1'
		);
		addButton.onclick = () => {
			const taskTitle = prompt('Название задачи');
			const date = fullDate(new Date().toISOString());
			if (!taskTitle) return;

			state.addTask(taskTitle, columnName, date);
		};

		const tasksContainer = document.createElement('div');
		tasksContainer.dataset.column = columnName;
		tasksContainer.className = cn('flex flex-1 flex-col gap-2');
		tasksContainer.dataset.tasks = 'true';

		board.appendChild(column);

		column.appendChild(header);

		header.appendChild(title);
		header.appendChild(count);

		column.appendChild(separator);

		column.appendChild(addButton);
		column.appendChild(tasksContainer);
	});

	return board;
};

export const updateBoard = (board: HTMLElement, tasks: Task[], state: ReturnType<typeof createState>) => {
	const columns = Array.from(board.children) as HTMLElement[];

	columns.forEach((column) => {
		const tasksContainer = column.querySelector('[data-tasks="true"]') as HTMLElement;
		tasksContainer.innerHTML = '';

		tasks
			.filter((task) => task.column === column.dataset.column)
			.forEach((task) => {
				const taskCard = document.createElement('div');
				taskCard.className = cn(
					'relative rounded-xl border border-solid border-(--border-color) bg-transparent p-2'
				);
				taskCard.dataset.id = task.id;

				const dragHandle = document.createElement('div');
				dragHandle.className = 'absolute top-2 right-2 cursor-grab';
				dragHandle.dataset.dragHandle = 'true';
				insertSvg(
					dragHandle,
					dragIcon,
					cn(
						'absolute top-0 right-0 hidden size-4 rotate-90 cursor-move hover:text-(--accent-hover) xl:block'
					)
				);

				const textarea = document.createElement('textarea');
				textarea.value = task.title;
				textarea.className = cn('min-h-16 w-full resize-none bg-transparent pr-2 outline-none');

				const dateElement = document.createElement('div');
				dateElement.textContent = task.date;
				dateElement.className = cn(
					'pointer-events-none absolute right-2 bottom-1 text-xs text-(--color-disabled)'
				);

				taskCard.appendChild(textarea);
				taskCard.appendChild(dragHandle);
				taskCard.appendChild(dateElement);

				tasksContainer.appendChild(taskCard);
			});

		const countElement = column.querySelector('[data-count="true"]') as HTMLElement;
		const tasksInColumn = tasks.filter((task) => task.column === column.dataset.column);
		countElement.textContent = `Всего: ${tasksInColumn.length}. Максимум: 10`;

		setupDnD(tasksContainer, (id, column) => {
			state.moveTask(id, column);
		});
	});
};

export const renderKanban = (root: HTMLElement, state: ReturnType<typeof createState>) => {
	const board = createBoard(state);
	root.appendChild(board);

	setupDnD(board, (id, column) => state.moveTask(id, column));

	const unsubscribe = state.subscribe((tasks) => {
		updateBoard(board, tasks, state);
	});

	return () => {
		unsubscribe();
		root.innerHTML = '';
	};
};
