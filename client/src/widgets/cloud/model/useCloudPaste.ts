import { useEffect, useRef } from 'react';

export const useCloudPaste = (onPaste: (files: File[]) => void, enabled = true) => {
	const hovered = useRef(false);
	const callback = useRef(onPaste);

	useEffect(() => {
		callback.current = onPaste;
	}, [onPaste]);

	useEffect(() => {
		if (!enabled) return;

		const handlePaste = (event: ClipboardEvent) => {
			if (!hovered.current) return;

			const target = event.target;
			if (target instanceof Element && target.closest('input, textarea, [contenteditable="true"]')) return;

			const files = Array.from(event.clipboardData?.files ?? []);
			if (!files.length) return;

			event.preventDefault();
			callback.current(files);
		};

		document.addEventListener('paste', handlePaste);

		return () => document.removeEventListener('paste', handlePaste);
	}, [enabled]);

	return {
		onPointerEnter: () => {
			hovered.current = true;
		},
		onPointerLeave: () => {
			hovered.current = false;
		},
	};
};
