import { createSvg, notifier, settingsIcon } from '../../../lib';
import { LIMITS, type TaskPriority, type TaskStatus } from '../../../model';
import { createButton, createDialog } from '../../components';
import { createTaskDetails, createTaskProperties } from '.';

type EditTaskProps = {
	mode: 'create' | 'edit';
	initial: {
		title: string;
		description?: string;
		status: TaskStatus | null;
		priority: TaskPriority | null;
		startDate: string | null;
		endDate: string | null;
	};
	onSubmit: (
		title: string,
		description: string,
		status: TaskStatus | null,
		priority: TaskPriority | null,
		startDate: string | null,
		endDate: string | null
	) => void | boolean | Promise<void | boolean>;
	onClose?: () => void;
};

export const editTask = (options: EditTaskProps) => {
	let isClosed = false;
	let saving = false;

	// === DIALOG ===
	const icon = createSvg(settingsIcon, 'size-4');

	const {
		overlay,
		container,
		close: closeDialog,
	} = createDialog(options.mode === 'create' ? 'Добавление задачи' : 'Редактирование задачи', icon, cleanup);

	// === FORM ===
	const form = document.createElement('form');
	form.className = 'flex flex-col gap-3';

	// === MAIN FIELDS ===
	const mainFields = createTaskDetails({
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
	const onSubmit = (e: SubmitEvent) => {
		e.preventDefault();
		handleSubmit();
	};

	const onKeyDown = (e: KeyboardEvent) => {
		if (e.key !== 'Enter') return;
		if (e.isComposing) return;
		if (e.defaultPrevented) return;
		if (submitButton.disabled) return;
		if (e.target instanceof HTMLTextAreaElement) return;

		e.preventDefault();
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
		};
	}

	async function handleSubmit() {
		if (isClosed || saving) return;

		const data = getFormData();

		if (!data.title) return;
		if (data.title.length > LIMITS.TASK_TITLE) return;
		if (data.description.length > LIMITS.TASK_DESC) return;

		if (!properties.areDatesValid()) {
			properties.setDatesInvalid(true);
			return;
		}

		saving = true;
		form.inert = true;

		updateSubmitState();

		try {
			const result = await options.onSubmit(
				data.title,
				data.description,
				data.status,
				data.priority,
				data.startDate,
				data.endDate
			);

			if (result !== false && !isClosed) close();
		} catch {
			if (!isClosed) notifier.setNotice('Не удалось сохранить задачу', 'error');
		} finally {
			saving = false;

			if (!isClosed) {
				form.inert = false;
				updateSubmitState();
			}
		}
	}

	function updateSubmitState() {
		const title = mainFields.getTitle();
		const description = mainFields.getDescription();

		const datesValid = properties.areDatesValid();
		properties.setDatesInvalid(!datesValid);

		submitButton.disabled =
			saving ||
			!title ||
			title.length > LIMITS.TASK_TITLE ||
			description.length > LIMITS.TASK_DESC ||
			!datesValid;
	}

	// === LIFECYCLE ===
	function cleanup() {
		if (isClosed) return;
		isClosed = true;

		form.removeEventListener('submit', onSubmit);
		overlay.removeEventListener('keydown', onKeyDown);
		cancelButton.removeEventListener('click', close);

		mainFields.destroy();
		properties.destroy();
		options.onClose?.();
	}

	function close() {
		closeDialog();
	}

	// === INIT ===
	updateSubmitState();

	// === ASSEMBLY ===
	form.append(mainFields.element, properties.element, actions);

	container.append(form);

	return { element: overlay, close };
};
