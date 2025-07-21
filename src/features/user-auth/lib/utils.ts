import { PasswordRule } from '../model';

export const passwordRules: PasswordRule[] = [
	{ label: 'Минимум 8 символов', test: (pass: string) => pass.length >= 8 },
	{ label: 'Заглавная буква', test: (pass: string) => /[A-Z]/.test(pass) },
	{ label: 'Строчная буква', test: (pass: string) => /[a-z]/.test(pass) },
	{ label: 'Цифра', test: (pass: string) => /\d/.test(pass) },
];
