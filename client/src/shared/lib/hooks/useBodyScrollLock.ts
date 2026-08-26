/**
 * useBodyScrollLock – хук для блокировки прокрутки страницы.
 *
 * При активации (locked = true) фиксирует положение страницы,
 * предотвращая ее прокрутку (например, при открытии модалки).
 * Сохраняет текущую позицию скролла и восстанавливает её при снятии блокировки.
 *
 * @param locked – флаг, определяющий, нужно ли заблокировать прокрутку
 */

import { useEffect } from 'react';

export const useBodyScrollLock = (locked: boolean) => {
	useEffect(() => {
		if (!locked) return;

		const body = document.body;
		const scrollY = window.scrollY;

		body.style.position = 'fixed';
		body.style.top = `-${scrollY}px`;
		body.style.left = '0';
		body.style.right = '0';
		body.style.width = '100%';
		body.style.overflow = 'hidden';
		body.style.overscrollBehavior = 'none';

		return () => {
			body.style.position = '';
			body.style.top = '';
			body.style.left = '';
			body.style.right = '';
			body.style.width = '';
			body.style.overflow = '';
			body.style.overscrollBehavior = '';

			window.scrollTo(0, scrollY);
		};
	}, [locked]);
};
