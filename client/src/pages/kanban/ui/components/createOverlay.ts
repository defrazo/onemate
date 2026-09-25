let activeOverlays = 0;
let previousBodyOverflow = '';

export const createOverlay = ({ onClose }: { onClose?: () => void } = {}) => {
	let isClosed = false;

	const overlay = document.createElement('div');
	overlay.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-2 xl:p-4';
	overlay.tabIndex = -1;
	overlay.style.outline = 'none';

	// === ACTION FUNCTIONS ===
	function onClickOutside(event: MouseEvent) {
		if (event.target === overlay) close();
	}

	function onEscape(event: KeyboardEvent) {
		if (event.key === 'Escape') close();
	}

	function close() {
		if (isClosed) return;
		isClosed = true;

		overlay.removeEventListener('mousedown', onClickOutside);
		overlay.removeEventListener('keydown', onEscape);
		overlay.remove();

		activeOverlays--;
		if (activeOverlays === 0) document.body.style.overflow = previousBodyOverflow;

		onClose?.();
	}

	// === INIT ===
	overlay.addEventListener('mousedown', onClickOutside);
	overlay.addEventListener('keydown', onEscape);

	if (activeOverlays === 0) {
		previousBodyOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
	}

	activeOverlays++;

	queueMicrotask(() => {
		if (overlay.isConnected) overlay.focus({ preventScroll: true });
	});

	return { overlay, close };
};
