import { formatTaskSummary } from '../../../lib/formatTaskSummary';
import { viewIcon } from '../../../lib/icons';
import { notifier } from '../../../lib/notifier';
import { createSvg } from '../../../lib/utils';
import type { TaskPriority, TaskStatus } from '../../../model/types';
import { createButton, createDialog } from '../../components';
import { createTaskDetails } from './createTaskDetails';
import { createTaskMeta } from './createTaskMeta';
import { createTaskViewProperties } from './createTaskViewProperties';

type ViewTaskProps = {
	initial: {
		title: string;
		description?: string;
		status: TaskStatus | null;
		priority: TaskPriority | null;
		startDate: string | null;
		endDate: string | null;
		remindBeforeDays: number | null;
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

	const { overlay, container, close: closeDialog } = createDialog('Детали задачи', icon, cleanup);

	// === DETAILS ===
	const details = createTaskDetails({ title: options.initial.title, description: options.initial.description });

	// === PROPERTIES ===
	const properties = createTaskViewProperties({
		status: options.initial.status,
		priority: options.initial.priority,
		startDate: options.initial.startDate,
		endDate: options.initial.endDate,
		remindBeforeDays: options.initial.remindBeforeDays,
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
		'mx-auto cursor-pointer text-sm text-(--text-secondary) transition-colors select-none hover:text-(--text-primary) md:text-xs';

	copyButton.addEventListener('click', handleCopy);

	actions.append(actionButton, copyButton);

	// === ACTION FUNCTIONS ===
	function handleAction() {
		if (isClosed) return;

		close();
		options.onSubmit(!isCompleted);
	}

	async function handleCopy(): Promise<void> {
		if (isClosed) return;

		try {
			await navigator.clipboard.writeText(formatTaskSummary(options.initial));

			if (isClosed) return;
			notifier.setNotice('Скопировано в буфер обмена', 'success');
		} catch {
			if (isClosed) return;
			notifier.setNotice('Что-то пошло не так', 'error');
		}
	}

	// === LIFECYCLE ===
	function cleanup() {
		if (isClosed) return;
		isClosed = true;

		copyButton.removeEventListener('click', handleCopy);
		actionButton.removeEventListener('click', handleAction);
	}

	function close() {
		closeDialog();
	}

	// === ASSEMBLY ===
	container.append(details.element, properties.element, actions, meta.element);

	return { element: overlay, close };
};
