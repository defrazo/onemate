type DragType = 'task' | 'column' | null;

export const setupDnD = (
	board: HTMLElement,
	onTaskDrop: (taskId: string, targetColumnId: string, newIndex: number) => void,
	onColumnDrop: (columnId: string, newIndex: number) => void
) => {
	let currentDragType: DragType = null;
	let draggingElement: HTMLElement | null = null;
	let placeholder: HTMLElement | null = null;
	let parent: HTMLElement | null = null;
	let nextSibling: ChildNode | null = null;

	const autoScroll = enableAutoScroll(board);

	board.addEventListener('dragstart', (event) => {
		board.dataset.dragging = 'true';

		const target = event.target as HTMLElement;

		const taskCard = target.closest<HTMLElement>('[data-task-id]');
		if (taskCard) {
			currentDragType = 'task';
			draggingElement = taskCard;
			parent = taskCard.parentElement;
			nextSibling = taskCard.nextElementSibling;

			placeholder = createPlaceholder(currentDragType);
			const { ghost, rect } = createGhost(draggingElement);

			requestAnimationFrame(() => {
				taskCard.after(placeholder!);
				taskCard.style.display = 'none';
				ghost.remove();
			});

			event.dataTransfer!.setDragImage(ghost, rect.width / 2, 0);
			event.dataTransfer!.setData('text/plain', taskCard.dataset.id!);
			event.dataTransfer!.effectAllowed = 'move';
			return;
		}

		const column = target.closest<HTMLElement>('[data-column-id]');
		if (column) {
			currentDragType = 'column';
			draggingElement = column;
			parent = column.parentElement;
			nextSibling = column.nextElementSibling;

			placeholder = createPlaceholder(currentDragType);
			const { ghost, rect } = createGhost(draggingElement);

			requestAnimationFrame(() => {
				column.after(placeholder!);
				column.style.display = 'none';
				ghost.remove();
			});

			event.dataTransfer!.setDragImage(ghost, rect.width / 2, 0);
			event.dataTransfer!.setData('text/plain', column.dataset.columnId!);
			event.dataTransfer!.effectAllowed = 'move';
			return;
		}

		event.preventDefault();
	});

	board.addEventListener('dragover', (event) => {
		event.preventDefault();

		if (!draggingElement || !placeholder) return;

		event.dataTransfer!.dropEffect = 'move';

		autoScroll.update(event.clientX, event.clientY);

		const target = event.target as HTMLElement;

		if (currentDragType === 'task') {
			const targetContainer = target.closest<HTMLElement>('[data-tasks]');
			if (!targetContainer) return;

			const targetCard = target.closest<HTMLElement>('[data-task-id]');

			if (!targetCard) {
				if (!targetContainer.contains(placeholder)) targetContainer.appendChild(placeholder!);
				return;
			}

			if (targetCard === draggingElement) return;

			const rect = targetCard.getBoundingClientRect();
			const isAfter = event.clientY > rect.top + rect.height / 2;
			const referenceNode = isAfter ? targetCard.nextElementSibling : targetCard;

			if (placeholder.nextElementSibling !== referenceNode) {
				if (isAfter) targetCard.after(placeholder);
				else targetCard.before(placeholder);
			}
		}

		if (currentDragType === 'column') {
			const targetContainer = target.closest<HTMLElement>('[data-columns]');
			if (!targetContainer) return;

			const targetColumnId = target.closest<HTMLElement>('[data-column-id]');
			if (!targetColumnId || targetColumnId === draggingElement) return;

			const rect = targetColumnId.getBoundingClientRect();
			const isAfter = event.clientX > rect.left + rect.width / 2;
			const referenceNode = isAfter ? targetColumnId.nextElementSibling : targetColumnId;

			if (placeholder.nextElementSibling !== referenceNode) {
				if (isAfter) targetColumnId.after(placeholder);
				else targetColumnId.before(placeholder);
			}
		}
	});

	board.addEventListener('drop', (event) => {
		delete board.dataset.dragging;
		event.preventDefault();
		autoScroll.stop();

		if (!draggingElement || !placeholder) return;

		if (currentDragType === 'task') {
			const container = placeholder.closest<HTMLElement>('[data-tasks]');
			if (!container) return restore();

			const newIndex = Array.from(container.children).indexOf(placeholder);
			draggingElement.style.display = '';
			placeholder.replaceWith(draggingElement);

			const taskId = draggingElement.dataset.taskId!;
			const targetColumnId = container.dataset.columnId!;

			cleanup();
			onTaskDrop(taskId, targetColumnId, newIndex);
		}

		if (currentDragType === 'column') {
			draggingElement.style.display = '';
			placeholder.replaceWith(draggingElement);

			const columns = Array.from(board.querySelectorAll<HTMLElement>('[data-column-id]'));
			const newIndex = columns.indexOf(draggingElement);
			const columnId = draggingElement.dataset.columnId!;

			cleanup();
			onColumnDrop(columnId, newIndex);
		}
	});

	board.addEventListener('dragend', () => {
		delete board.dataset.dragging;
		autoScroll.stop();
		restore();
	});

	// === HELPERS ===
	function createPlaceholder(type: DragType) {
		const div = document.createElement('div');
		if (type === 'task')
			div.className =
				'bg-(--border-alt)/30 min-h-[180px] animate-pulse transition-transform delay-150 duration-300';
		if (type === 'column')
			div.className =
				'bg-(--border-alt)/30 w-full h-full flex-1 min-w-[260px] max-w-[350px] animate-pulse transition-transform delay-150 duration-300 flex flex-1 flex-col';
		return div;
	}

	function createGhost(element: HTMLElement) {
		const ghost = element.cloneNode(true) as HTMLElement;
		const rect = element.getBoundingClientRect();

		ghost.style.position = 'absolute';
		ghost.style.top = `${rect.top}px`;
		ghost.style.left = `${rect.left}px`;
		ghost.style.width = `${rect.width}px`;
		ghost.style.pointerEvents = 'none';

		document.body.appendChild(ghost);

		return { ghost, rect };
	}

	function restore() {
		if (!draggingElement) return;

		draggingElement.style.display = '';

		if (parent) {
			if (nextSibling && nextSibling.parentNode === parent) parent.insertBefore(draggingElement, nextSibling);
			else parent.append(draggingElement);
		}

		cleanup();
	}

	function cleanup() {
		placeholder?.remove();
		currentDragType = null;
		draggingElement = null;
		placeholder = null;
		parent = null;
		nextSibling = null;
	}
};

