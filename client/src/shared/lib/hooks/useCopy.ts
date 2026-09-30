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

import { useStore } from '@/app/providers';

export const useCopy = () => {
	const { notifyStore } = useStore();

	return async (data: string, message?: string): Promise<void> => {
		try {
			await navigator.clipboard.writeText(data);
			notifyStore.setNotice(message ?? 'Данные скопированы', 'success');
		} catch {
			notifyStore.setNotice('Не удалось скопировать данные', 'error');
		}
	};
};
