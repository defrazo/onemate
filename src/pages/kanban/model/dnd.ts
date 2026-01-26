export const setupDnD = (board: HTMLElement, onDrop: (taskId: string, targetColumn: string) => void) => {
	const updateHandles = () => {
		board.querySelectorAll<HTMLElement>('[data-drag-handle]').forEach((handle) => {
			handle.draggable = true;

			handle.ondragstart = (event) => {
				const taskCard = handle.closest<HTMLElement>('[data-id]')!;
				event.dataTransfer!.setData('text/plain', taskCard.dataset.id!);

				// курсор
				const cardRect = taskCard.getBoundingClientRect();
				const handleRect = handle.getBoundingClientRect();
				const offsetX = handleRect.left - cardRect.left + handleRect.width;
				const offsetY = handleRect.top - cardRect.top;

				event.dataTransfer!.setDragImage(taskCard, offsetX, offsetY);

				// добавить обводку на drop зоны
				board.querySelectorAll<HTMLElement>('[data-tasks="true"]').forEach((tasksContainer) => {
					tasksContainer.classList.add('drag-over');
				});
			};
		});
	};

	updateHandles();

	// drop зоны
	board.querySelectorAll<HTMLElement>('[data-tasks="true"]').forEach((tasksContainer) => {
		tasksContainer.addEventListener('dragover', (e) => e.preventDefault());

		tasksContainer.addEventListener('drop', (e) => {
			e.preventDefault();
			const id = e.dataTransfer!.getData('text/plain');
			if (!id) return;

			onDrop(id, tasksContainer.dataset.column!);

			// убрать обводку после drop
			board.querySelectorAll<HTMLElement>('[data-tasks="true"]').forEach((tasksContainer) => {
				tasksContainer.classList.remove('drag-over');
			});

			updateHandles();
		});
	});

	// убрать обводку, если отпустили вне колонок
	board.addEventListener('dragend', () => {
		board.querySelectorAll<HTMLElement>('[data-tasks="true"]').forEach((tasksContainer) => {
			tasksContainer.classList.remove('highlight', 'drag-over');
		});
	});
};
