import type { City } from '@/entities/city';
import type { UserProfile } from '@/entities/user-profile';
import type { Theme } from '@/features/theme-switcher';
import type { AuthData } from '@/features/user-auth';
import type { CutLine, TextBlock } from '@/widgets/generator';
import type { Note } from '@/widgets/notes';
import type { Textbox } from '@/widgets/translator';
import type { Currency } from '@/widgets/сurrency';

import { AVATAR_OPTIONS } from '.';

const clone = <T>(v: T): T =>
	typeof structuredClone === 'function' ? structuredClone(v) : JSON.parse(JSON.stringify(v));

// --- Примитивы
export const DEFAULT_REDIRECT: string = 'http://92.248.239.2:3000/auth/callback';
export const DEFAULT_THEME: Theme = 'dark';
export const DEFAULT_AVATAR: string = AVATAR_OPTIONS[0];

const DEFAULT_WIDGETS = ['calculator', 'calendar', 'notes', 'currency', 'weather', 'translator'] as const;
type WidgetId = (typeof DEFAULT_WIDGETS)[number];
export const createDefaultWidgets = (): WidgetId[] => [...DEFAULT_WIDGETS];

// --- Шаблоны

const DEFAULT_AUTHFORM: AuthData = {
	username: '',
	password: '',
	passwordConfirm: '',
	email: '',
	authType: 'login',
};
export const createDefaultAuthForm = (): AuthData => ({ ...DEFAULT_AUTHFORM });

const DEFAULT_CITY: City = {
	id: '',
	name: 'Москва',
	region: 'Центральный',
	lat: 55.7558,
	lon: 37.6173,
	country: 'Russia',
};
export const createDefaultCity = (): City => ({ ...DEFAULT_CITY });

const DEFAULT_CURRENCIES: Currency[] = [
	{ type: 'base', code: 'USD', value: 1 },
	{ type: 'target', code: 'RUB', value: 0 },
];
export const createDefaultCurrencies = (): Currency[] => DEFAULT_CURRENCIES.map((c) => ({ ...c }));

const DEFAULT_TRANSLATOR: Textbox[] = [
	{ type: 'source', language: 'ru', text: '' },
	{ type: 'target', language: 'en', text: '' },
];
export const createDefaultTranslator = (): Textbox[] => DEFAULT_TRANSLATOR.map((t) => ({ ...t }));

type NoteTemplate = Omit<Note, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
const DEFAULT_NOTES: NoteTemplate[] = [
	{ text: 'Первая заметка', order_idx: 0 },
	{ text: 'Вторая заметка', order_idx: 1 },
	{ text: 'Третья заметка', order_idx: 2 },
];
export const createDefaultNotes = (): NoteTemplate[] => DEFAULT_NOTES.map((n) => ({ ...n }));

// --- Вложенные структуры
type GenState = {
	count: number;
	sizePt: [number, number];
	grid: [number, number];
	cutLine: CutLine;
	textBlocks: TextBlock[];
	svgRaw: string | null;
	svgWithText: string | null;
};
const DEFAULT_GENERATOR: GenState = {
	count: 1,
	sizePt: [0, 0],
	grid: [1, 1],
	cutLine: { paddingMm: 5, radiusMm: 10, visible: true },
	textBlocks: [
		{ id: 0, text: 'Текст надписи', isEnabled: true, x: 0, y: 0 },
		{ id: 1, text: 'Текст надписи', isEnabled: true, x: 0, y: 0 },
	],
	svgRaw: null,
	svgWithText: null,
};
export const createDefaultGenerator = (): GenState => clone(DEFAULT_GENERATOR);

const DEFAULT_PROFILE: UserProfile = {
	first_name: '',
	last_name: '',
	username: '',
	birth_year: '',
	birth_month: '',
	birth_day: '',
	gender: '',
	phone: [''],
	email: [''],
	mainEmail: '',
};
export const createDefaultProfile = (): UserProfile => clone(DEFAULT_PROFILE);
