/**
 * useEscapeClose – хук для обработки нажатия клавиши Escape.
 *
 * При нажатии клавиши Escape вызывает переданный callback.
 * Может использоваться для закрытия модальных окон, меню и других всплывающих элементов.
 *
 * @param callback – функция, вызываемая при нажатии Escape
 */

import { useEffect } from 'react';

export const useEscapeClose = (callback?: () => void) => {
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') callback?.();
		};

		window.addEventListener('keydown', handleKeyDown);

		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [callback]);
};
