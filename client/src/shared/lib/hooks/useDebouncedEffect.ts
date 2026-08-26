/**
 * useDebouncedEffect – хук для отложенного выполнения эффекта.
 *
 * При изменении зависимостей effect будет вызван с задержкой delay (в мс).
 * Если зависимости изменятся снова до окончания delay – таймер сбрасывается.
 *
 * @param effect – функция, которую нужно выполнить
 * @param deps – зависимости, при изменении которых срабатывает эффект
 * @param delay – задержка перед вызовом effect (в мс)
 */

import { useEffect } from 'react';

export const useDebouncedEffect = (effect: () => void, deps: any[], delay: number) => {
	useEffect(() => {
		const handler = setTimeout(() => effect(), delay);
		return () => clearTimeout(handler);
	}, deps);
};
