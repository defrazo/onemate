import { IconBulb, IconLanguage, IconMessageQuestion, IconPencil, IconSchool } from '@tabler/icons-react';

import type { AssistantMode } from './types';

export const LIMITS = {
	requests: 1000,
	tokens: 200000,
};

export const ASSISTANT_MAX_LENGTH = 4000;
export const ASSISTANT_MODES = [
	{
		id: 'ask',
		title: 'Спросить',
		description: 'Получить ответ или решение',
		placeholder: 'Задайте вопрос…',
		icon: IconMessageQuestion,
		color: 'bg-(--accent-primary)',
	},
	{
		id: 'explain',
		title: 'Объяснить',
		description: 'Разобраться, как и почему что-то работает',
		placeholder: 'Что хотите понять?',
		icon: IconSchool,
		color: 'bg-(--assistant-explain)',
	},
	{
		id: 'improve',
		title: 'Улучшить',
		description: 'Сделать текст понятнее и выразительнее',
		placeholder: 'Вставьте текст для улучшения…',
		icon: IconPencil,
		color: 'bg-(--assistant-improve)',
	},
	{
		id: 'translate',
		title: 'Перевести',
		description: 'Перевести текст на другой язык',
		placeholder: 'Вставьте текст для перевода…',
		icon: IconLanguage,
		color: 'bg-(--assistant-translate)',
	},
	{
		id: 'ideas',
		title: 'Идеи',
		description: 'Придумать варианты и найти лучший',
		placeholder: 'Что хотите придумать?',
		icon: IconBulb,
		color: 'bg-(--assistant-ideas)',
	},
] as const satisfies readonly {
	id: AssistantMode;
	title: string;
	description: string;
	placeholder: string;
	icon: typeof IconBulb;
	color: string;
}[];
