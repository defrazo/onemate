import { generateUUID } from '@/shared/lib/utils';

import type { TodoCanvas } from '.';

export const getDefaultTodoCanvases = (userId: string): TodoCanvas[] => {
	const timestamp = new Date().toISOString();
	const canvasId = generateUUID();

	const lists = [
		{
			title: 'На сегодня',
			color: 'sky',
			items: [
				{ text: 'Проверить почту', completed: true },
				{ text: 'Ответить на сообщения', completed: true },
				{ text: 'Разобрать документы', completed: false },
				{ text: 'Купить продукты', completed: false },
				{ text: 'Прогуляться вечером', completed: false },
			],
		},
		{
			title: 'Планы на неделю',
			color: 'amber',
			items: [
				{ text: 'Запланировать неделю', completed: true },
				{ text: 'Разобрать фотографии', completed: false },
				{ text: 'Навести порядок дома', completed: false },
				{ text: 'Встретиться с друзьями', completed: false },
				{ text: 'Закончить начатые дела', completed: false },
			],
		},
		{
			title: 'Покупки',
			color: 'emerald',
			items: [
				{ text: 'Молоко', completed: true },
				{ text: 'Хлеб', completed: true },
				{ text: 'Кофе', completed: false },
				{ text: 'Фрукты', completed: false },
				{ text: 'Батарейки', completed: false },
			],
		},
		{
			title: 'Домашние дела',
			color: 'rose',
			items: [
				{ text: 'Разобрать шкаф', completed: false },
				{ text: 'Протереть пыль', completed: true },
				{ text: 'Почистить принтер', completed: false },
				{ text: 'Пересадить растения', completed: false },
			],
		},
		{
			title: 'Разработка',
			color: 'violet',
			items: [
				{ text: 'Проверить адаптивность интерфейса', completed: true },
				{ text: 'Проверить обработку ошибок', completed: false },
				{ text: 'Оптимизировать компоненты', completed: false },
				{ text: 'Протестировать перетаскивание', completed: false },
				{ text: 'Подготовить обновление', completed: false },
			],
		},
		{
			title: 'Обучение',
			color: 'sky',
			items: [
				{ text: 'Прочитать статью по TypeScript', completed: true },
				{ text: 'Изучить новые возможности React', completed: false },
				{ text: 'Посмотреть технический доклад', completed: false },
				{ text: 'Закрепить знания на практике', completed: false },
			],
		},
		{
			title: 'Идеи',
			color: 'amber',
			items: [
				{ text: 'Попробовать новый инструмент', completed: false },
				{ text: 'Записать интересную мысль', completed: false },
				{ text: 'Придумать новый проект', completed: false },
				{ text: 'Собрать подборку полезных сервисов', completed: false },
			],
		},
		{
			title: 'Когда-нибудь',
			color: 'slate',
			items: [
				{ text: 'Обновить рабочее место', completed: false },
				{ text: 'Начать изучать новый язык', completed: false },
				{ text: 'Организовать небольшое путешествие', completed: false },
			],
		},
	];

	return [
		{
			id: canvasId,
			user_id: userId,
			title: 'Общее',
			created_at: timestamp,
			updated_at: timestamp,
			lists: lists.map((entry, slot) => {
				const listId = generateUUID();

				return {
					id: listId,
					canvas_id: canvasId,
					title: entry.title,
					color: entry.color,
					slot,
					is_collapsed: false,
					created_at: timestamp,
					updated_at: timestamp,
					items: entry.items.map(({ text, completed }, position) => ({
						id: generateUUID(),
						list_id: listId,
						text,
						is_completed: completed,
						position,
						created_at: timestamp,
						updated_at: timestamp,
					})),
				};
			}),
		},
	];
};
