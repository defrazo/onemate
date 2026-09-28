import { IconCheck, IconX } from '@tabler/icons-react';

import { cn } from '@/shared/lib/utils';

type Rule = {
	label: string;
	test: (password: string) => boolean;
};

const rules: Rule[] = [
	{ label: 'Минимум 8 символов', test: (password) => password.length >= 8 },
	{ label: 'Заглавная буква', test: (password) => /[A-Z]/.test(password) },
	{ label: 'Строчная буква', test: (password) => /[a-z]/.test(password) },
	{ label: 'Цифра', test: (password) => /\d/.test(password) },
	{ label: 'Только латиница', test: (password) => !/[А-Яа-яЁё]/.test(password) },
];

export const PasswordRules = ({ password, showHint }: { password: string; showHint: boolean }) => {
	const allRulesPassed = rules.every((rule) => rule.test(password));

	if (!showHint || !password || allRulesPassed) return null;

	return (
		<div className="absolute top-full z-40 mt-2 w-full rounded-xl border border-(--border-color) bg-(--bg-secondary) p-3 shadow-(--shadow) select-none">
			<p className="mb-2 text-xs font-bold text-(--color-secondary)">Требования к паролю</p>
			<ul className="grid grid-cols-2 gap-x-4 gap-y-1.5">
				{rules.map((rule) => {
					const passed = rule.test(password);
					const Icon = passed ? IconCheck : IconX;

					return (
						<li
							key={rule.label}
							className={cn(
								'flex items-center gap-1.5 text-xs transition-colors',
								passed ? 'text-(--color-disabled)' : 'text-(--color-secondary)'
							)}
						>
							<Icon
								className={cn(
									'size-3.5 shrink-0',
									passed ? 'text-(--status-success)' : 'text-(--status-error)'
								)}
							/>
							<span>{rule.label}</span>
						</li>
					);
				})}
			</ul>
		</div>
	);
};
