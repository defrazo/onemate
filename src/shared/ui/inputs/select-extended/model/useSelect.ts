import { useEffect, useRef, useState } from 'react';
import type { Direction } from '.';

export const useSelect = (direction: Direction = 'auto') => {
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [openUpwards, setOpenUpwards] = useState<boolean>(false);
	const wrapperRef = useRef<HTMLDivElement>(null);
	const buttonRef = useRef<HTMLButtonElement>(null);

	const toggle = () => {
		if (isOpen) {
			setIsOpen(false);
			return;
		}

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

		if (!buttonRef.current) return;

		const rect = buttonRef.current.getBoundingClientRect();
		const spaceBelow = window.innerHeight - rect.bottom;
		const spaceAbove = rect.top;

		setOpenUpwards(spaceBelow < 200 && spaceAbove > spaceBelow);
		setIsOpen(true);
	};

	useEffect(() => {
		const handleClickOut = (e: MouseEvent) => {
			if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setIsOpen(false);
		};
		document.addEventListener('mousedown', handleClickOut);
		return () => document.removeEventListener('mousedown', handleClickOut);
	}, []);

	return { toggle, isOpen, setIsOpen, openUpwards, wrapperRef, buttonRef };
};
