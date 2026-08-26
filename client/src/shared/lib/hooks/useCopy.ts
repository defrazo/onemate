/**
 * useCopy – хук для копирования текста в буфер обмена с уведомлением.
 *
 * Возвращает функцию copy, которую можно вызывать в обработчиках.
 *
 * @returns (data: string, message?: string) => void
 *
 * Пример:
 *   const copy = useCopy();
 *   <Button onClick={() => copy("Текст", "Скопировано!")} />
 */

import copy from 'copy-to-clipboard';

import { useStore } from '@/app/providers';

export const useCopy = () => {
	const { notifyStore } = useStore();

	return (data: string, message?: string) => {
		copy(data);
		notifyStore.setNotice(message ?? 'Данные скопированы!', 'success');
	};
};
