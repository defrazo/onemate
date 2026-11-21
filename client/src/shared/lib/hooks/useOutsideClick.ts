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

export const useOutsideClick = <T extends HTMLElement>(callback: () => void, boundarySelector?: string) => {
	const ref = useRef<T>(null);

	useEffect(() => {
		const handleClick = (e: MouseEvent) => {
			const boundary = boundarySelector ? ref.current?.closest(boundarySelector) : ref.current;
			if (boundary && !boundary.contains(e.target as Node)) callback();
		};

		document.addEventListener('mousedown', handleClick);

		return () => document.removeEventListener('mousedown', handleClick);
	}, [callback, boundarySelector]);

	return ref;
};
