import { useEffect, useState } from 'react';

interface AuthPassHintProps {
	password: string;
	showHint: boolean;
}

export const AuthPassHint = ({ password, showHint }: AuthPassHintProps) => {
	const [visible, setVisible] = useState(false);

	const passwordRules = [
		{ label: 'Минимум 8 символов', test: (pwd: string) => pwd.length >= 8 },
		{ label: 'Заглавная буква', test: (pwd: string) => /[A-Z]/.test(pwd) },
		{ label: 'Строчная буква', test: (pwd: string) => /[a-z]/.test(pwd) },
		{ label: 'Цифра', test: (pwd: string) => /\d/.test(pwd) },
	];

	const allRulesPassed = passwordRules.every((rule) => rule.test(password));

	useEffect(() => {
		setVisible(showHint && password.length > 0);
	}, [showHint, password]);

	useEffect(() => {
		if (allRulesPassed) setVisible(false);
		else password.length > 0 && setVisible(true);
	}, [password, allRulesPassed]);

	return (
		visible && (
			<div className="absolute top-full z-20 -mt-[1px] w-full rounded-b-lg bg-[var(--color-primary)] p-2 ring-1 ring-[var(--accent-default)] ring-inset">
				<ul className="space-y-1 text-sm">
					{passwordRules.map((rule, index) => {
						const passed = rule.test(password);
						return (
							<li
								key={index}
								className={passed ? 'text-[var(--status-success)]' : 'text-[var(--status-error)]'}
							>
								{passed ? '✔' : '✖'} {rule.label}
							</li>
						);
					})}
				</ul>
			</div>
		)
	);
};