export const enableAutoScroll = (container: HTMLElement) => {
	let directionX: 'left' | 'right' | null = null;
	let directionY: 'up' | 'down' | null = null;

	let active = false;

	const THRESHOLD = 60;
	const THRESHOLD_Y = 30;
	const SPEED = 12;
	const SPEED_Y = 120;

	const loop = () => {
		if (!active) return;

		if (directionX === 'left') container.scrollLeft -= SPEED;
		if (directionX === 'right') container.scrollLeft += SPEED;

		const scroller = document.documentElement;

		if (directionY === 'up') scroller.scrollTop -= SPEED_Y;
		if (directionY === 'down') scroller.scrollTop += SPEED_Y;

		requestAnimationFrame(loop);
	};

	const update = (clientX: number, clientY: number) => {
		const rect = container.getBoundingClientRect();

		if (clientX < rect.left + THRESHOLD) directionX = 'left';
		else if (clientX > rect.right - THRESHOLD) directionX = 'right';
		else directionX = null;

		if (clientY < THRESHOLD_Y / 10) directionY = 'up';
		else if (clientY > window.innerHeight - THRESHOLD_Y) directionY = 'down';
		else directionY = null;

		if ((directionX || directionY) && !active) {
			active = true;
			requestAnimationFrame(loop);
		}

		if (!directionX && !directionY) active = false;
	};

	return {
		update,
		stop() {
			active = false;
			directionX = null;
			directionY = null;
		},
	};
};

export const enableMouseScroll = (container: HTMLElement) => {
	let isDown = false;
	let startX = 0;
	let scrollLeft = 0;
	let moved = false;

	const MOVE_THRESHOLD = 5;

	const onMouseDown = (event: MouseEvent) => {
		if (event.button !== 0) return;
		if (container.dataset.dragging) return;

		const target = event.target as HTMLElement;

		if (target.closest('button, input, textarea, select, [data-task-id]')) return;

		isDown = true;
		moved = false;
		startX = event.pageX;
		scrollLeft = container.scrollLeft;
	};

	const onMouseMove = (event: MouseEvent) => {
		if (!isDown || container.dataset.dragging) return;

		const dx = event.pageX - startX;

		if (!moved && Math.abs(dx) < MOVE_THRESHOLD) return;

		moved = true;
		event.preventDefault();
		container.scrollLeft = scrollLeft - dx;
		container.style.cursor = 'grabbing';
	};

	const onMouseUp = () => {
		isDown = false;
		moved = false;
		container.style.cursor = '';
	};

	container.addEventListener('mousedown', onMouseDown);
	document.addEventListener('mousemove', onMouseMove);
	document.addEventListener('mouseup', onMouseUp);

	return () => {
		container.removeEventListener('mousedown', onMouseDown);
		document.removeEventListener('mousemove', onMouseMove);
		document.removeEventListener('mouseup', onMouseUp);
	};
};
