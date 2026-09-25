import { createSvg, settingsIcon } from '../../../lib';
import { LIMITS, type TaskPriority, type TaskStatus } from '../../../model';
import { createButton, createDialog } from '../../components';
import { createTaskFields, createTaskProperties } from '.';

type EditTaskProps = {
	mode: 'create' | 'edit';
	initial: {
		title: string;
		description?: string;
		status: TaskStatus;
		priority: TaskPriority;
		startDate: string;
		endDate: string | null;
		completed: boolean;
	};
	onSubmit: (
		title: string,
		description: string,
		status: TaskStatus,
		priority: TaskPriority,
		startDate: string,
		endDate: string | null,
		completed: boolean
	) => void;
};

export const editTask = (options: EditTaskProps) => {
	let isClosed = false;

	// === DIALOG ===
	const icon = createSvg(settingsIcon, 'size-4');

	const {
		overlay,
		container,
		close: closeDialog,
	} = createDialog(options.mode === 'create' ? 'Добавление задачи' : 'Редактирование задачи', icon);

	// === FORM ===
	const form = document.createElement('form');
	form.className = 'flex flex-col gap-3';

	// === MAIN FIELDS ===
	const mainFields = createTaskFields({
		title: options.initial.title,
		description: options.initial.description,
		onChange: updateSubmitState,
	});

	// === PROPERTIES ===
	const properties = createTaskProperties({
		status: options.initial.status,
		priority: options.initial.priority,
		startDate: options.initial.startDate,
		endDate: options.initial.endDate,
		completed: options.initial.completed,
		showCompleted: options.mode === 'edit',
		onChange: updateSubmitState,
	});

	// === ACTIONS ===
	const actions = document.createElement('div');
	actions.className = 'flex items-center justify-end gap-3 pt-2';

	const submitButton = createButton({
		text: options.mode === 'create' ? 'Добавить' : 'Сохранить',
		type: 'submit',
		variant: 'primary',
	});

	const cancelButton = createButton({ text: 'Отмена', variant: 'secondary', onClick: close });

	actions.append(submitButton, cancelButton);

	// === EVENTS ===
	const onSubmit = (event: SubmitEvent) => {
		event.preventDefault();
		handleSubmit();
	};

	const onKeyDown = (event: KeyboardEvent) => {
		if (event.key !== 'Enter') return;
		if (event.isComposing) return;
		if (event.defaultPrevented) return;
		if (submitButton.disabled) return;
		if (event.target instanceof HTMLTextAreaElement) return;

		event.preventDefault();
		form.requestSubmit();
	};

	form.addEventListener('submit', onSubmit);
	overlay.addEventListener('keydown', onKeyDown);

	// === ACTION FUNCTIONS ===
	function getFormData() {
		const taskProperties = properties.getValue();

		return {
			title: mainFields.getTitle(),
			description: mainFields.getDescription(),
			status: taskProperties.status,
			priority: taskProperties.priority,
			startDate: taskProperties.startDate,
			endDate: taskProperties.endDate,
			completed: taskProperties.completed,
		};
	}

	function handleSubmit() {
		const data = getFormData();

		if (!data.title) return;
		if (data.title.length > LIMITS.TASK_TITLE) return;
		if (data.description.length > LIMITS.TASK_DESC) return;

		if (!properties.areDatesValid()) {
			properties.setDatesInvalid(true);
			return;
		}

		options.onSubmit(
			data.title,
			data.description,
			data.status,
			data.priority,
			data.startDate,
			data.endDate,
			data.completed
		);

		close();
	}

	function updateSubmitState() {
		const title = mainFields.getTitle();
		const description = mainFields.getDescription();

		const datesValid = properties.areDatesValid();
		properties.setDatesInvalid(!datesValid);

		submitButton.disabled =
			!title || title.length > LIMITS.TASK_TITLE || description.length > LIMITS.TASK_DESC || !datesValid;
	}

	// === LIFECYCLE ===
	function cleanup() {
		form.removeEventListener('submit', onSubmit);
		overlay.removeEventListener('keydown', onKeyDown);

		mainFields.destroy();
		properties.destroy();
	}

	function close() {
		if (isClosed) return;
		isClosed = true;

		cleanup();
		closeDialog();
	}

	// === INIT ===
	updateSubmitState();

	// === ASSEMBLY ===
	form.append(mainFields.element, properties.element, actions);

	container.append(form);

	return { element: overlay, close };
};
