/**
 * usePageTitle – хук для установки заголовка страницы (document.title).
 *
 * Устанавливает заголовок в формате: "[название страницы] | OneMate".
 * Если заголовок не передан, устанавливает только название приложения.
 *
 * @param title – название текущей страницы (например, "Настройки")
 */

import { useEffect } from 'react';

import { APP_NAME } from '../constants';

export const usePageTitle = (title?: string) => {
	useEffect(() => {
		document.title = title ? `${title} | ${APP_NAME}` : APP_NAME;
	}, [title]);
};
