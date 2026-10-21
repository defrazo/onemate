import type { Note } from '.';

type NoteTemplate = Omit<Note, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

const DEFAULT_NOTES: NoteTemplate[] = [
	{ text: 'Добро пожаловать! Это твоя первая заметка – можешь отредактировать или удалить ее.', order_idx: 0 },
	{
		text: 'Иногда полезно просто сесть и выписать мысли. Даже если они кажутся бессмысленными – в процессе часто приходит что-то дельное.',
		order_idx: 1,
	},
	{
		text: 'Хочу перечитать пару статей про привычки и планирование – кажется, я снова начинаю все откладывать.',
		order_idx: 2,
	},
	{
		text: 'Напоминание: выдохни. Сделай паузу, налей чай, и не забудь, что не все должно быть идеально.',
		order_idx: 3,
	},
];

export const createDefaultNotes = (): NoteTemplate[] => DEFAULT_NOTES.map((n) => ({ ...n }));
