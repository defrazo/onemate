import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { toast } from 'sonner'; // или твоя библиотека уведомлений

import { appStore } from '@/shared/store/appStore'; // Импортируем appStore

// Компонент для показа уведомлений
const Notifications = observer(() => {
	useEffect(() => {
		// Если есть ошибка, показываем ошибку
		if (appStore.error) {
			toast.error(appStore.error);
			// Очистим ошибку после 3 секунд
			setTimeout(() => {
				appStore.clearMessages(); // Очистим состояние
			}, 3000);
		}

		// Если есть успешное сообщение, показываем успех
		if (appStore.success) {
			toast.success(appStore.success);
			// Очистим success после 3 секунд
			setTimeout(() => {
				appStore.clearMessages(); // Очистим состояние
			}, 3000);
		}
	}, [appStore.error, appStore.success]); // Следим за изменениями error и success

	return null; // Этот компонент ничего не рендерит, только управляет уведомлениями
});

export default Notifications;
