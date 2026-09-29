import { useCallback, useEffect, useRef, useState } from 'react';

import type { Direction } from '.';

const MIN_DROPDOWN_SPACE = 200;

export const useSelect = (direction: Direction = 'auto') => {
	const [isOpen, setIsOpen] = useState(false);
	const [openUpwards, setOpenUpwards] = useState(false);

	const wrapperRef = useRef<HTMLDivElement>(null);
	const buttonRef = useRef<HTMLButtonElement>(null);

	const close = useCallback(() => setIsOpen(false), []);

	const open = useCallback(() => {
		if (direction === 'up') {
			setOpenUpwards(true);
			setIsOpen(true);
			return;
		}

		if (direction === 'down') {
			setOpenUpwards(false);
			setIsOpen(true);
			return;
		}

		const button = buttonRef.current;
		if (!button) return;

		const rect = button.getBoundingClientRect();
		const spaceAbove = rect.top;
		const spaceBelow = window.innerHeight - rect.bottom;

		setOpenUpwards(spaceBelow < MIN_DROPDOWN_SPACE && spaceAbove > spaceBelow);
		setIsOpen(true);
	}, [direction]);

	const toggle = useCallback(() => {
		if (isOpen) close();
		else open();
	}, [isOpen, open, close]);

	useEffect(() => {
		if (!isOpen) return;

		const handlePointerDown = (event: PointerEvent) => {
			if (!wrapperRef.current?.contains(event.target as Node)) close();
		};

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				close();
				buttonRef.current?.focus();
			}
		};

		document.addEventListener('pointerdown', handlePointerDown);
		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.removeEventListener('pointerdown', handlePointerDown);
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [isOpen, close]);

	return { isOpen, openUpwards, wrapperRef, buttonRef, open, close, toggle };
};
