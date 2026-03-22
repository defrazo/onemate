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

	board.addEventListener('dragstart', (event) => {
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
		if (!draggingElement || !placeholder) return;
		event.preventDefault();
		event.dataTransfer!.dropEffect = 'move';

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
		event.preventDefault();
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

	board.addEventListener('dragend', restore);

	// === HELPERS ===
	function createPlaceholder(type: DragType) {
		const div = document.createElement('div');
		if (type === 'task')
			div.className =
				'rounded-lg bg-[#64748b] min-h-[200px] animate-pulse border border-dashed border-(--accent-hover) box-border transition-transform delay-150 duration-300';
		if (type === 'column')
			div.className =
				'rounded-lg bg-[#64748b] w-full h-full border animate-pulse border-dashed border-(--accent-hover) box-border transition-transform delay-150 duration-300 flex flex-1 flex-col';
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
