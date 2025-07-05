import { passwordRules } from '../lib';

interface PasswordHintProps {
	password: string;
	showHint: boolean;
}

export const PasswordHint = ({ password, showHint }: PasswordHintProps) => {
	const allRulesPassed = passwordRules.every((rule) => rule.test(password));
	const visible = showHint && password.length > 0 && !allRulesPassed;

	if (!visible) return null;

	return (
		<div className="core-border absolute top-full z-10 mt-2 w-full rounded-xl bg-[var(--bg-secondary)] p-2 select-none">
			<ul className="space-y-1">
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
	);
};
