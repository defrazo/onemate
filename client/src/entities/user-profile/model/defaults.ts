import { DEFAULT_THEME } from '@/shared/config';

import type { UserProfile } from '.';

const clone = <T>(v: T): T =>
	typeof structuredClone === 'function' ? structuredClone(v) : JSON.parse(JSON.stringify(v));

const DEFAULT_WIDGETS = ['calculator', 'calendar', 'notes', 'currency', 'weather', 'translator'] as const;
type WidgetId = (typeof DEFAULT_WIDGETS)[number];
export const createDefaultWidgets = (): WidgetId[] => [...DEFAULT_WIDGETS];

const DEFAULT_SLOTS = ['calendar', 'weather', 'currency', 'notes'] as const;
export const createDefaultSlots = (): string[] => [...DEFAULT_SLOTS];

const DEFAULT_PROFILE: UserProfile = {
	avatar_url: null,
	first_name: '',
	last_name: '',
	birth_date: null,
	gender: '',
	location: null,
	phones: [''],
	additional_emails: [''],
	theme: DEFAULT_THEME,
	widgets_sequence: createDefaultWidgets(),
	widgets_slots: createDefaultSlots(),
	password_changed_at: null,
};
export const createDefaultProfile = (): UserProfile => clone(DEFAULT_PROFILE);

const DEMO_PROFILE: UserProfile = {
	avatar_url: null,
	first_name: 'Демо',
	last_name: 'Пользователь',
	birth_date: '2000-01-01',
	gender: '',
	location: null,
	phones: ['+7 (000) 000-00-00', ''],
	additional_emails: ['demo2@example.com', ''],
	theme: DEFAULT_THEME,
	widgets_sequence: createDefaultWidgets(),
	widgets_slots: createDefaultSlots(),
	password_changed_at: null,
};
export const createDemoProfile = (): UserProfile => clone(DEMO_PROFILE);
