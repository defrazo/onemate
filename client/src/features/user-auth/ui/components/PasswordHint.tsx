import { useEffect } from 'react';

type PasswordRule = {
	label: string;
	test: (pass: string) => boolean;
};

const passwordRules: PasswordRule[] = [
	{ label: 'Минимум 8 символов', test: (pass) => pass.length >= 8 },
	{ label: 'Заглавная буква', test: (pass) => /[A-Z]/.test(pass) },
	{ label: 'Строчная буква', test: (pass) => /[a-z]/.test(pass) },
	{ label: 'Цифра', test: (pass) => /\d/.test(pass) },
	{ label: 'Только латиница', test: (pass) => !/[А-Яа-яЁё]/.test(pass) },
];

export const PasswordHint = ({ password, showHint }: { password: string; showHint: boolean }) => {
	const allRulesPassed = passwordRules.every((rule) => rule.test(password));
	const visible = showHint && password.length > 0 && !allRulesPassed;

	useEffect(() => {
		if (!password) return;
	}, [allRulesPassed]);

	if (!visible) return null;

	return (
		<div className="absolute top-full z-40 mt-2 w-full rounded-xl border border-(--accent-primary-hover-op) bg-(--bg-tertiary) p-2 text-sm backdrop-blur-sm select-none">
			<ul className="space-y-1">
				{passwordRules.map((rule, idx) => {
					const passed = rule.test(password);
					return (
						<li key={idx} className={passed ? 'text-(--status-success)' : 'text-(--status-error)'}>
							{passed ? '✔' : '✖'} {rule.label}
						</li>
					);
				})}
			</ul>
		</div>
	);
};
