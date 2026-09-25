import { createSvg, viewIcon } from '../../../lib';
import { createButton, createDialog } from '../../components';
import { createTaskDetails, createTaskMeta, createTaskViewProperties } from '.';

type ViewTaskProps = {
	initial: {
		title: string;
		description?: string;
		startDate: string;
		endDate: string | null;
		completed: boolean;
		created: string;
		updated: string | null;
	};
	onSubmit: (completed: boolean) => void;
};

export const viewTask = (options: ViewTaskProps) => {
	let isClosed = false;

	const isCompleted = options.initial.completed;

	// === DIALOG ===
	const icon = createSvg(viewIcon, 'size-5');

	const { overlay, container, close: closeDialog } = createDialog('Детали задачи', icon);

	// === DETAILS ===
	const details = createTaskDetails({ title: options.initial.title, description: options.initial.description });

	// === PROPERTIES ===
	const properties = createTaskViewProperties({
		startDate: options.initial.startDate,
		endDate: options.initial.endDate,
	});

	// === META ===
	const meta = createTaskMeta({ created: options.initial.created, updated: options.initial.updated });

	// === ACTION ===
	const actionButton = createButton({
		text: isCompleted ? 'Возобновить' : 'Завершить',
		variant: 'primary',
		className: 'mx-auto mt-2 min-w-48',
		onClick: handleAction,
	});

	// === ACTION FUNCTIONS ===
	function handleAction() {
		options.onSubmit(!isCompleted);
		close();
	}

	// === LIFECYCLE ===
	function close() {
		if (isClosed) return;
		isClosed = true;

		closeDialog();
	}

	// === ASSEMBLY ===
	container.append(details.element, properties.element, actionButton, meta.element);

	return { element: overlay, close };
};
