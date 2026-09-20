import { cn } from '@/shared/lib/utils';

interface SwitchProps {
	checked: boolean;
	disabled?: boolean;
	onCheckedChange?: (checked: boolean) => void;
}

export const Switch = ({ checked, disabled = false, onCheckedChange }: SwitchProps) => {
	const handleClick = () => {
		if (disabled) return;

		onCheckedChange?.(!checked);
	};

	return (
		<button
			aria-checked={checked}
			className={cn(
				'relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors',
				checked ? 'bg-(--accent-default)' : 'bg-(--bg-tertiary)',
				disabled && 'cursor-not-allowed opacity-40'
			)}
			disabled={disabled}
			role="switch"
			type="button"
			onClick={handleClick}
		>
			<span
				className={cn(
					'absolute top-1 left-1 size-4 rounded-full bg-white transition-transform',
					checked && 'translate-x-5'
				)}
			/>
		</button>
	);
};
