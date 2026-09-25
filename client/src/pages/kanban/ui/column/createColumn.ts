import { deviceUtils } from '../../lib';
import { type Column, type ColumnColor, createState } from '../../model';
import { editTask } from '..';
import { createColumnHeader, editColumn } from '.';

export const createColumn = (column: Column, state: ReturnType<typeof createState>) => {
	let isDestroyed = false;
	let currentColumn = column;

	let editTaskModal: ReturnType<typeof editTask> | null = null;
	let editColumnModal: ReturnType<typeof editColumn> | null = null;

	// === COLUMN ===
	const container = document.createElement('div');
	container.dataset.columnId = column.id;
	container.className = 'group flex h-full min-h-0 max-w-80 min-w-64 flex-1 flex-col gap-3 2xl:min-w-60';

	// === HEADER ===
	const header = createColumnHeader({
		column,
		tasksCount: 0,
		isMoving: state.isMovingColumn,
		onAdd: () => onAddTask(currentColumn.id, currentColumn.taskLimit),
		onEdit: () => onEditColumn(currentColumn.id, currentColumn.title, currentColumn.color, currentColumn.taskLimit),
	});

	// === TASKS CONTAINER ===
	const tasksContainer = document.createElement('div');
	tasksContainer.dataset.tasksContainer = column.id;
	tasksContainer.className =
		'hide-scrollbar flex flex-1 flex-col gap-4 xl:max-h-[calc(100vh-225px)] xl:overflow-y-auto';

	// === ACTION FUNCTIONS ===
	function onAddTask(columnId: string, taskLimit: number) {
		const today = new Date().toISOString().split('T')[0];

		editTaskModal?.close();

		editTaskModal = editTask({
			mode: 'create',
			initial: {
				title: '',
				description: '',
				status: 'active',
				priority: 'medium',
				startDate: today,
				endDate: null,
				completed: false,
			},
			onSubmit: (title, description, status, priority, startDate, endDate, completed) => {
				state.addTask(
					columnId,
					title,
					description,
					status,
					priority,
					startDate || today,
					endDate || null,
					completed,
					taskLimit
				);

				editTaskModal = null;
			},
		});

		document.body.append(editTaskModal.element);
	}

	function onEditColumn(id: string, columnTitle: string, color: ColumnColor, limit: number) {
		editColumnModal?.close();

		editColumnModal = editColumn({
			mode: 'edit',
			initial: { columnTitle, color, limit },
			onSubmit: (columnTitle, color, limit) => {
				state.editColumn(id, columnTitle, color, limit);
				editColumnModal = null;
			},
			onDelete: () => {
				state.deleteColumn(id);
				editColumnModal = null;
			},
		});

		document.body.append(editColumnModal.element);
	}

	// === UPDATE ===
	function updateDraggable() {
		const isDesktop = deviceUtils.getDevice() === 'desktop';

		header.element.draggable = isDesktop && !state.isMovingColumn;
		header.setMoving(state.isMovingColumn);
	}

	function update(nextColumn: Column, tasksCount: number) {
		currentColumn = nextColumn;

		header.update(nextColumn, tasksCount);
	}

	// === SUBSCRIPTIONS ===
	updateDraggable();

	const unsubscribeDevice = deviceUtils.onDeviceChange(updateDraggable);
	const unsubscribeColumns = state.subscribeColumns(updateDraggable);

	// === LIFECYCLE ===
	function cleanup() {
		header.destroy();

		unsubscribeDevice();
		unsubscribeColumns();
	}

	function destroy() {
		if (isDestroyed) return;
		isDestroyed = true;

		cleanup();

		editTaskModal?.close();
		editTaskModal = null;

		editColumnModal?.close();
		editColumnModal = null;
	}

	// === ASSEMBLY ===
	container.append(header.element, tasksContainer);

	return { element: container, tasksContainer, update, destroy };
};
