import { createSvg, formatTaskSummary, notifier, viewIcon } from '../../../lib';
import type { TaskPriority, TaskStatus } from '../../../model';
import { createButton, createDialog } from '../../components';
import { createTaskDetails, createTaskMeta, createTaskViewProperties } from '.';

type ViewTaskProps = {
	initial: {
		title: string;
		description?: string;
		status: TaskStatus;
		priority: TaskPriority;
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
		status: options.initial.status,
		priority: options.initial.priority,
		startDate: options.initial.startDate,
		endDate: options.initial.endDate,
	});

	// === META ===
	const meta = createTaskMeta({ created: options.initial.created, updated: options.initial.updated });

	// === ACTION ===
	const actions = document.createElement('div');
	actions.className = 'flex flex-col items-center gap-2 pt-2';

	const actionButton = createButton({
		text: isCompleted ? 'Возобновить' : 'Завершить',
		variant: 'primary',
		className: 'min-w-48',
		onClick: handleAction,
	});

	const copyButton = document.createElement('button');
	copyButton.type = 'button';
	copyButton.textContent = 'Копировать в буфер';
	copyButton.className =
		'mx-auto cursor-pointer text-xs text-(--text-secondary) transition-colors hover:text-(--text-primary)';

	copyButton.addEventListener('click', handleCopy);

	actions.append(actionButton, copyButton);

	// === ACTION FUNCTIONS ===
	function handleAction() {
		options.onSubmit(!isCompleted);
		close();
	}

	async function handleCopy(): Promise<void> {
		try {
			await navigator.clipboard.writeText(formatTaskSummary(options.initial));
			notifier.setNotice('Скопировано в буфер обмена', 'success');
		} catch {
			notifier.setNotice('Что-то пошло не так', 'error');
		}
	}

	// === LIFECYCLE ===
	function close() {
		if (isClosed) return;
		isClosed = true;

		copyButton.removeEventListener('click', handleCopy);
		closeDialog();
	}

	// === ASSEMBLY ===
	container.append(details.element, properties.element, actions, meta.element);

	return { element: overlay, close };
};
