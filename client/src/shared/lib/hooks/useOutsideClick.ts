/**
 * useOutsideClick – хук для обработки клика вне элемента.
 *
 * Возвращает ref, который необходимо привязать к DOM-элементу.
 * При клике за пределами этого элемента вызывается переданный callback.
 *
 * @param callback - функция, вызываемая при клике вне элемента
 * @returns ref для привязки к отслеживаемому элементу
 */

import { useEffect, useRef } from 'react';

export const useOutsideClick = <T extends HTMLElement>(callback: () => void) => {
	const ref = useRef<T>(null);

	useEffect(() => {
		const handleClick = (event: MouseEvent) => {
			if (ref.current && !ref.current.contains(event.target as Node)) callback();
		};

		document.addEventListener('mousedown', handleClick);

		return () => document.removeEventListener('mousedown', handleClick);
	}, [callback]);

	return ref;
};
